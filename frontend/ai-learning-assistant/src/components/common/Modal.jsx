import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      
      {/* 1. max-h-[70vh] ensures it fits nicely inside the screen without touching the edges.
          2. max-w-3xl gives it a nice wide reading area for the summary.
      */}
      <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-3xl max-h-[70vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header - Pinned to the top */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/5 shrink-0 bg-white/5">
          <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-3 tracking-tight">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content - Flex-1 and min-h-0 forces the scrolling to stay inside this box! */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 min-h-0" style={{ scrollbarWidth: 'thin' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;