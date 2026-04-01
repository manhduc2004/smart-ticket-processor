import React from 'react';
import { type LucideIcon } from 'lucide-react'; 

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  label: string;
}

export const Input: React.FC<InputProps> = ({ icon: Icon, label, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          </div>
        )}
        <input
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all text-slate-900 placeholder:text-slate-400 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};