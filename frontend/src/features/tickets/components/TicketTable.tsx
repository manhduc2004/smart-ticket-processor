// src/features/tickets/components/TicketTable.tsx

import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { type TicketData } from '../types';
import { downloadTicketExcel } from '../../../services/ticketService';

interface TicketTableProps {
  data: TicketData[];
}

export const TicketTable: React.FC<TicketTableProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Helper format tiền tệ
  const formatMoney = (amount: number | null, currency: string) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'decimal', // Dùng decimal gọn hơn currency cho bảng nhiều số
      minimumFractionDigits: 0 
    }).format(amount) + ` ${currency}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-2 max-w-full">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-green-600" size={20}/>
            <span className="font-semibold text-slate-700">Kết quả trích xuất ({data.length} vé)</span>
        </div>
        <button 
            onClick={() => downloadTicketExcel(data)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
            <Download size={16} /> Xuất Excel
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 whitespace-nowrap">
            <tr>
              <th className="px-4 py-3">Hãng</th>
              <th className="px-4 py-3">Số vé</th>
              <th className="px-4 py-3">Cust ID</th>
              <th className="px-4 py-3 text-right">Giá Mua (Buying)</th>
              <th className="px-4 py-3 text-right">Giá Bán (Selling)</th>
              <th className="px-4 py-3 text-right">Fare</th>
            </tr>
          </thead>
          <tbody>
            {data.map((ticket, index) => (
              <tr key={ticket.id || index} className="bg-white border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{ticket.airlines}</td>
                <td className="px-4 py-3 font-mono">{ticket.ticket_number}</td>
                <td className="px-4 py-3 font-mono text-indigo-600">{ticket.cust_id || '-'}</td>
                
                {/* Giá Mua */}
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {formatMoney(ticket.buying, ticket.currency)}
                </td>
                
                {/* Giá Bán */}
                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                  {formatMoney(ticket.selling, ticket.currency)}
                </td>

                {/* Fare */}
                <td className="px-4 py-3 text-right text-slate-500">
                  {formatMoney(ticket.fare, ticket.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};