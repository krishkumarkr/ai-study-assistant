import React from 'react'

const Button = ({
  children,
  onClick,
  type = "button",
  disabled =false,
  className = "",
  variant = "primary",
  size = "md",
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap outline-hidden';
    
    const variantStyles = {
        primary: 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]',
        secondary: 'bg-white/[0.03] text-zinc-300 border border-white/10 backdrop-blur-md hover:bg-white/[0.08] hover:text-white',
        outline: 'bg-transparent border-2 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5',
        danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all',
    };

    const sizeStyles = {
        sm: 'h-9 px-4 text-xs tracking-wider uppercase',
        md: 'h-12 px-6 text-sm tracking-wide',
        lg: 'h-14 px-8 text-base font-extrabold'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                ${baseStyles} 
                ${variantStyles[variant]} 
                ${sizeStyles[size]} 
                ${className}
            `}
        >
            {children}
        </button>
    );
};

export default Button;
