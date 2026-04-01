import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ 
    children, variant = 'primary', className = '', ...props 
}) => {
    const base = "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]";
    const styles = {
        primary: "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20",
        outline: "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
    };

    return (
        <button className={`${base} ${styles[variant]} ${className}`} {...props}>
        {children}
        </button>
    );
};