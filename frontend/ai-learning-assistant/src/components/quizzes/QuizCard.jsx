import React from "react";
import { Link } from "react-router-dom";
import { Play, BarChart2, Trash2, Award, HelpCircle } from "lucide-react";
import moment from "moment";

const QuizCard = ({ quiz, onDelete }) => {
  // Use the exact same logic the backend uses to determine if a quiz is done!
  const isCompleted = !!quiz?.completedAt;

  return (
    <div className="bg-white/2 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/4 transition-all duration-300 shadow-xl shadow-black/20 flex flex-col group cursor-pointer relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(quiz);
        }}
        className="absolute top-4 right-4 p-2.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all z-10"
      >
        <Trash2 size={18} strokeWidth={2} />
      </button>

      <div className="flex-1 flex flex-col relative z-10 mt-2">
        {/* Status Badge */}
        <div className="mb-4">
          {isCompleted ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">
                Score: {quiz?.score || 0}%
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                Not Started
              </span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3
            className="text-lg font-bold text-white mb-1 tracking-tight line-clamp-2 group-hover:text-emerald-400 transition-colors"
            title={quiz.title}
          >
            {quiz.title || `Quiz - ${moment(quiz.createdAt).format("MMM D, YYYY")}`}
          </h3>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            Created {moment(quiz.createdAt).format("MMM D, YYYY")}
          </p>
        </div>

        {/* Quiz Info */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-zinc-500" />
            <span className="text-sm font-bold text-zinc-300">
              {quiz.questions?.length || 0} <span className="text-zinc-500 font-normal">{(quiz.questions?.length === 1) ? "Question" : "Questions"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 relative z-10">
        {isCompleted ? (
          <Link to={`/quizzes/${quiz._id}/results`}>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/5 active:scale-[0.98]">
              <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
              View Results
            </button>
          </Link>
        ) : (
          <Link to={`/quizzes/${quiz._id}`}>
            <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
              <Play className="w-4 h-4" strokeWidth={2.5} fill="currentColor" />
              Start Quiz
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default QuizCard;