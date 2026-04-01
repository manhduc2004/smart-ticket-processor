import api from '../utils/api';
import { type TicketData } from '../features/tickets/types';

/**
 * Gửi file vé máy bay lên server (Backend xử lý thật)
 */
export const parseTicketFile = async (file: File): Promise<TicketData[]> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/tickets/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // Tăng lên 120s (2 phút) để an toàn với file PDF dài
    });

    return response.data.tickets || [];
    
  } catch (error) {
    console.error("Parse error:", error);
    throw error;
  }
};

/**
 * Gửi danh sách vé lên server để nhận về file Excel
 */
export const downloadTicketExcel = async (tickets: TicketData[]) => {
  try {
    // 1. Tạo tên file theo định dạng mong muốn: Output_Ticket_DD_MM_YYYY
    const d = new Date();
    const fileName = `Output_Ticket_${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`;

    // 2. Gọi API export, truyền tên file qua query params
    const response = await api.post(`/tickets/export?filename=${fileName}`, tickets, {
      responseType: 'blob', // Quan trọng: Nhận binary data
    });

    // 3. Tạo link tải ảo và kích hoạt tải xuống
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Đặt tên file cho trình duyệt (đảm bảo đuôi .xlsx)
    link.setAttribute('download', `${fileName}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    
    // Dọn dẹp
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Export failed:', error);
    alert('Không thể tải file Excel. Vui lòng thử lại.');
  }
};