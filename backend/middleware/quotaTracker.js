// middleware/quotaTracker.js
import User from '../models/User.js';

// Define your generous free tier limits here
const LIMITS = {
    summaries: 10,
    quizzes: 5,
    flashcards: 5,
    explanations: 15,
    chats: 30
};

export const checkQuota = (feature) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id);

            // Check if we need to reset their daily limits
            const now = new Date();
            const lastReset = new Date(user.aiUsage.lastReset);
            const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

            if (hoursSinceReset >= 24) {
                // It's a new day! Reset everything.
                user.aiUsage = {
                    summaries: 0,
                    quizzes: 0,
                    flashcards: 0,
                    explanations: 0,
                    chats: 0,
                    lastReset: now
                };
                await user.save();
            }

            // Check if they have exceeded the limit for this specific feature
            if (user.aiUsage[feature] >= LIMITS[feature]) {
                return res.status(403).json({
                    success: false,
                    error: `You have reached your daily limit of ${LIMITS[feature]} ${feature}. Please come back tomorrow!`,
                    statusCode: 403
                });
            }

            // If they are good, move to the next step
            next();
            
        } catch (error) {
            next(error);
        }
    };
};