import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    console.error('FATAL ERROR: OPENROUTER_API_KEY is missing.');
    process.exit(1);
}

// 🏆 THE ROUTING DICTIONARY
const MODELS = {
    // // Heavy Lifter: Massive context, high reasoning (Google)
    // SUMMARY_EXPLAIN: "meta-llama/llama-3.1-8b-instruct:free",
    
    // // Data Generator: Lightning fast JSON output (Meta via Groq)
    // FLASHCARD_QUIZ: "meta-llama/llama-3.1-8b-instruct:free",
    
    // // Conversationalist: Fast, high reasoning (Meta via Groq)
    // CHAT: "meta-llama/llama-3.3-70b-instruct:free"

    SUMMARY_EXPLAIN: "openrouter/free",
    FLASHCARD_QUIZ: "openrouter/free",
    CHAT: "openrouter/free"
    
};

const withExponentialBackoff = async (operation, maxRetries = 3, baseDelayMs = 1000) => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await operation();
        } catch (error) {
            if (attempt < maxRetries - 1) {
                attempt++;
                const waitTime = baseDelayMs * Math.pow(2, attempt - 1);
                console.warn(`[LLM Service] Network/Rate limit hit. Retrying in ${waitTime}ms...`);
                await new Promise(res => setTimeout(res, waitTime));
            } else {
                throw error;
            }
        }
    }
};

const callOpenRouter = async (prompt, model, isJson = false) => {
    const operation = async () => {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://yourwebsite.com", // Replace in production
                "X-Title": "AI Study Assistant",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }],
                // Force JSON output if the model supports it
                response_format: isJson ? { type: "json_object" } : undefined
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        let text = data.choices[0].message.content;

        // Fallback JSON parser just in case the model wraps output in markdown tags
        if (isJson) {
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        }

        return text;
    };

    return await withExponentialBackoff(operation);
};

// ==========================================
// EXPORTED FEATURE ENDPOINTS
// ==========================================

export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Extract the most important facts and concepts from the text below. Generate exactly ${count} flashcards. 
    Output ONLY a valid JSON object containing an array named "cards". 
    Schema: { "cards": [{ "question": "string", "answer": "string", "difficulty": "easy|medium|hard" }] }
    Text: ${text}`;

    const data = await callOpenRouter(prompt, MODELS.FLASHCARD_QUIZ, true);
    return data.cards.slice(0, count);
};

export const generateQuiz = async (text, numQuestions = 5) => {
    const prompt = `Create exactly ${numQuestions} challenging multiple-choice questions based on the text below.
    Output ONLY a valid JSON object containing an array named "questions".
    Schema: { "questions": [{ "question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": "string", "explanation": "string", "difficulty": "easy|medium|hard" }] }
    Text: ${text}`; 

    const data = await callOpenRouter(prompt, MODELS.FLASHCARD_QUIZ, true);
    return data.questions.slice(0, numQuestions);
};

export const chatWithContext = async (question, relevantChunks) => {
    const context = relevantChunks.map((c, i) => `[Section ${i + 1}]\n${c.content}`).join('\n\n');
    const prompt = `You are a study assistant. Answer the user's question based strictly on the Source Material. Use Markdown.
    Source Material:\n${context}\n\nQuestion: "${question}"`;

    return await callOpenRouter(prompt, MODELS.CHAT, false);
};

export const explainConcept = async (concept, context) => {
    const prompt = `You are a professor. Explain the concept of "${concept}" based on the provided context. Start with a simple ELI5 definition, dive into technical details, and provide a real-world analogy.
    Context:\n${context}`;

    return await callOpenRouter(prompt, MODELS.SUMMARY_EXPLAIN, false);
};

export const generateSummary = async (text) => {
    const prompt = `Provide a comprehensive summary of the provided text. Include an Executive Overview, a section-by-section breakdown using Markdown headers, and a bulleted list of 5 key takeaways.
    Text:\n${text}`; 

    return await callOpenRouter(prompt, MODELS.SUMMARY_EXPLAIN, false);
};