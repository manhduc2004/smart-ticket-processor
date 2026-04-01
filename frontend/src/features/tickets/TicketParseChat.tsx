import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, FileText, Loader2 } from 'lucide-react';
import { TicketTable } from './components/TicketTable';
import { type ChatMessage } from './types';
import { parseTicketFile } from '../../services/ticketService';
import { Button } from '../../components/Button';

export const TicketParserChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      type: 'text',
      content: 'Xin chào! Vui lòng tải lên file ảnh hoặc PDF chứa vé máy bay. Tôi sẽ giúp bạn trích xuất dữ liệu ra Excel.',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Add User Message (File)
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      type: 'text',
      fileName: file.name,
      content: `Đã gửi file: ${file.name}`,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      // 2. Call API to parse
      const data = await parseTicketFile(file);

      // 3. Add Bot Message (Table)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'table',
        data: data,
        timestamp: new Date()
      }]);

    } catch  {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'error',
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý file. Vui lòng thử lại.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* --- Chat Header --- */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3 shadow-sm z-10">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Trợ lý xử lý vé</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Sẵn sàng nhận file
          </p>
        </div>
      </div>

      {/* --- Chat Messages List --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-indigo-600'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble Content */}
            <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  {/* Text Content / File Name */}
                  {msg.fileName && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/30">
                          <FileText size={16} className="text-slate-300"/>
                          <span className="font-medium">{msg.fileName}</span>
                      </div>
                  )}
                  {msg.content && <p>{msg.content}</p>}
                </div>

                {/* Table Content (Only for Assistant) */}
                {msg.type === 'table' && msg.data && (
                    <TicketTable data={msg.data} />
                )}
                
                {/* Timestamp */}
                <span className={`text-[10px] text-slate-400 block px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600">
               <Bot size={16} />
             </div>
             <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                <span className="text-sm text-slate-600">Đang đọc dữ liệu từ vé...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Input Area --- */}
      <div className="bg-white p-4 border-t border-slate-200">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf"
            aria-label='Tải tập tin lên'
            title='Tải tập tin lên'
          />
          
          <Button 
            onClick={triggerFileInput}
            disabled={isLoading}
            className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 disabled:opacity-50"
            title="Tải lên file"
          >
            <Paperclip size={20} />
          </Button>

          <div className="flex-1 relative">
             <input
                type="text"
                disabled={isLoading}
                placeholder="Tải lên vé máy bay để xử lý..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50"
             />
             <Button 
                disabled={true} // Tạm thời disable text input vì tính năng chính là file
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-200 text-white rounded-lg cursor-not-allowed"
             >
                <Send size={16} />
             </Button>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
            Hỗ trợ định dạng: .pdf
        </p>
      </div>
    </div>
  );
};