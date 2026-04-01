import React from 'react';
import { Plane } from 'lucide-react';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans text-slate-900">
        {/* Cột Trái: Nội dung */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12">
            <div className="w-full max-w-sm">{children}</div>
        </div>

        {/* Cột Phải: Hình ảnh và mô tả */}
        <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10"></div>
            <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074" 
            alt="Plane" 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="relative z-20 text-white p-12 max-w-lg">
                <div className="w-12 h-12 bg-white/10 backdrop-blur border border-white/20 rounded-xl flex items-center justify-center mb-6">
                    <Plane size={24} />
                </div>
                <h2 className="text-4xl font-bold mb-4">Flight Automation</h2>
                <p className="text-slate-300">Giao diện quản lý vé máy bay chuyên nghiệp</p>
            </div>
        </div>
    </div>
  );
};