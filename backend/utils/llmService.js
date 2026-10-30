import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    console.error('FATAL ERROR: OPENROUTER_API_KEY is missing.');
    process.exit(1);
}

// ==========================================
// CONFIG
// ==========================================

const BIG = "meta-llama/llama-3.3-70b-instruct";   // accuracy: chat, explain, quiz
const SMALL = "meta-llama/llama-3.1-8b-instruct";  // low cost: flashcards, summary parts

// Each feature has its own model. Override from .env without touching code.
const MODELS = {
    CHAT: process.env.MODEL_CHAT || BIG,
    EXPLAIN: process.env.MODEL_EXPLAIN || BIG,
    QUIZ: process.env.MODEL_QUIZ || BIG,
    FLASHCARD: process.env.MODEL_FLASHCARD || SMALL,
    SUMMARY: process.env.MODEL_SUMMARY || SMALL             // summarizes the document part by part
};

// Hard input caps (characters). ~4 chars = 1 token.
// Protects you if a controller accidentally sends the whole PDF.
const LIMITS = {
    FLASHCARD_QUIZ_CHARS: 16000,  // ~4,000 tokens (6 chunks)
    SUMMARY_PART_CHARS: 30000,    // ~7,500 tokens per summary part (a 10k-word doc is ~12K chars per part)
    RAG_CHARS: 12000,             // ~3,000 tokens (top 3 chunks)
    MAX_CHUNKS: 3
};

const SUMMARY_PARTS = 5;          // the document is split into at most this many parts, summarized separately and joined in order

const REQUEST_TIMEOUT_MS = 30000;
const DEBUG = process.env.LLM_DEBUG === 'true' || process.env.NODE_ENV !== 'production';

// ==========================================
// RETRY: only for errors that can succeed later
// ==========================================

const withExponentialBackoff = async (operation, maxRetries = 3, baseDelayMs = 1000) => {
    for (let attempt = 1; ; attempt++) {
        try {
            return await operation();
        } catch (error) {
            // 401 (bad key), 402 (no credits), 400 (bad request) will never succeed on retry.
            if (!error.retryable || attempt >= maxRetries) throw error;
            const waitTime = baseDelayMs * Math.pow(2, attempt - 1);
            console.warn(`[LLM Service] ${error.message}. Retry ${attempt}/${maxRetries - 1} in ${waitTime}ms...`);
            await new Promise(res => setTimeout(res, waitTime));
        }
    }
};

// ==========================================
// JSON helper: pulls the JSON object out of the model's text
// ==========================================

const parseJsonSafely = (text) => {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Model did not return JSON');
    return JSON.parse(cleaned.slice(start, end + 1));
};

// ==========================================
// CORE CALL
// ==========================================

const callOpenRouter = async (prompt, { label, model, isJson = false, maxTokens = 800, temperature = 0.4 }) => {
    const operation = async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const startedAt = Date.now();

        let response;
        try {
            response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": process.env.APP_URL || "http://localhost:5173",
                    "X-Title": "AI Study Assistant",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: maxTokens,
                    temperature,
                    response_format: isJson ? { type: "json_object" } : undefined,
                    provider: {
                        order: ["groq"],            // fastest host first
                        allow_fallbacks: true,      // if Groq is down, use another host
                        require_parameters: isJson  // only hosts that support JSON mode
                    }
                })
            });
        } catch (networkError) {
            // timeout or network drop: worth retrying
            const e = new Error(`Network error (${networkError.name})`);
            e.retryable = true;
            throw e;
        } finally {
            clearTimeout(timer);
        }

        if (!response.ok) {
            const err = await response.text();
            const e = new Error(`OpenRouter API Error: ${response.status} - ${err}`);
            e.status = response.status;   // lets the controller decide by status code, not by message text
            e.retryable = response.status === 429 || response.status >= 500;
            throw e;
        }

        const data = await response.json();
        const finish = data.choices?.[0]?.finish_reason;

        if (DEBUG) {
            const u = data.usage || {};
            console.log(
                `[LLM] ${label} | model=${data.model} | provider=${data.provider} | ` +
                `in=${u.prompt_tokens} out=${u.completion_tokens} | finish=${finish} | ${Date.now() - startedAt}ms`
            );
        }

        // "length" means the model hit max_tokens, so the answer may be cut off
        if (finish === 'length') {
            console.warn(`[LLM] ${label} stopped at the max_tokens limit; the output may be cut off.`);
        }

        const text = data.choices?.[0]?.message?.content;
        if (!text) {
            const e = new Error('Empty response from model');
            e.retryable = true;
            throw e;
        }
        return text;
    };

    const text = await withExponentialBackoff(operation);

    // Parse OUTSIDE the retry loop: a bad JSON should not silently re-bill the same prompt.
    return isJson ? parseJsonSafely(text) : text;
};

