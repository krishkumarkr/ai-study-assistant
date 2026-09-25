import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, BookOpen, BrainCircuit, Clock, AlertTriangle, Loader2 } from "lucide-react";
import moment from "moment";

const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "N/A";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (document.status === 'ready') {
      navigate(`/documents/${document._id}`);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-xl shadow-black/25 ${
        document.status === 'failed' 
          ? 'bg-rose-950/10 border-rose-500/20 hover:border-rose-500/40' 
          : document.status === 'processing'
          ? 'bg-amber-950/10 border-amber-500/20'
          : 'bg-white/2 border-white/5 hover:border-emerald-500/30 hover:bg-white/4 cursor-pointer'
      }`}
      onClick={handleNavigate}
    >
      {/* Header Section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-zinc-900 border border-white/5 shadow-inner ${
            document.status === 'failed' ? 'text-rose-400' : document.status === 'processing' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            <FileText size={22} strokeWidth={2} />
          </div>
          
          {/* Single Delete Button */}
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
            aria-label="Delete document"
          >
            <Trash2 size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold text-white mb-1 truncate leading-tight tracking-tight"
          title={document.title}
        >
          {document.title}
        </h3>

        {/* Status / Size Badges */}
        <div className="flex items-center gap-2 mb-4">
          {document.fileSize !== undefined && (
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
              {formatFileSize(document.fileSize)}
            </span>
          )}

          {document.status === 'processing' && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20 animate-pulse">
              <Loader2 size={12} className="animate-spin" />
              Processing
            </span>
          )}

          {document.status === 'failed' && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/20">
              <AlertTriangle size={12} />
              Failed
            </span>
          )}
        </div>

        {/* Error Details (Only when status is 'failed') */}
        {document.status === 'failed' && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-300 text-xs leading-relaxed">
            <span className="font-semibold block mb-0.5 text-rose-400">Error Details:</span>
            {document.errorReason || "An unknown error occurred. Please try to re-upload the document."}
          </div>
        )}

        {/* Stats Section (Only when status is 'ready') */}
        {document.status === 'ready' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-zinc-400">
              <BookOpen size={14} className="text-emerald-500/70" strokeWidth={2} />
              <span className="text-xs font-medium">{document.flashcardCount || 0} Flashcards</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <BrainCircuit size={14} className="text-emerald-500/70" strokeWidth={2} />
              <span className="text-xs font-medium">{document.quizCount || 0} Quizzes</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-500">
          <Clock size={14} strokeWidth={2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {moment(document.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {/* Glow Hover for Ready Documents */}
      {document.status === 'ready' && (
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
    </div>
  );
};

export default DocumentCard;