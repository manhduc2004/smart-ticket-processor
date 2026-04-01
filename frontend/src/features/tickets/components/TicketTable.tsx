// src/features/tickets/components/TicketTable.tsx

import React, { useState } from 'react';
import { Download, FileSpreadsheet, ChevronDown, ChevronUp, Plane, Copy, Check } from 'lucide-react';
import { type TicketData } from '../types';
import { downloadTicketExcel } from '../../../services/ticketService';

interface TicketTableProps {
  data: TicketData[];
}

export const TicketTable: React.FC<TicketTableProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  if (!data || data.length === 0) return null;

  // Helper format tiền tệ
  const formatMoney = (amount: number | null, currency: string) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'decimal',
      minimumFractionDigits: 0 
    }).format(amount) + ` ${currency}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate totals
  const totalBuying = data.reduce((sum, t) => sum + (t.buying || 0), 0);
  const totalSelling = data.reduce((sum, t) => sum + (t.selling || 0), 0);
  const currency = data[0]?.currency || 'VND';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-900">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <FileSpreadsheet className="text-white" size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Kết quả trích xuất</h4>
              <p className="text-xs text-slate-400">{data.length} vé được tìm thấy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => downloadTicketExcel(data)}
              className="flex items-center gap-2 px-3 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              <Download size={14} /> Xuất Excel
            </button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400">Tổng mua</p>
            <p className="text-sm font-semibold text-white">{formatMoney(totalBuying, currency)}</p>
          </div>
          <div className="bg-emerald-500/20 rounded-lg px-3 py-2">
            <p className="text-xs text-emerald-300">Tổng bán</p>
            <p className="text-sm font-semibold text-emerald-400">{formatMoney(totalSelling, currency)}</p>
          </div>
        </div>
      </div>
      
      {/* Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 whitespace-nowrap">
              <tr>
                <th className="px-4 py-3 font-semibold">Hãng bay</th>
                <th className="px-4 py-3 font-semibold">Số vé</th>
                <th className="px-4 py-3 font-semibold">Mã KH</th>
                <th className="px-4 py-3 text-right font-semibold">Giá mua</th>
                <th className="px-4 py-3 text-right font-semibold">Giá bán</th>
                <th className="px-4 py-3 text-right font-semibold">Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((ticket, index) => (
                <tr 
                  key={ticket.id || index} 
                  className="bg-white hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center">
                        <Plane size={14} className="text-slate-600" />
                      </div>
                      <span className="font-medium text-slate-900">{ticket.airlines}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                        {ticket.ticket_number}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(ticket.ticket_number, ticket.id || index.toString())}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                        title="Sao chép"
                      >
                        {copiedId === (ticket.id || index.toString()) 
                          ? <Check size={12} className="text-emerald-500" />
                          : <Copy size={12} className="text-slate-400" />
                        }
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-slate-600">
                      {ticket.cust_id || <span className="text-slate-300">-</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-slate-900">
                      {formatMoney(ticket.buying, ticket.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-emerald-600">
                      {formatMoney(ticket.selling, ticket.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {formatMoney(ticket.fare, ticket.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Footer */}
      {isExpanded && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">Hiển thị {data.length} kết quả</p>
          <button 
            onClick={() => downloadTicketExcel(data)}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
          >
            <Download size={12} /> Tải xuống
          </button>
        </div>
      )}
    </div>
  );
};
