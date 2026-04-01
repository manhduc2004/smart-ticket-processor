from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import os
import pypdf
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.ticket import TicketData, TicketParseResponse
from app.service.ollama_service import ollama_service
from app.service.excel_service import excel_service

router = APIRouter()

@router.post("/parse", response_model=TicketParseResponse)
async def parse_tickets(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Nhận file PDF/Text -> Đọc nội dung -> Gửi AI parse -> Trả về JSON vé.
    """
    try:
        # 1. Kiểm tra định dạng file
        if not file.filename.lower().endswith(('.pdf', '.txt')):
            raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file .pdf hoặc .txt")

        # 2. Đọc nội dung file
        content = await file.read()
        text_content = ""

        if file.filename.lower().endswith('.pdf'):
            # Xử lý PDF
            try:
                pdf_stream = io.BytesIO(content)
                reader = pypdf.PdfReader(pdf_stream)
                for page in reader.pages:
                    text_content += page.extract_text() + "\n"
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Lỗi đọc PDF: {str(e)}")
        else:
            # Xử lý Text
            text_content = content.decode("utf-8")

        if not text_content.strip():
            raise HTTPException(status_code=400, detail="Không tìm thấy nội dung văn bản trong file")

        # 3. Gửi cho AI xử lý (Ollama)
        # QUAN TRỌNG: Phải có 'await' vì service là async
        tickets = await ollama_service.parse_tickets(text_content)
        
        return TicketParseResponse(
            success=True,
            tickets=tickets,
            total=len(tickets),
            message=f"Đã trích xuất {len(tickets)} vé từ file {file.filename}"
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error parsing ticket: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")


@router.post("/export", response_class=FileResponse)
def export_to_excel(
    tickets: List[TicketData],
    filename: Optional[str] = None, # <-- Thêm tham số nhận tên file
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Nhận danh sách vé (JSON) -> Xuất ra file Excel -> Trả về file download.
    """
    try:
        if not tickets:
            raise HTTPException(status_code=400, detail="Danh sách vé trống")

        # 1. Tạo thư mục exports
        output_dir = "exports"
        os.makedirs(output_dir, exist_ok=True)

        # 2. Tạo file Excel
        filepath = excel_service.export(tickets, output_dir=output_dir)

        if not os.path.exists(filepath):
            raise HTTPException(status_code=500, detail="Lỗi tạo file Excel")

        # 3. Xử lý tên file trả về
        if filename:
            # Nếu frontend gửi tên lên thì dùng tên đó
            download_name = filename if filename.endswith('.xlsx') else f"{filename}.xlsx"
        else:
            # Nếu không, tự sinh mặc định
            timestamp = datetime.now().strftime("%d_%m_%Y")
            download_name = f"Output_Ticket_{timestamp}.xlsx"

        # 4. Trả về file
        return FileResponse(
            path=filepath,
            filename=download_name,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error export excel: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi xuất Excel: {str(e)}")