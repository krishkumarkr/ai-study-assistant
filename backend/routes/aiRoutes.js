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
import { aiLimiter } from '../middleware/rateLimiter.js'; // ⬅️ NEW: Import the security guard

const router = express.Router();

// 1. Ensure the user is logged in
router.use(protect);

// 2. Ensure they aren't spam-clicking (Max 20 requests per 15 mins)
router.use(aiLimiter);

// 3. Ensure they have daily credits left, then execute the generation
router.post('/generate-flashcards', checkQuota('flashcards'), generateFlashcards);
router.post('/generate-quiz', checkQuota('quizzes'), generateQuiz);
router.post('/generate-summary', checkQuota('summaries'), generateSummary);
router.post('/chat', checkQuota('chats'), chat);
router.post('/explain-concept', checkQuota('explanations'), explainConcept);
router.get('/chat-history/:documentId', getChatHistory);
 
export default router;