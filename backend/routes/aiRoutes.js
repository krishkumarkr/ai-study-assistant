import express from 'express';
import {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';
import { checkQuota } from '../middleware/quotaTracker.js';

const router = express.Router();

router.use(protect);

router.post('/generate-flashcards', checkQuota('flashcards'), generateFlashcards);
router.post('/generate-quiz', checkQuota('quizzes'), generateQuiz);
router.post('/generate-summary', checkQuota('summaries'), generateSummary);
router.post('/chat', checkQuota('chats'), chat);
router.post('/explain-concept', checkQuota('explanations'), explainConcept);
router.get('/chat-history/:documentId', getChatHistory);
 
export default router;