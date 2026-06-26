import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    ArrowLeft,
    Sparkles,
    Brain,
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';

import flashcardService from '../../services/flashcardService';
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import Flashcard from './Flashcard';

const FlashcardManager = ({ documentId }) => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);

    const fetchFlashcardSets = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId);
            setFlashcardSets(response.data);
        } catch (error) {
            toast.error("Failed to fetch flashcard sets.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchFlashcardSets();
        }
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully!");
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to generate flashcards.");
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
            );
        }
    };

    const handlePrevCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) =>
                    (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
            );
        }
    };

    const handleReview = async (index) => {
        const currentCard = selectedSet?.cards[currentCardIndex];
        if (!currentCard) return;

        try {
            await flashcardService.reviewFlashcard(currentCard._id, index);
        } catch (error) {
            console.error("Failed to mark flashcard as reviewed.");
        }
    };

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStar(cardId);
            const updatedSets = flashcardSets.map((set) => {
                if (set._id === selectedSet._id) {
                    const updatedCards = set.cards.map((card) =>
                        card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
                    );
                    return { ...set, cards: updatedCards };
                }
                return set;
            });
            setFlashcardSets(updatedSets);
            setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));
        } catch (error) {
            toast.error("Failed to update star status.");
        }
    };

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!setToDelete) return;
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            toast.success("Flashcard set deleted successfully!");
            setIsDeleteModalOpen(false);
            setSetToDelete(null);
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to delete flashcard set.");
        } finally {
            setDeleting(false);
        }
    };

    const handleSelectSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
    };

    const renderFlashcardViewer = () => {
        const currentCard = selectedSet.cards[currentCardIndex];

        return (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedSet(null)}
                    className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-500 hover:text-emerald-400 transition-all uppercase tracking-widest group px-1"
                >
                    <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white/5 border border-white/5 group-hover:border-emerald-500/30 transition-all">
                        <ArrowLeft size={16} className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                    Back to Sets
                </button>

                {/* Flashcard Display */}
                <div className="flex flex-col items-center max-w-3xl mx-auto w-full px-1">
                    <div className="w-full mb-6 md:mb-8">
                        <Flashcard
                            key={currentCard._id}
                            flashcard={currentCard}
                            onToggleStar={handleToggleStar}
                        />
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between w-full max-w-md bg-white/2 border border-white/5 rounded-2xl p-2 backdrop-blur-xl shadow-2xl">
                        <button
                            onClick={handlePrevCard}
                            disabled={selectedSet.cards.length <= 1}
                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent active:scale-[0.98]"
                        >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                            <span className="font-bold text-xs sm:text-sm uppercase tracking-wider hidden sm:block">Prev</span>
                        </button>

                        <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-xs sm:text-sm font-bold tracking-widest text-emerald-400">
                                {currentCardIndex + 1}{" "}
                                <span className="text-zinc-600">/</span>{" "}
                                {selectedSet.cards.length}
                            </span>
                        </div>

                        <button
                            onClick={handleNextCard}
                            disabled={selectedSet.cards.length <= 1}
                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent active:scale-[0.98]"
                        >
                            <span className="font-bold text-xs sm:text-sm uppercase tracking-wider hidden sm:block">Next</span>
                            <ChevronRight size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSetList = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center min-h-[400px]">
                    <Spinner />
                </div>
            )
        }

        if (flashcardSets.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] text-center p-6 md:p-8 border border-white/5 border-dashed rounded-[24px] md:rounded-[40px] bg-white/1 mx-1">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-5 md:mb-6 shadow-2xl">
                        <Brain className="text-emerald-500 w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 tracking-tight">
                        No Flashcards yet.
                    </h3>
                    <p className="text-zinc-500 text-xs md:text-sm max-w-sm mb-6 md:mb-8 leading-relaxed px-4">
                        Generate flashcards from the document to start learning and reinforce your knowledge.
                    </p>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className="py-3 px-5 md:py-3.5 md:px-6 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs md:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] w-full lg:w-auto"
                    >
                        {generating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} strokeWidth={2.5} />
                                Generate Flashcards
                            </>
                        )}
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full">
                
                {/* CRITICAL FIX: Changed sm:flex-row to lg:flex-row. 
                  Now it stacks vertically on mobile AND tablet, preventing the cramped layout.
                */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
                    <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            Your Flashcard Sets
                        </h3>
                        <p className="text-xs md:text-sm text-zinc-400 mt-1">
                            {flashcardSets.length}{" "}
                            {flashcardSets.length === 1 ? "set" : "sets"} available
                        </p>
                    </div>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        // Added w-full so it's a massive, easy-to-tap button on mobile/tablet
                        className="w-full lg:w-auto py-3 px-4 lg:py-3 lg:px-5 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {generating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Plus size={16} strokeWidth={2.5} />
                                Generate New Set
                            </>
                        )}
                    </button>
                </div>

                {/* Flashcard Sets Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 px-1'>
                    {flashcardSets.map((set) => (
                        <div
                            key={set._id}
                            onClick={() => handleSelectSet(set)}
                            className="bg-white/2 border border-white/5 rounded-2xl p-5 md:p-6 backdrop-blur-xl hover:bg-white/4 transition-all duration-300 shadow-xl shadow-black/20 flex flex-col group cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

                            <button
                                onClick={(e) => handleDeleteRequest(e, set)}
                                className="absolute top-3 right-3 md:top-4 md:right-4 p-2 md:p-2.5 rounded-lg md:rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all z-10"
                            >
                                <Trash2 size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2} />
                            </button>

                            <div className='flex-1 flex flex-col relative z-10'>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 md:mb-5 shadow-inner">
                                    <Brain size={20} className="md:w-6 md:h-6" strokeWidth={2} />
                                </div>

                                <div className="mb-5 md:mb-6">
                                    <h4 className="text-base md:text-lg font-bold text-white mb-1 tracking-tight group-hover:text-emerald-400 transition-colors">
                                        Flashcard Set
                                    </h4>
                                    <p className="text-[10px] md:text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                        Created {moment(set.createdAt).format("MMM D, YYYY")}
                                    </p>
                                </div>

                                <div className="mt-auto pt-3 md:pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs md:text-sm font-bold text-zinc-300">
                                            {set.cards.length}{" "}
                                            <span className="text-zinc-500 font-normal">
                                                {set.cards.length === 1 ? "card" : "cards"}
                                            </span>
                                        </span>
                                    </div>
                                    <ChevronRight size={16} className="md:w-[18px] md:h-[18px] text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="w-full">
                {selectedSet ? renderFlashcardViewer() : renderSetList()}
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Flashcard Set?"
            >
                <div className="space-y-6 md:space-y-8">
                    <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                        Are you sure you want to delete this flashcard set? This action
                        cannot be undone and all cards will be permanently removed.
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
                            className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {deleting ? (
                                <>
                                    <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Set"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default FlashcardManager;