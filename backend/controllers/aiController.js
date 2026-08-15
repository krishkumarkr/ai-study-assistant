import Document from '../models/Document.js';
import Chunk from '../models/Chunk.js'; 
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js'; 
import * as llmService from '../utils/llmService.js'; // ⬅️ NEW: The OpenRouter bridge
import { generateEmbeddings } from '../utils/embeddingService.js'; 

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

        // 1. SECTIONAL SAMPLING: Do not dump 100 pages into the prompt.
        const chunks = await Chunk.find({ documentId: document._id })
                                  .select('content chunkIndex -_id')
                                  .sort('chunkIndex');
        
        let sampledText = "";
        if (chunks.length <= 6) {
            sampledText = chunks.map(c => c.content).join('\n\n');
        } else {
            const step = Math.floor(chunks.length / 5);
            const sampledChunks = [
                chunks[0], 
                chunks[step], 
                chunks[step * 2], 
                chunks[step * 3],
                chunks[step * 4],
                chunks[chunks.length - 1] 
            ];
            sampledText = sampledChunks.map(c => c.content).join('\n\n');
        }

        // 2. Route to Llama 3.1 8B
        const cards = await llmService.generateFlashcards(sampledText, parseInt(count));

        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question, answer: card.answer, difficulty: card.difficulty, reviewCount: 0, isStarred: false
            }))
        });

        // CHARGE THE USER FOR FLASHCARDS (Atomic Update)
        await User.findByIdAndUpdate(req.user._id, { $inc: { 'aiUsage.flashcards': 1 } });

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

        // 1. SECTIONAL SAMPLING
        const chunks = await Chunk.find({ documentId: document._id })
                                  .select('content chunkIndex -_id')
                                  .sort('chunkIndex');
        
        let sampledText = "";
        if (chunks.length <= 6) {
            sampledText = chunks.map(c => c.content).join('\n\n');
        } else {
            const step = Math.floor(chunks.length / 5);
            const sampledChunks = [
                chunks[0], 
                chunks[step], 
                chunks[step * 2], 
                chunks[step * 3],
                chunks[step * 4],
                chunks[chunks.length - 1] 
            ];
            sampledText = sampledChunks.map(c => c.content).join('\n\n');
        }

        // 2. Route to Llama 3.1 8B
        const questions = await llmService.generateQuiz(sampledText, parseInt(numQuestions));

        const quiz = await Quiz.create ({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });

        // CHARGE THE USER FOR QUIZ (Atomic Update)
        await User.findByIdAndUpdate(req.user._id, { $inc: { 'aiUsage.quizzes': 1 } });

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

        if (document.summary) {
            return res.status(200).json({
                success: true,
                data: { documentId: document._id, title: document.title, summary: document.summary },
                message: 'Summary retrieved from database cache'
            });
        }

        // 1. RECONSTRUCT THE TEXT FROM CHUNKS
        const chunks = await Chunk.find({ documentId: document._id })
                                  .select('content -_id')
                                  .sort('chunkIndex');
                                  
        const fullText = chunks.map(c => c.content).join('\n\n');

        // 2. Route to Gemini 1.5 Flash (Handles large context windows)
        const summary = await llmService.generateSummary(fullText);

        document.summary = summary;
        await document.save(); 

        // CHARGE THE USER FOR SUMMARY (Atomic Update)
        await User.findByIdAndUpdate(req.user._id, { $inc: { 'aiUsage.summaries': 1 } });

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

        // Generate vector for the user's question locally
        const [queryVector] = await generateEmbeddings([question]);

        // Execute MongoDB Atlas Vector Search
        const relevantChunks = await Chunk.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'embedding',
                    queryVector: queryVector,
                    numCandidates: 50, 
                    limit: 3, 
                    filter: { documentId: document._id }
                }
            },
            {
                $project: {
                    _id: 0,
                    content: 1,
                    chunkIndex: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ]);

        if (!relevantChunks || relevantChunks.length === 0) {
            return res.status(400).json({ success: false, error: 'No relevant information found in this document.', statusCode: 400 });
        }

        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        let chatHistory = await ChatHistory.findOne({ userId: req.user._id, documentId: document._id });
        if (!chatHistory) {
            chatHistory = await ChatHistory.create({ userId: req.user._id, documentId: document._id, messages: [] });
        }

        // Route to Llama 3.3 70B
        const answer = await llmService.chatWithContext(question, relevantChunks);

        chatHistory.messages.push(
            { role: 'user', content: question, timestamp: new Date(), relevantChunks: [] },
            { role: 'assistant', content: answer, timestamp: new Date(), relevantChunks: chunkIndices }
        );
        await chatHistory.save();

        // CHARGE THE USER FOR CHAT (Atomic Update)
        await User.findByIdAndUpdate(req.user._id, { $inc: { 'aiUsage.chats': 1 } });

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

        // Generate vector for the user's concept locally
        const [queryVector] = await generateEmbeddings([concept]);

        // Execute MongoDB Atlas Vector Search
        const relevantChunks = await Chunk.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'embedding',
                    queryVector: queryVector,
                    numCandidates: 50,
                    limit: 3,
                    filter: { documentId: document._id }
                }
            },
            {
                $project: {
                    _id: 0,
                    content: 1,
                    chunkIndex: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ]);

        if (!relevantChunks || relevantChunks.length === 0) {
            return res.status(400).json({ success: false, error: 'No relevant information found in this document to explain this concept.', statusCode: 400 });
        }

        const context = relevantChunks.map(c => c.content).join('\n\n');
        
        // Route to Gemini 1.5 Flash
        const explanation = await llmService.explainConcept(concept, context);

        // CHARGE THE USER FOR EXPLANATION (Atomic Update)
        await User.findByIdAndUpdate(req.user._id, { $inc: { 'aiUsage.explanations': 1 } });

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