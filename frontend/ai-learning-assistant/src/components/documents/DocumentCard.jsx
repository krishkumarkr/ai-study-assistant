import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, BookOpen, BrainCircuit, Clock } from "lucide-react";
import moment from "moment";

// Helper function to format file size
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
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white/2 backdrop-blur-xl border border-white/5 hover:border-emerald-500/30 hover:bg-white/4 transition-all duration-300 cursor-pointer shadow-xl shadow-black/20"
      onClick={handleNavigate}
    >
      {/* Header Section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-emerald-400 shadow-inner">
            <FileText size={22} strokeWidth={2} />
          </div>
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-xl text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
            aria-label="Delete document"
          >
            <Trash2 size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold text-white mb-2 truncate leading-tight tracking-tight group-hover:text-emerald-50"
          title={document.title}
        >
          {document.title}
        </h3>

        {/* Document Info */}
        <div className="flex items-center gap-2 mb-6">
          {document.fileSize !== undefined && (
            <>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                {formatFileSize(document.fileSize)}
              </span>
            </>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {document.flashcardCount !== undefined && (
            <div className="flex items-center gap-2 text-zinc-400">
              <BookOpen size={14} className="text-emerald-500/70" strokeWidth={2} />
              <span className="text-xs font-medium">{document.flashcardCount} Flashcards</span>
            </div>
          )}
          {document.quizCount !== undefined && (
            <div className="flex items-center gap-2 text-zinc-400">
              <BrainCircuit size={14} className="text-emerald-500/70" strokeWidth={2} />
              <span className="text-xs font-medium">{document.quizCount} Quizzes</span>
            </div>
          )}
        </div>
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

      {/* Hover Indicator */}
      <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default DocumentCard;
