import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import quizService from "../../services/quizService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import QuizCard from "./QuizCard";
import EmptyState from "../common/EmptyState";

const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  
  // Changed to string to allow easy clearing of the input field
  const [numQuestions, setNumQuestions] = useState("5");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(data.data);
    } catch (error) {
      toast.error("Failed to fetch quizzes.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchQuizzes();
    }
  }, [documentId]);

  // Clean input handler that allows deleting characters down to an empty string
  const handleInputChange = (e) => {
    const val = e.target.value;
    // Only allow numbers or completely empty string
    if (val === "" || /^[0-9\b]+$/.test(val)) {
      setNumQuestions(val);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    
    // Final validation before sending to backend
    let finalNum = parseInt(numQuestions);
    // If left blank or typed 0, default to 1. Cap it at 20.
    if (isNaN(finalNum) || finalNum < 1) finalNum = 1;
    if (finalNum > 20) finalNum = 20;

    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId, { numQuestions: finalNum });
      toast.success("Quiz generated successfully!");
      setIsGenerateModalOpen(false);
      setNumQuestions(finalNum.toString()); // Reset to the validated string
      fetchQuizzes();
    } catch (error) {
      toast.error(error.message || "Failed to generate quiz.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success(`'${selectedQuiz.title || "Quiz"}' deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      setQuizzes(quizzes.filter((q) => q._id !== selectedQuiz._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete quiz.");
    } finally {
      setDeleting(false);
    }
  };

  const renderQuizContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center min-h-[400px]"><Spinner /></div>;
    }

    if (quizzes.length === 0) {
      return (
        <EmptyState
          title="No Quizzes Yet"
          description="Generate a quiz from your document to test your knowledge."
          buttonText="Generate Quiz"
          onActionClick={() => setIsGenerateModalOpen(true)}
        />
      );
    }

    return (
      // CRITICAL FIX: 1 col on Mobile/Tablet, 2 cols on Desktop, 3 on Ultrawide
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 px-1">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
  };

  return (
    <div className="relative space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full">
      
      {/* Header with Generate Button */}
      {quizzes.length > 0 && !loading && (
        // CRITICAL FIX: Changed sm:flex-row to lg:flex-row to keep it stacked on tablets
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
            <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    Your Quizzes
                </h3>
                <p className="text-xs md:text-sm text-zinc-400 mt-1">
                    {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} available
                </p>
            </div>
            <button
                onClick={() => setIsGenerateModalOpen(true)}
                // Added w-full so the button spans the entire width on mobile/tablet
                className="w-full lg:w-auto py-3 px-4 lg:py-3 lg:px-5 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
                <Plus size={16} strokeWidth={2.5} />
                Generate New Quiz
            </button>
        </div>
      )}

      {renderQuizContent()}

      {/* Generate Quiz Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate New Quiz"
      >
        <form onSubmit={handleGenerateQuiz} className="space-y-6 md:space-y-8">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
              Number of Questions (Max 20)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={numQuestions}
              onChange={handleInputChange}
              placeholder="e.g. 5"
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 md:gap-4 justify-end pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={generating}
              className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" 
              disabled={generating || numQuestions === ""} 
              className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs md:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              {generating ? (
                <>
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Quiz"
      >
        <div className="space-y-6 md:space-y-8">
          <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
            Are you sure you want to delete the quiz:{" "}
            <span className="font-bold text-white">
              {selectedQuiz?.title || 'this quiz'}
            </span>? This action cannot be undone. 
          </p>
          <div className="flex items-center gap-3 md:gap-4 justify-end pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelete} 
              disabled={deleting} 
              className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {deleting ? (
                 <>
                   <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                   Deleting...
                 </>
              ) : (
                 "Delete"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizManager;