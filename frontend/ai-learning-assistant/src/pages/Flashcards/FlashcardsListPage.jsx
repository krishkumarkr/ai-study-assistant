import React, { useState, useEffect } from 'react';
import flashcardService from '../../services/flashcardService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard';
import BackgroundGlow from '../../components/common/BackgroundGlow';
import toast from 'react-hot-toast';

const FlashcardsListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();
        setFlashcardSets(response.data);
      } catch (error) {
        toast.error("Failed to fetch flashcard sets.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardSets();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner />
        </div>
      );
    }

    // THE GHOST KILLER: Filter out any sets where the documentId is missing/null
    const validFlashcardSets = flashcardSets.filter(set => set.documentId);

    if (validFlashcardSets.length === 0) {
      return (
        <EmptyState
          title="No Flashcard Sets Found"
          description="You haven't generated any flashcards yet. Go to a document to create your first set."
        />
      );
    }

    return (
      // CRITICAL FIX: Removed sm:grid-cols-2. Now it stays 1-col on tablet, and switches to 2/3 on desktop.
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {validFlashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    );
  };

  return (
    <>
      <BackgroundGlow />
      {/* Added responsive padding (px-4 sm:px-6 md:px-8) so it breathes on mobile screens */}
      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8 pt-4 pb-12 animate-in fade-in duration-500">
        <PageHeader title="All Flashcard Sets" />
        {renderContent()}
      </div>
    </>
  )
}

export default FlashcardsListPage;