// ==========================================
// EXPORTED FEATURE ENDPOINTS
// ==========================================

export const generateFlashcards = async (text, count = 10) => {
    const safeText = text.slice(0, LIMITS.FLASHCARD_QUIZ_CHARS);
    const prompt = `Extract the most important facts and concepts from the text below. Generate exactly ${count} flashcards.
The text comes from different parts of one document. Spread the flashcards across all parts.
Output ONLY a valid JSON object containing an array named "cards".
Schema: { "cards": [{ "question": "string", "answer": "string", "difficulty": "easy|medium|hard" }] }
Keep each answer under 40 words.
Text: ${safeText}`;

    const data = await callOpenRouter(prompt, {
        label: 'flashcards',
        model: MODELS.FLASHCARD,
        isJson: true,
        maxTokens: count * 120 + 100,
        temperature: 0.2
    });

    if (!Array.isArray(data.cards)) throw new Error('Invalid flashcard format from model');
    return data.cards.slice(0, count);
};

export const generateQuiz = async (text, numQuestions = 5) => {
    const safeText = text.slice(0, LIMITS.FLASHCARD_QUIZ_CHARS);
    const prompt = `Create exactly ${numQuestions} challenging multiple-choice questions based on the text below.
The text comes from different parts of one document. Spread the questions across all parts.
Output ONLY a valid JSON object containing an array named "questions".
Schema: { "questions": [{ "question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": "string", "explanation": "string", "difficulty": "easy|medium|hard" }] }
Rules: exactly 4 options, only one correct, and "correctAnswer" must be copied exactly from one of the options. Keep each explanation under 30 words.
Text: ${safeText}`;

    const data = await callOpenRouter(prompt, {
        label: 'quiz',
        model: MODELS.QUIZ,
        isJson: true,
        maxTokens: numQuestions * 250 + 100,
        temperature: 0.2
    });

    if (!Array.isArray(data.questions)) throw new Error('Invalid quiz format from model');

    // Drop broken questions instead of showing a wrong quiz to the user
    const valid = data.questions.filter(q =>
        q && Array.isArray(q.options) && q.options.length === 4 && q.options.includes(q.correctAnswer)
    );
    if (valid.length === 0) throw new Error('Quiz had no valid questions');
    return valid.slice(0, numQuestions);
};

export const chatWithContext = async (question, relevantChunks) => {
    const context = relevantChunks
        .slice(0, LIMITS.MAX_CHUNKS)
        .map((c, i) => `[Section ${i + 1}]\n${c.content}`)
        .join('\n\n')
        .slice(0, LIMITS.RAG_CHARS);

    const prompt = `You are a study assistant. Answer the user's question based strictly on the Source Material. Use Markdown.
If the answer is not in the Source Material, say "This is not covered in the document."
Source Material:\n${context}\n\nQuestion: "${question}"`;

    return await callOpenRouter(prompt, {
        label: 'chat',
        model: MODELS.CHAT,
        maxTokens: 600,
        temperature: 0.3
    });
};

