import json
import re
from typing import List, Any
import ollama

from app.prompts.ticket_parser_prompt import TICKET_PARSER_SYSTEM_PROMPT, get_user_prompt
from app.schemas.ticket import TicketData

class OllamaService:
    """Service gọi Ollama local LLM để parse vé."""

    def __init__(self, model: str = "llama3.2:3b"):
        self.model = model
        self.client = ollama.Client()

    async def parse_tickets(self, ticket_text: str) -> List[TicketData]:
        """
        Parse text vé -> list TicketData.
        """
        print(f"--- BẮT ĐẦU GỬI SANG OLLAMA ({len(ticket_text)} ký tự) ---")
        prompt = get_user_prompt(ticket_text)
        
        try:
            # Gọi Ollama
            response = self.client.chat(
                model=self.model,
                messages=[
                    {"role": "system", "content": TICKET_PARSER_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                options={
                    "temperature": 0.1, 
                    "num_ctx": 4096,    
                },
            )

            raw_response = response["message"]["content"]
            
            # --- DEBUG LOG: In ra để xem AI trả về cái gì ---
            print("--- RAW AI RESPONSE ---")
            print(raw_response[:500] + "...") # Chỉ in 500 ký tự đầu để đỡ rối
            print("-----------------------")

            # 1. Trích xuất JSON string
            json_str = self._extract_json(raw_response)
            
            # 2. Parse JSON
            try:
                data = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"JSON Decode Error ban đầu: {e}. Đang thử sửa lỗi...")
                # Thử fix lỗi phổ biến: dấu phẩy thừa ở cuối mảng/object
                json_str = re.sub(r',\s*([\]}])', r'\1', json_str)
                data = json.loads(json_str)

            # 3. Validate và Convert dữ liệu an toàn
            tickets = []
            if isinstance(data, list):
                for idx, item in enumerate(data):
                    try:
                        # Làm sạch dữ liệu trước khi đưa vào Pydantic
                        clean_item = self._sanitize_ticket_data(item)
                        tickets.append(TicketData(**clean_item))
                    except Exception as e:
                        print(f"Lỗi dòng {idx}: Không thể tạo TicketData từ {item}. Chi tiết: {e}")
                        # Không raise lỗi để tránh chết cả request, chỉ bỏ qua dòng lỗi
                        continue
            
            print(f"--- THÀNH CÔNG: Trích xuất được {len(tickets)} vé ---")
            return tickets

        except Exception as e:
            print(f"CRITICAL ERROR in OllamaService: {e}")
            # Trả về mảng rỗng để không bị lỗi 500 ở Frontend, 
            # nhưng in lỗi ra console để debug.
            return []

    def _extract_json(self, text: str) -> str:
        """Extract JSON từ response (loại bỏ markdown)."""
        # Tìm block ```json ... ```
        match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', text, re.DOTALL)
        if match:
            return match.group(1)

        # Tìm mảng JSON [...]
        match = re.search(r'(\[\s*\{.*\}\s*\])', text, re.DOTALL)
        if match:
            return match.group(1)

        # Nếu không tìm thấy pattern, trả về nguyên gốc (hy vọng nó là json)
        return text

    def _sanitize_ticket_data(self, item: dict) -> dict:
        """
        Làm sạch dữ liệu thô từ AI để khớp với Schema.
        Ví dụ: chuyển "1.000.000" thành 1000000.
        """
        # Danh sách các trường cần là số
        number_fields = ['buying', 'selling', 'commission_buying', 'commission_selling', 'fare', 'admin_amount']
        
        for field in number_fields:
            val = item.get(field)
            if val is not None:
                item[field] = self._parse_number(val)
        
        # Đảm bảo các trường string không bị null nếu schema yêu cầu (tùy chọn)
        if item.get('currency') is None:
            item['currency'] = 'VND'
            
        return item

    def _parse_number(self, value: Any) -> float | None:
        """Chuyển đổi chuỗi tiền tệ bất kỳ sang số float/int."""
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return value
        
        # Nếu là string, xử lý các ký tự lạ
        if isinstance(value, str):
            # Xóa chữ cái, giữ lại số, dấu chấm, dấu phẩy, dấu trừ
            clean_str = re.sub(r'[^\d.,-]', '', value)
            if not clean_str:
                return None
            
            # Xử lý trường hợp 1.000.000 (Việt Nam) vs 1,000,000 (US)
            # Logic đơn giản: Xóa hết dấu chấm và phẩy nếu nó là phân cách hàng nghìn
            # Nếu chuỗi có cả chấm và phẩy (VD: 1,234.56), cần logic phức tạp hơn.
            # Ở đây giả sử vé máy bay VN thường là số nguyên.
            
            try:
                # Cách an toàn nhất cho tiền VNĐ: xóa hết dấu phân cách
                # 3.576.000 -> 3576000
                # 3,576,000 -> 3576000
                final_str = clean_str.replace('.', '').replace(',', '')
                return float(final_str)
            except ValueError:
                return None
                
        return None

ollama_service = OllamaService()