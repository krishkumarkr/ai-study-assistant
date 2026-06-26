import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";
import BackgroundGlow from "../../components/common/BackgroundGlow";

const FlashcardPage = () => {
  const { id: documentId } = useParams();
  const location = useLocation();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isFromAllFlashcards = location.state?.fromAllFlashcards;

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      toast.error("Failed to fetch flashcards.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleReview = async (index) => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
    } catch (error) {
      console.error("Failed to review flashcard.");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
        )
      );
      toast.success("Flashcard starred status updated!");
    } catch (error) {
      toast.error("Failed to update star status.");
    }
  };

  const handleDeleteFlashcardSet = async () => {
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcardSets._id);
      toast.success("Flashcard set deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || "Failed to delete flashcard set.");
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center min-h-[400px]"><Spinner /></div>;
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState
          title="No Flashcards Yet"
          description="Generate flashcards from your document to start learning."
        />
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-6 md:space-y-8">
        {/* Flashcard Component */}
        <div className="w-full">
          <Flashcard key={currentCard._id} flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>

        {/* Navigation Controller - Adjusted for mobile scale */}
        <div className="flex items-center justify-between w-full max-w-md bg-white/2 border border-white/5 rounded-2xl p-2 backdrop-blur-xl shadow-2xl">
          <button
            onClick={handlePrevCard}
            disabled={flashcards.length <= 1}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent active:scale-[0.98]"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span className="font-bold text-xs sm:text-sm uppercase tracking-wider hidden sm:block">Prev</span>
          </button>

          <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-emerald-400">
              {currentCardIndex + 1} <span className="text-zinc-600">/</span> {flashcards.length}
            </span>
          </div>

          <button
            onClick={handleNextCard}
            disabled={flashcards.length <= 1}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent active:scale-[0.98]"
          >
            <span className="font-bold text-xs sm:text-sm uppercase tracking-wider hidden sm:block">Next</span>
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <BackgroundGlow />
      {/* Added responsive padding px-4 sm:px-6 lg:px-8 so nothing touches the absolute edge */}
      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-6 lg:px-8 pt-4 pb-12 animate-in fade-in duration-500">

        {/* Back Button */}
        <div>
          <Link
            to={isFromAllFlashcards ? '/flashcards' : `/documents/${documentId}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-500 hover:text-emerald-400 transition-all uppercase tracking-widest group"
          >
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 group-hover:border-emerald-500/30 transition-all">
              <ArrowLeft size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            {isFromAllFlashcards ? "Back to All Sets" : "Back to Document"}
          </Link>
        </div>

        {/* Header - Buttons made w-full on mobile so they don't break layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <PageHeader title="Flashcards" />
          
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {!loading &&
              (flashcards.length > 0 ? (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={deleting}
                  className="w-full sm:w-auto py-3 px-4 sm:px-5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Trash2 size={18} strokeWidth={2.5} />
                  Delete Set
                </button>
              ) : (
                <button
                  onClick={handleGenerateFlashcards}
                  disabled={generating}
                  className="w-full sm:w-auto py-3 px-4 sm:px-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} strokeWidth={2.5} />
                      Generate Flashcards
                    </>
                  )}
                </button>
              ))}
          </div>
        </div>

        {renderFlashcardContent()}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Flashcard Set?"
        >
          <div className="space-y-6 md:space-y-8">
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
              Are you sure you want to delete this flashcard set? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 md:gap-4 justify-end pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 sm:flex-none px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFlashcardSet}
                disabled={deleting}
                className="flex-1 sm:flex-none px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
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
    </>
  );
};

export default FlashcardPage;