export const explainConcept = async (concept, context) => {
    const safeContext = context.slice(0, LIMITS.RAG_CHARS);
    const prompt = `You are a professor. Explain the concept of "${concept}" based on the provided context. Start with a simple ELI5 definition, dive into technical details, and provide a real-world analogy.
If the context does not cover this concept, say "This is not covered in the document."
Context:\n${safeContext}`;

    return await callOpenRouter(prompt, {
        label: 'explain',
        model: MODELS.EXPLAIN,
        maxTokens: 700,
        temperature: 0.4
    });
};

// ==========================================
// SUMMARY: summarize in 5 parts (cheap model), then join the parts in code
// ==========================================

// Splits the ordered chunk list into at most `parts` groups of consecutive chunks.
const groupChunks = (chunks, parts) => {
    const size = Math.ceil(chunks.length / parts);
    const groups = [];
    for (let i = 0; i < chunks.length; i += size) {
        groups.push(
            chunks
                .slice(i, i + size)
                .map(c => c.content)
                .join('\n\n')
                .slice(0, LIMITS.SUMMARY_PART_CHARS)
        );
    }
    return groups;
};

// Makes one part summary safe to join with the others:
// same heading level, no code fences, no "Here is the summary:" style intro.
const cleanPart = (text) => {
    let lines = String(text)
        .split('\n')
        .filter(l => !/^\s*```/.test(l))
        .map(l => l.replace(/^#{1,6}\s+/, '### '));
    const firstHeading = lines.findIndex(l => l.startsWith('### '));
    if (firstHeading > 0) lines = lines.slice(firstHeading);
    return lines.join('\n').trim();
};

const headingKey = (line) => line.replace(/^###\s*/, '').replace(/[*_:]/g, '').trim().toLowerCase();

// Joins the part summaries in order. If a part starts with the same topic heading
// the previous part ended with, the topic simply continues (the repeated heading is dropped).
const stitchParts = (partials) => {
    const out = [];
    let lastHeading = null;
    for (const part of partials) {
        const lines = cleanPart(part).split('\n');
        const firstIdx = lines.findIndex(l => l.trim() !== '');
        if (firstIdx !== -1 && lines[firstIdx].startsWith('### ') && headingKey(lines[firstIdx]) === lastHeading) {
            lines.splice(firstIdx, 1);
        }
        for (const l of lines) {
            if (l.startsWith('### ')) lastHeading = headingKey(l);
            out.push(l);
        }
        out.push('');
    }
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

export const generateSummary = async (input) => {
    // Normal use: an ordered array of chunks ({ content }).
    // A plain string is also accepted, so an older caller cannot crash this function.
    const chunks = (Array.isArray(input) ? input : [{ content: String(input || '') }])
        .filter(c => c && typeof c.content === 'string' && c.content.trim());

    if (chunks.length === 0) throw new Error('No content to summarize');

    const groups = groupChunks(chunks, Math.min(SUMMARY_PARTS, chunks.length));

    // Step 1: summarize every part at the same time with the cheap model, in one fixed format.
    const partials = await Promise.all(groups.map((text, i) =>
        callOpenRouter(
            `You are summarizing one part of a longer document for a student who will study from the summary.
Write 350-450 words in Markdown, using EXACTLY this format:

### Topic name
- specific detail (a definition, step, number, name or example)
- specific detail

Repeat for each topic in the text.

Rules:
- Use only "###" headings and "-" bullets. No intro line and no closing line.
- If the text has its own headings, use them as the topic names.
- The text may start or end in the middle of a topic. Still write the heading for it.
- Never write "this part", "this section" or "part ${i + 1}". State the real content.
- Never write vague lines. Give the actual facts.

Text:
${text}`,
            { label: `summary-part-${i + 1}`, model: MODELS.SUMMARY, maxTokens: 1400, temperature: 0.2 }
        )
    ));

    // Join the part summaries in code: no extra model call, and every detail is kept.
    return stitchParts(partials);
};