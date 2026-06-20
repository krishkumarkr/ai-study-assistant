import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, TrendingUp } from "lucide-react";
import moment from "moment";

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate();

  const handleStudyNow = () => {
    navigate(`/documents/${flashcardSet.documentId._id}/flashcards`);
  };

  const reviewedCount = flashcardSet.cards?.filter(card => card.lastReviewed).length || 0;
  const totalCards = flashcardSet.cards?.length || 0;
  const progressPercentage = totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;

  return (
    <div
      className="bg-white/2 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/4 transition-all duration-300 shadow-xl shadow-black/20 flex flex-col group cursor-pointer relative overflow-hidden"
      onClick={handleStudyNow}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

      <div className="flex-1 flex flex-col relative z-10">
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-6">
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
            <BookOpen className="w-6 h-6 text-emerald-400" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3
              className="text-lg font-bold text-white tracking-tight line-clamp-2 mb-1 group-hover:text-emerald-400 transition-colors"
              title={flashcardSet?.documentId?.title}
            >
              {flashcardSet?.documentId?.title}
            </h3>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Created {moment(flashcardSet.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-300">
              {totalCards} {totalCards === 1 ? "card" : "cards"}
            </span>
          </div>
          {reviewedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">
                {progressPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalCards > 0 && (
          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Progress
              </span>
              <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">
                {reviewedCount}/{totalCards} reviewed
              </span>
            </div>
            <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
              <div
                className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Study Button */}
      <div className="pt-6 relative z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStudyNow();
          }}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" strokeWidth={2.5} />
          Study Now
        </button>
      </div>
    </div>
  );
};

export default FlashcardSetCard;