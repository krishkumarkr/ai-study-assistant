import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

// @desc    Get user learning statistics
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get Counts
        const totalDocuments = await Document.countDocuments({ userId });
        const totalFlashcardSets = await Flashcard.countDocuments({ userId });
        const totalQuizzes = await Quiz.countDocuments({ userId });
        const completedQuizzes = await Quiz.countDocuments({ userId, completedAt: { $ne: null }});

        // Get flashcard statistics
        const flashcardSets = await Flashcard.find({ userId });
        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(c => c.reviewCount > 0).length;
            starredFlashcards += set.cards.filter(c => c.isStarred).length;
        })

        // Get quiz statistics
        const quizzes = await Quiz.find({ userId, completedAt: { $ne: null }});
        const averageScore = quizzes.length > 0
            ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length)
            : 0;
        
        // Recent activity
        const recentDocuments = await Document.find({ userId })
            .sort({ lastAccessed: -1})
            .limit(5)
            .select('title fileName lastAccessed status');

        const recentQuizzes = await Quiz.find({ userId })
            .sort({ createdAt: -1})
            .limit(5)
            .populate('documentId', 'title')
            .select('title score totalQuestions completedAt');
        
        // Study streak: count consecutive recent days with quiz completions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let studyStreak = 0;
        for (let i = 0; i < 30; i++) {
            const dayStart = new Date(today);
            dayStart.setDate(dayStart.getDate() - i);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            const hasActivity = await Quiz.exists({
                userId,
                completedAt: { $gte: dayStart, $lt: dayEnd }
            });
            if (hasActivity) {
                studyStreak++;
            } else if (i > 0) {
                break; // streak broken
            }
        }

        res.status(200).json ({
            success: true,
            data: {
                overview: {
                    totalDocuments,
                    totalFlashcardSets,
                    totalFlashcards,
                    reviewedFlashcards,
                    starredFlashcards,
                    totalQuizzes,
                    completedQuizzes,
                    averageScore,
                    studyStreak
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes
                }
            }
        });
    } catch (error) {
        next(error);
    }
}