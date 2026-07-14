import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js'; // ⬅️ NEW: Imported User model
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';

// ==========================================
// CENTRALIZED AI ERROR HANDLER
// ==========================================
const handleAIError = (error, res, next) => {
    const errorMessage = (error.message || '').toLowerCase();
    console.error("🔴 AI Service Error Caught:", error.message || error);

    if (error.status === 429 || errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('too many requests')) {
        return res.status(429).json({
            success: false,
            error: 'AI models are currently in high demand. Please wait 30 seconds and try again.',
            statusCode: 429
        });
    }

    if (errorMessage.includes('safety') || errorMessage.includes('blocked') || errorMessage.includes('prohibited')) {
        return res.status(400).json({
            success: false,
            error: 'Generation blocked: The document contains content that violates AI safety guidelines.',
            statusCode: 400
        });
    }

    if (errorMessage.includes('token') || errorMessage.includes('maximum context length') || errorMessage.includes('too large')) {
        return res.status(413).json({
            success: false,
            error: 'The document section is too large for the AI to process at once. Try asking a smaller question.',
            statusCode: 413
        });
    }

    if (
        error.status >= 500 || errorMessage.includes('503') || errorMessage.includes('500') || 
        errorMessage.includes('502') || errorMessage.includes('504') || errorMessage.includes('overloaded') ||
        errorMessage.includes('service unavailable') || errorMessage.includes('fetch failed') ||
        errorMessage.includes('timeout') || errorMessage.includes('internal server error') ||
        errorMessage.includes('network error')
    ) {
        return res.status(503).json({
            success: false,
            error: 'The AI service is temporarily overloaded or unavailable. Please try again in a few moments.',
            statusCode: 503
        });
    }

    next(error);
};


// @desc    Generate flashcards from document
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;
        if (!documentId) return res.status(400).json({ success: false, error: 'Please provide documentId', statusCode: 400 });

        const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });
        if (!document) return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });

        const cards = await geminiService.generateFlashcards(document.extractedText, parseInt(count));

        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question, answer: card.answer, difficulty: card.difficulty, reviewCount: 0, isStarred: false
            }))
        });

        // CHARGE THE USER FOR FLASHCARDS
        const user = await User.findById(req.user._id);
        user.aiUsage.flashcards += 1;
        await user.save();

        res.status(201).json({ success: true, data: flashcardSet, message: 'Flashcards generated successfully' });
    } catch (error) {
        handleAIError(error, res, next);
    }
};

// @desc    Generate quiz from document
// @route   POST /api/ai/generate-quiz
// @access  Private
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;
        if (!documentId) return res.status(400).json ({ success: false, error: 'Please provide documentId', statusCode: 400 });

        const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });
        if (!document) return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });

        const questions = await geminiService.generateQuiz(document.extractedText, parseInt(numQuestions));

        const quiz = await Quiz.create ({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });

        // CHARGE THE USER FOR QUIZ
        const user = await User.findById(req.user._id);
        user.aiUsage.quizzes += 1;
        await user.save();

        res.status(201).json({ success: true, data: quiz, message: 'Quiz generated successfully' });
    } catch (error) {
        handleAIError(error, res, next);
    }
};

// @desc    Generate document summary
// @route   POST /api/ai/generate-summary
// @access  Private
export const generateSummary = async (req, res, next) => {
    try {
        const {documentId} = req.body;
        if (!documentId) return res.status(400).json({ success: false, error: 'Please provide documentId', statusCode: 400 });

        const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });
        if (!document) return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });

        // CACHE HIT: Do NOT charge the user if it's retrieved from DB
        if (document.summary) {
            return res.status(200).json({
                success: true,
                data: { documentId: document._id, title: document.title, summary: document.summary },
                message: 'Summary retrieved from database cache'
            });
        }

        // CACHE MISS: Generate via Gemini
        const summary = await geminiService.generateSummary(document.extractedText);

        document.summary = summary;
        await document.save(); 

        // CHARGE THE USER FOR SUMMARY
        const user = await User.findById(req.user._id);
        user.aiUsage.summaries += 1;
        await user.save();

        res.status(200).json({
            success: true,
            data: { documentId: document._id, title: document.title, summary },
            message: 'Summary generated and saved successfully'
        });
    } catch (error) {
        handleAIError(error, res, next);
    }
};

// @desc    Chat from document
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;
        if (!documentId || !question) return res.status(400).json({ success: false, error: 'Please provide inputs', statusCode: 400 });

        const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });
        if (!document) return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });

        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        let chatHistory = await ChatHistory.findOne({ userId: req.user._id, documentId: document._id });
        if (!chatHistory) {
            chatHistory = await ChatHistory.create({ userId: req.user._id, documentId: document._id, messages: [] });
        }

        const answer = await geminiService.chatWithContext(question, relevantChunks);

        chatHistory.messages.push(
            { role: 'user', content: question, timestamp: new Date(), relevantChunks: [] },
            { role: 'assistant', content: answer, timestamp: new Date(), relevantChunks: chunkIndices }
        );
        await chatHistory.save();

        // CHARGE THE USER FOR CHAT
        const user = await User.findById(req.user._id);
        user.aiUsage.chats += 1;
        await user.save();

        res.status(200).json({
            success: true,
            data: { question, answer, relevantChunks: chunkIndices, chatHistoryId: chatHistory._id },
            message: 'Response generated successfully'
        });
    } catch (error) {
        handleAIError(error, res, next);
    }
};

// @desc    Explain concept from document
// @route   POST /api/ai/explain-concept
// @access  Private
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;
        if( !documentId || !concept) return res.status(400).json({ success: false, error: 'Please provide inputs', statusCode: 400 });

        const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });
        if(!document) return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });

        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c => c.content).join('\n\n');

        const explanation = await geminiService.explainConcept(concept, context);

        // CHARGE THE USER FOR EXPLANATION
        const user = await User.findById(req.user._id);
        user.aiUsage.explanations += 1;
        await user.save();

        res.status(200).json({
            success: true,
            data: { concept, explanation, relevantChunks: relevantChunks.map(c => c.chunkIndex) },
            message: 'Explanation generated successfully'
        });
    } catch (error) {
        handleAIError(error, res, next);
    }
};

// @desc    Get chat history for a document
export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        if (!documentId) return res.status(400).json({ success: false, error: 'Please provide documentId', statusCode: 400 });

        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId
        }).select('messages'); 

        if (!chatHistory) {
            return res.status(200).json({ success: true, data: [], message: 'No chat history found' });
        }

        res.status(200).json({ success: true, data: chatHistory.messages, message: 'Chat History retrieved successfully' });
    } catch (error) {
        next(error);
    }
};