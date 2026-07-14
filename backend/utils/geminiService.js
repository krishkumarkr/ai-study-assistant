import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
    process.exit(1);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const withExponentialBackoff = async (operation, maxRetries = 3, baseDelayMs = 2000) => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await operation();
        } catch (error) {
            const errorMessage = (error.message || '').toLowerCase();
            const isRateLimit = error.status === 429 || errorMessage.includes('429') || errorMessage.includes('quota');
            const isServerOverload = error.status === 503 || errorMessage.includes('503') || errorMessage.includes('overloaded');

            if ((isRateLimit || isServerOverload) && attempt < maxRetries - 1) {
                attempt++;
                const waitTime = (baseDelayMs * Math.pow(2, attempt - 1)) + (Math.random() * 500);
                console.warn(`[Gemini API] Rate limit/Overload hit. Retrying attempt ${attempt}/${maxRetries - 1} in ${Math.round(waitTime)}ms...`);
                await delay(waitTime);
            } else {
                throw error;
            }
        }
    }
};

/**
 * Generate flashcards (Upgraded to Strict JSON)
 */
export const generateFlashcards = async (text, count = 10) => {
    const prompt = `You are an expert educator. Extract the most important facts, definitions, and concepts from the text below.
    Generate exactly ${count} flashcards. 
    
    Output ONLY a valid JSON array of objects. Do not include markdown code blocks.
    Schema: [{ "question": "string", "answer": "string", "difficulty": "easy|medium|hard" }]

    Text:
    ${text}`;

    try {
        const response = await withExponentialBackoff(() => 
            ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: prompt,
                config: {
                    responseMimeType: "application/json", // ⬅️ THE MAGIC BULLET
                }
            })
        );
        
        // Look how clean this is now! No more string splitting!
        const flashcards = JSON.parse(response.text);
        return flashcards.slice(0, count);

    } catch (error) {
        console.error('Gemini API error in generateFlashcards:', error.message || error);
        throw error;
    }
};

/**
 * Generate quiz questions (Upgraded to Strict JSON)
 */
export const generateQuiz = async (text, numQuestions= 5) => {
    const prompt = `You are a strict academic examiner. Create exactly ${numQuestions} challenging multiple-choice questions based on the text below.
    The questions should test deep understanding, not just basic recall.
    
    Output ONLY a valid JSON array of objects. Do not include markdown code blocks.
    Schema: [{ 
        "question": "string", 
        "options": ["string", "string", "string", "string"], 
        "correctAnswer": "string (must exactly match one of the options)", 
        "explanation": "string (briefly explain why it is correct based on the text)", 
        "difficulty": "easy|medium|hard" 
    }]

    Text: 
    ${text}`; 

    try {
        const response = await withExponentialBackoff(() => 
            ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: prompt,
                config: {
                    responseMimeType: "application/json", // ⬅️ THE MAGIC BULLET
                }
            })
        );

        // Boom. Instant, perfect arrays.
        const questions = JSON.parse(response.text);
        return questions.slice(0, numQuestions);

    } catch (error) {
        console.error('Gemini API error in generateQuiz: ', error.message || error);
        throw error;
    }
};

/**
 * Generate document summary (Upgraded for Markdown & Structure)
 */
export const generateSummary = async (text) => {
    const prompt = `You are an expert analyst and technical writer. Your task is to provide a deep, highly detailed summary of the ENTIRE text provided below. 

    CRITICAL INSTRUCTION: You are processing a massive document. You MUST summarize the entire text from start to finish. Do not just summarize the introduction. You must explicitly cover the beginning, middle, and conclusion of the provided text.

    Formatting rules:
    1. **Executive Overview:** Start with a 3-4 sentence high-level overview of the entire document's primary narrative, purpose, or core argument.
    2. **Comprehensive Breakdown:** Use Markdown headers (##) to divide the summary into logical sections (e.g., Chronological Parts, Core Chapters, or Major Themes). Write at least one robust paragraph for each section, ensuring you cover the ending of the document.
    3. **Key Concepts & Takeaways:** Include a bulleted list of the 5-7 most important concepts, themes, or plot points that span the entire document.
    4. Keep the tone professional, highly structured, and deeply informative.

    Text:
    ${text}`; 

    try {
        const response = await withExponentialBackoff(() => 
            ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: prompt,
            })
        );
        return response.text;
    } catch (error) {
        console.error('Gemini API error in generateSummary:', error.message || error);
        throw error;
    }
};

/**
 * Chat with document context (Upgraded Persona)
 */
export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((c, i) => `[Document Section ${i + 1}]\n${c.content}`).join('\n\n');

    const prompt = `You are an elite, highly intelligent study assistant. Your goal is to help a student deeply understand their course materials.

    Source Material: 
    """
    ${context}
    """

    Student's Question: "${question}"

    Rules for your response:
    1. Grounding: You must base your answer primarily on the Source Material provided above. 
    2. Clarity: Use Markdown (bullet points, bold text) to make your answer highly readable.
    3. Missing Info: If the Source Material does not contain the answer, politely state: "I cannot find the exact answer in the provided document sections," and then offer a general educational explanation if appropriate.
    4. Tone: Be encouraging, concise, and academically rigorous. Do not use generic AI filler phrases like "Sure, I can help with that." Just answer the question directly.

    Answer:`;

    try {
        const response = await withExponentialBackoff(() => 
            ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: prompt,
            })
        );
        return response.text;
    } catch (error) {
        console.error('Gemini API error in chatWithContext:', error.message || error);
        throw error;
    }
};

/**
 * Explain a specific concept (Upgraded Persona)
 */
export const explainConcept = async (concept, context) => {
    const prompt = `You are a world-class professor explaining complex topics to a student.
    
    Task: Explain the concept of "${concept}" based on the provided context.
    
    Requirements:
    1. Start with a simple, one-sentence ELI5 (Explain Like I'm 5) definition.
    2. Dive into the technical details using the provided context.
    3. Provide a real-world analogy or example to cement their understanding.
    4. Use Markdown structuring for readability.

    Context:
    ${context}`;

    try {
        const response = await withExponentialBackoff(() => 
            ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: prompt,
            })
        );
        return response.text;
    } catch (error) {
        console.error('Gemini API error in explainConcept:', error.message || error);
        throw error;
    }
};