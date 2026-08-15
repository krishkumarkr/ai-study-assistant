import rateLimit from 'express-rate-limit';

// The Global Bouncer (For standard CRUD operations)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // 150 requests per IP
    message: {
        success: false,
        error: "Too many requests from this IP, please try again after 15 minutes.",
        statusCode: 429
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// The Vault Guard (Strict limit for expensive LLM operations)
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // ONLY 20 requests per IP!
    message: {
        success: false,
        error: "AI generation limit reached. Please wait 15 minutes to prevent system overload.",
        statusCode: 429
    },
    standardHeaders: true, 
    legacyHeaders: false,
});