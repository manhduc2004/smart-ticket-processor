// src/features/tickets/types/index.ts

export interface TicketData {
  // Những trường này khớp với JSON trả về từ Backend
  airlines: string;
  ticket_number: string;
  cust_id: string | null;
  buying: number | null;
  selling: number | null;
  commission_buying: number | null;
  commission_selling: number | null;
  fare: number | null;
  currency: string;
  admin_amount: number | null;
  service: string | null;
  note: string | null;
  
  // Trường này Frontend tự sinh ra để làm key cho React list (vì backend không trả id)
  id?: string; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  type: 'text' | 'table' | 'error';
  content?: string;
  data?: TicketData[];
  fileName?: string;
  timestamp: Date;
}