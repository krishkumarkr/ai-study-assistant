import User from '../models/User.js';

export const getLimits = (email) => {
    const admin_email = "krishkrsquare@gmail.com";

    if (admin_email === email) {
        return {
            summaries: 999,
            quizzes: 999,
            flashcards: 999,
            explanations: 999,
            chats: 9999
        };
    } else {
        return {
            summaries: 3,
            quizzes: 3,
            flashcards: 3,
            explanations: 10,
            chats: 20
        };
    }
};

export const checkQuota = (feature) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id);

            // Fetch the exact limits for this specific user's email
            const LIMITS = getLimits(user.email);

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