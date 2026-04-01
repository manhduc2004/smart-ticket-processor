import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, FileText, Loader2, Upload, CheckCircle2, AlertCircle, Sparkles, Clock, X, File } from 'lucide-react';
import { TicketTable } from './components/TicketTable';
import { type ChatMessage } from './types';
import { parseTicketFile } from '../../services/ticketService';

export const TicketParserChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      type: 'text',
      content: 'Xin chao! Toi la tro ly xu ly ve may bay. Tai len file PDF de toi giup ban trich xuat du lieu.',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  const processFile = async (file: File) => {
    // 1. Add User Message (File)
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      type: 'text',
      fileName: file.name,
      content: `Da gui file: ${file.name}`,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    setSelectedFile(null);

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

    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'error',
        content: 'Xin loi, da co loi xay ra khi xu ly file. Vui long thu lai.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleSendFile = () => {
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
        isDragOver 
          ? 'border-emerald-400 ring-4 ring-emerald-100' 
          : 'border-slate-200 shadow-lg shadow-slate-200/50'
      }`}
    >
      
      {/* --- Chat Header --- */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles size={24} className="text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Tro ly AI xu ly ve</h3>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                San sang ho tro
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg">
            <Clock size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400">Phan hoi trong vai giay</span>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-emerald-50/95 z-50 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Upload size={40} className="text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-800">Tha file vao day</p>
            <p className="text-sm text-emerald-600 mt-1">Ho tro dinh dang PDF</p>
          </div>
        </div>
      )}

      {/* --- Chat Messages List --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50/50 to-white">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 ${msg.role === 'user' ? 'ml-2' : 'mr-2'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white' 
                  : 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
            </div>

            {/* Bubble Content */}
            <div className={`max-w-[80%] sm:max-w-[70%] space-y-2`}>
              {/* Role Label */}
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                msg.role === 'user' ? 'text-slate-500 text-right block' : 'text-emerald-600'
              }`}>
                {msg.role === 'user' ? 'Ban' : 'Tro ly AI'}
              </span>

              {/* Message Bubble */}
              <div className={`relative group`}>
                <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-md' 
                    : msg.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-md'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-md'
                }`}>
                  
                  {/* File Attachment */}
                  {msg.fileName && (
                    <div className={`flex items-center gap-3 mb-3 pb-3 border-b ${
                      msg.role === 'user' ? 'border-slate-700/30' : 'border-slate-200'
                    }`}>
                      <div className={`p-2 rounded-lg ${
                        msg.role === 'user' ? 'bg-slate-700/50' : 'bg-emerald-100'
                      }`}>
                        <FileText size={16} className={msg.role === 'user' ? 'text-emerald-400' : 'text-emerald-600'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${
                          msg.role === 'user' ? 'text-white' : 'text-slate-900'
                        }`}>{msg.fileName}</p>
                        <p className={`text-xs ${
                          msg.role === 'user' ? 'text-slate-400' : 'text-slate-500'
                        }`}>PDF Document</p>
                      </div>
                      <CheckCircle2 size={18} className={msg.role === 'user' ? 'text-emerald-400' : 'text-emerald-500'} />
                    </div>
                  )}

                  {/* Error Icon */}
                  {msg.type === 'error' && (
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p>{msg.content}</p>
                    </div>
                  )}

                  {/* Text Content */}
                  {msg.content && msg.type !== 'error' && <p className="whitespace-pre-wrap">{msg.content}</p>}
                </div>
              </div>

              {/* Table Content (Only for Assistant) */}
              {msg.type === 'table' && msg.data && (
                <div className="mt-3">
                  <TicketTable data={msg.data} />
                </div>
              )}
              
              {/* Timestamp */}
              <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Clock size={12} className="text-slate-400" />
                <span className="text-xs text-slate-400">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
              <Bot size={18} className="text-white" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Tro ly AI</span>
              <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-md shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Loader2 size={20} className="animate-spin text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Dang xu ly...</p>
                    <p className="text-xs text-slate-500">Dang doc va trich xuat du lieu tu file</p>
                  </div>
                </div>
                {/* Progress dots animation */}
                <div className="flex items-center gap-1 mt-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Input Area --- */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          {/* Selected File Preview */}
          {selectedFile && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <File size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900">{selectedFile.name}</p>
                  <p className="text-xs text-emerald-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button 
                onClick={clearSelectedFile}
                className="p-1.5 hover:bg-emerald-200 rounded-lg transition-colors"
              >
                <X size={16} className="text-emerald-700" />
              </button>
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf"
              aria-label="Tai tap tin len"
              title="Tai tap tin len"
            />
            
            {/* Upload Button */}
            <button 
              onClick={triggerFileInput}
              disabled={isLoading}
              className="p-3.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-slate-200 hover:border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              title="Tai len file PDF"
            >
              <Paperclip size={20} className="group-hover:rotate-12 transition-transform" />
            </button>

            {/* Message Input Area */}
            <div className="flex-1 relative">
              <div 
                onClick={!isLoading ? triggerFileInput : undefined}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center gap-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload size={16} className="text-slate-400" />
                <span className="text-slate-500">
                  {selectedFile ? 'Nhan nut gui de xu ly file' : 'Nhan de chon hoac keo tha file PDF vao day...'}
                </span>
              </div>
            </div>

            {/* Send Button */}
            <button 
              onClick={handleSendFile}
              disabled={!selectedFile || isLoading}
              className={`p-3.5 rounded-xl transition-all flex items-center justify-center ${
                selectedFile && !isLoading
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title={selectedFile ? 'Gui file' : 'Chon file truoc'}
            >
              <Send size={20} />
            </button>
          </div>

          {/* Supported Formats */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="text-xs text-slate-400">Ho tro:</span>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg">
              <FileText size={12} className="text-red-500" />
              <span className="text-xs text-slate-600 font-medium">PDF</span>
            </div>
            <span className="text-xs text-slate-400">Keo tha hoac nhan de tai len</span>
          </div>
        </div>
      </div>
    </div>
  );
};
