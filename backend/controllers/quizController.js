import Quiz from '../models/Quiz.js';

// @desc Get all quizzes for a document
// @route GET /api/quizzes/:documentId
// @access Private
export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1});

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });

    } catch(error) {
        next (error);
    }
};


// @desc Get a single quiz by id
// @route GET /api/quizzes/quiz/:id
// @access Private
export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });

    } catch(error) {
        next (error);
    }
};


// @desc Submit quiz answers
// @route POST /api/quizzes/:id/submit
// @access Private
export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json ({
                success: false,
                error: 'Please provide answers array',
                statusCode: 400
            });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if(quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'Quiz already completed',
                statusCode: 400
            });
        }

        const normalizeText = (str) => String(str).replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ").trim().toLowerCase();

        // Process answers
        let correctCount = 0;
        const userAnswers = [];

        answers.forEach(answer => {
            const { questionIndex, selectedAnswer } = answer;

            if (questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];
                
                // --- ROBUST BACKEND GRADING LOGIC ---
                const dbCorrectAnswer = String(question.correctAnswer || "").trim().toLowerCase();
                const isSkipped = !selectedAnswer || selectedAnswer === "Not Answered";
                
                let correctIndex = -1;
                
                // 1. Exact normalized string match
                let idx = question.options.findIndex(opt => normalizeText(opt) === normalizeText(dbCorrectAnswer));
                if (idx !== -1) {
                    correctIndex = idx;
                } else {
                    // 2. Substring match (e.g. "52" vs "52nd")
                    idx = question.options.findIndex(opt => {
                        const cleanOpt = normalizeText(opt);
                        const cleanDb = normalizeText(dbCorrectAnswer);
                        return cleanOpt.length > 0 && (cleanDb.includes(cleanOpt) || cleanOpt.includes(cleanDb));
                    });
                    if (idx !== -1) {
                        correctIndex = idx;
                    } 
                    // 3. Option formatting match (e.g., "Option A", "Option 1")
                    else if (dbCorrectAnswer.includes("option")) {
                        const numMatch = dbCorrectAnswer.match(/\d+/);
                        if (numMatch) {
                            correctIndex = parseInt(numMatch[0]) - 1;
                        } else {
                            const charMatch = dbCorrectAnswer.match(/[a-d]/);
                            if (charMatch) correctIndex = charMatch[0].charCodeAt(0) - 97;
                        }
                    } 
                    // 4. Letter formatting match (e.g., "A", "B")
                    else if (dbCorrectAnswer.length === 1 && /[a-d]/.test(dbCorrectAnswer)) {
                        correctIndex = dbCorrectAnswer.charCodeAt(0) - 97;
                    } 
                    // 5. Raw Index Number (e.g., "0", "1")
                    else if (/^\d+$/.test(dbCorrectAnswer)) {
                        const num = parseInt(dbCorrectAnswer);
                        if (num > 0 && num <= question.options.length) correctIndex = num - 1;
                        else if (num === 0) correctIndex = 0;
                    }
                }

                const userIndex = question.options.findIndex(opt => opt === selectedAnswer);
                
                // Final determination if they actually got it right
                const isCorrect = !isSkipped && userIndex !== -1 && userIndex === correctIndex;

                if (isCorrect) {
                    correctCount++;
                }

                userAnswers.push({
                    questionIndex,
                    selectedAnswer,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
        });

        // Calculate Score
        const score = Math.round((correctCount / quiz.totalQuestions) * 100);

        // Update quiz
        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                correctCount,
                totalQuestions: quiz.totalQuestions,
                percentage: score,
                userAnswers
            },
            message: 'Quiz submitted successfully'
        });

    } catch(error) {
        next (error);
    }
};


// @desc Get quiz results
// @route GET /api/quizzes/:id/results
// @access Private
export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title');

        if(!quiz) {
            return res.status(400).json({
                success:false,
                error: 'Quiz not found',
                statusCode: 400
            });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'Quiz not completed yet',
                statusCode: 400
            });
        }

        // Build detailed results
        const detailedResults = quiz.questions.map((question, index) => {
        const userAnswer = quiz.userAnswers.find(a => a.questionIndex === index);

        return {
            questionIndex: index,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            selectedAnswer: userAnswer?.selectedAnswer || null,
            isCorrect: userAnswer?.isCorrect || false,
            explanation: question.explanation
        };
        });

        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    document: quiz.documentId,
                    score: quiz.score,
                    totalQuestions: quiz.totalQuestions,
                    completedAt: quiz.completedAt
                },
                results: detailedResults
            }
        });

    } catch(error) {
        next (error);
    }
};


// @desc Delete quiz
// @route DELETE /api/quizzes/:id
// @access Private
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        await quiz.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Quiz delete successfully',
            statusCode: 200
        });

    } catch(error) {
        next (error);
    }
};