import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths";

const generateFlashcards = async (documentId, options) => {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, { documentId, ...options });
    return response.data;
};

const generateQuiz = async (documentId, options) => {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, { documentId, ...options });
    return response.data;
};

const generateSummary = async (documentId) => {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, { documentId });
    return response.data;
};

const chat = async (documentId, message) => {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, { documentId, question: message });
    return response.data;
};

const explainConcept = async (documentId, concept) => {
    const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, { documentId, concept });
    return response.data;
};

const getChatHistory = async (documentId) => {
    const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
    return response.data;
};

const aiService = {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory,
};

export default aiService;