import React from "react";
import { FileText, Plus } from "lucide-react";

const EmptyState = ({ onActionClick, title, description, buttonText }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border border-white/5 border-dashed rounded-[40px] bg-white/1">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
        <FileText className="text-zinc-500" size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {buttonText && onActionClick && (
        <button
          onClick={onActionClick}
          className="py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;