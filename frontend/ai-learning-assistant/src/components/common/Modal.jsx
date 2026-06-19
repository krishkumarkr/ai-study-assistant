import React from 'react';
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-zinc-950 border border-white/10 rounded-[40px] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 relative">
                    {children}
                </div>

                {/* Subtle bottom fade for scrolling effect */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none rounded-b-[40px]" />
            </div>
        </div>
    );
};

export default Modal;