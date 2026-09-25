import User from '../models/User.js';

export const getLimits = (email) => {
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

    if (adminEmails.includes(email.toLowerCase())) {
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
            const LIMITS = getLimits(user.email);

            const now = new Date();

            // Guard against missing or invalid lastReset
            const rawLastReset = user.aiUsage?.lastReset;
            const lastReset = rawLastReset ? new Date(rawLastReset) : new Date(0);
            const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

            if (isNaN(hoursSinceReset) || hoursSinceReset >= 24) {
                // Atomic reset to avoid race conditions with $inc in controllers
                await User.findByIdAndUpdate(user._id, {
                    $set: {
                        'aiUsage.summaries': 0,
                        'aiUsage.quizzes': 0,
                        'aiUsage.flashcards': 0,
                        'aiUsage.explanations': 0,
                        'aiUsage.chats': 0,
                        'aiUsage.lastReset': now
                    }
                });

                // Refresh local object so the limit check below uses reset values
                user.aiUsage.summaries = 0;
                user.aiUsage.quizzes = 0;
                user.aiUsage.flashcards = 0;
                user.aiUsage.explanations = 0;
                user.aiUsage.chats = 0;
                user.aiUsage.lastReset = now;
            }

            if (user.aiUsage[feature] >= LIMITS[feature]) {
                const hoursLeft = Math.max(1, Math.ceil(24 - hoursSinceReset));
                return res.status(403).json({
                    success: false,
                    error: "You've used all " + LIMITS[feature] + " daily " + feature + ". Your limits reset in " + hoursLeft + " hours.",
                    statusCode: 403
                });
            }

            next();

        } catch (error) {
            next(error);
        }
    };
};