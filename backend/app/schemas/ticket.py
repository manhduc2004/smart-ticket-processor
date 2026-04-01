from pydantic import BaseModel, Field
from typing import Optional


class TicketData(BaseModel):
    """Dữ liệu 1 vé sau khi parse."""
    airlines: Optional[str] = None
    ticket_number: Optional[str] = None
    cust_id: Optional[str] = None
    selling: Optional[int] = None
    commission_selling: Optional[int] = None
    buying: Optional[int] = None
    commission_buying: Optional[int] = None
    currency: Optional[str] = None
    fare: Optional[int] = None
    admin_amount: Optional[int] = None
    service: Optional[str] = None
    note: Optional[str] = None


class TicketParseRequest(BaseModel):
    """Request parse vé từ text."""
    text: str = Field(..., description="Nội dung mặt vé (1A/1B/1G)")


class TicketParseResponse(BaseModel):
    """Response trả về danh sách vé đã parse."""
    success: bool
    tickets: list[TicketData]
    total: int
    message: Optional[str] = None