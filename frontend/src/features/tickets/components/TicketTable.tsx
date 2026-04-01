// src/features/tickets/components/TicketTable.tsx

import React from 'react';
import { Download, FileSpreadsheet, Table2, ChevronRight, Plane } from 'lucide-react';
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
      style: 'decimal',
      minimumFractionDigits: 0 
    }).format(amount) + ` ${currency}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg shadow-slate-200/50">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Table2 className="text-emerald-600" size={20}/>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Ket qua trich xuat</h4>
            <p className="text-xs text-slate-500">Tim thay {data.length} ve may bay</p>
          </div>
        </div>
        <button 
          onClick={() => downloadTicketExcel(data)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105 group"
        >
          <FileSpreadsheet size={16} />
          <span>Xuat Excel</span>
          <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Plane size={14} />
                  Hang bay
                </div>
              </th>
              <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">So ve</th>
              <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Cust ID</th>
              <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Gia Mua</th>
              <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Gia Ban</th>
              <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Fare</th>
              <th className="px-4 py-3.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((ticket, index) => (
              <tr 
                key={ticket.id || index} 
                className="bg-white hover:bg-emerald-50/50 transition-colors group"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Plane size={14} className="text-slate-600 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <span className="font-semibold text-slate-900">{ticket.airlines}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">
                    {ticket.ticket_number}
                  </code>
                </td>
                <td className="px-4 py-4">
                  {ticket.cust_id ? (
                    <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                      {ticket.cust_id}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-semibold text-slate-900">
                    {formatMoney(ticket.buying, ticket.currency)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-semibold text-emerald-600">
                    {formatMoney(ticket.selling, ticket.currency)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-slate-500">
                    {formatMoney(ticket.fare, ticket.currency)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">Tong cong: {data.length} ve</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Nhan "Xuat Excel" de tai ve</span>
        </div>
      </div>
    </div>
  );
};
