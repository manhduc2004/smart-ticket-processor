import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  FileText, 
  Loader2, 
  Upload, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  Clock,
  FileUp,
  MoreHorizontal
} from 'lucide-react';
import { TicketTable } from './components/TicketTable';
import { type ChatMessage } from './types';
import { parseTicketFile } from '../../services/ticketService';

export const TicketParserChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      type: 'text',
      content: 'Xin chào! Tôi là trợ lý AI giúp bạn xử lý vé máy bay. Hãy tải lên file PDF chứa vé và tôi sẽ trích xuất dữ liệu cho bạn.',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate upload progress
  useEffect(() => {
    if (isLoading && uploadProgress < 90) {
      const timer = setTimeout(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 200);
      return () => clearTimeout(timer);
    }
    if (!isLoading) {
      setUploadProgress(0);
    }
  }, [isLoading, uploadProgress]);

  const processFile = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        type: 'error',
        content: 'Vui lòng tải lên file PDF. Định dạng file không được hỗ trợ.',
        timestamp: new Date()
      }]);
      return;
    }

    // Add User Message (File)
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      fileName: file.name,
      content: `Đã tải lên: ${file.name}`,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    setUploadProgress(10);

    try {
      const data = await parseTicketFile(file);
      setUploadProgress(100);
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'table',
        content: `Tuyệt vời! Tôi đã trích xuất thành công ${data.length} vé từ file của bạn.`,
        data: data,
        timestamp: new Date()
      }]);

    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'error',
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý file. Vui lòng kiểm tra file và thử lại.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Drag and Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden relative"
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-slate-900/95 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-white/40">
              <Upload size={40} className="text-white" />
            </div>
            <p className="text-xl font-semibold text-white mb-2">Thả file PDF tại đây</p>
            <p className="text-sm text-slate-400">Hỗ trợ định dạng .pdf</p>
          </div>
        </div>
      )}
      
      {/* --- Chat Header --- */}
      <div className="bg-slate-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Trợ lý AI xử lý vé</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-400">Đang hoạt động</span>
            </div>
          </div>
        </div>
        <button className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* --- Chat Messages List --- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-slate-900 text-white' 
                : msg.type === 'error' 
                  ? 'bg-red-100 text-red-600 border border-red-200' 
                  : 'bg-white text-slate-900 border border-slate-200'
            }`}>
              {msg.role === 'user' ? <User size={18} /> : msg.type === 'error' ? <XCircle size={18} /> : <Bot size={18} />}
            </div>

            {/* Message Content */}
            <div className={`max-w-[85%] sm:max-w-[80%] space-y-2`}>
              {/* Message Bubble */}
              <div className={`relative px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-2xl rounded-tr-md' 
                  : msg.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-800 rounded-2xl rounded-tl-md'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-md shadow-sm'
              }`}>
                {/* File Attachment Display */}
                {msg.fileName && (
                  <div className={`flex items-center gap-3 mb-2 pb-2 border-b ${
                    msg.role === 'user' ? 'border-white/20' : 'border-slate-100'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-white/15' : 'bg-slate-100'
                    }`}>
                      <FileText size={16} className={msg.role === 'user' ? 'text-white/80' : 'text-slate-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate text-sm ${msg.role === 'user' ? 'text-white' : 'text-slate-700'}`}>
                        {msg.fileName}
                      </p>
                      <p className={`text-xs ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>PDF</p>
                    </div>
                    <CheckCircle2 size={16} className={msg.role === 'user' ? 'text-emerald-400' : 'text-emerald-500'} />
                  </div>
                )}
                
                {/* Text Content */}
                {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
              </div>

              {/* Table Content (Only for Assistant) */}
              {msg.type === 'table' && msg.data && (
                <div className="mt-3">
                  <TicketTable data={msg.data} />
                </div>
              )}
              
              {/* Timestamp */}
              <div className={`flex items-center gap-1.5 px-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Clock size={10} className="text-slate-400" />
                <span className="text-[11px] text-slate-400 font-medium">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
              <Bot size={18} />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="relative">
                  <Loader2 size={18} className="animate-spin text-slate-900" />
                </div>
                <div>
                  <span className="text-sm text-slate-700 font-medium">Đang xử lý file...</span>
                  <p className="text-xs text-slate-400 mt-0.5">Trích xuất dữ liệu vé máy bay</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="h-1 bg-slate-100">
                <div 
                  className="h-full bg-slate-900 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Input Area --- */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Quick Upload Zone */}
          <div 
            onClick={!isLoading ? triggerFileInput : undefined}
            className={`group mb-3 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isLoading 
                ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' 
                : 'border-slate-300 hover:border-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isLoading ? 'bg-slate-200' : 'bg-slate-100 group-hover:bg-slate-900'
              }`}>
                <FileUp size={20} className={`transition-colors ${isLoading ? 'text-slate-400' : 'text-slate-600 group-hover:text-white'}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium text-sm ${isLoading ? 'text-slate-400' : 'text-slate-700'}`}>
                  {isLoading ? 'Đang xử lý...' : 'Nhấn để tải lên hoặc kéo thả file'}
                </p>
                <p className="text-xs text-slate-400">Hỗ trợ định dạng PDF</p>
              </div>
            </div>
          </div>
          
          {/* Input Row */}
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf"
              aria-label="Tải tập tin lên"
              title="Tải tập tin lên"
            />
            
            <button 
              onClick={triggerFileInput}
              disabled={isLoading}
              className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Tải lên file"
            >
              <Paperclip size={20} />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                disabled={true}
                placeholder="Tải lên vé máy bay để xử lý..."
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button 
                disabled={true}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-300 text-white rounded-lg cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>Bảo mật SSL</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <FileText size={12} />
              <span>Hỗ trợ PDF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
