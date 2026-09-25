import express from 'express';
import {body, validationResult} from 'express-validator';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';

// console.log('Is protect defined?', typeof protect);
// console.log('Is updateProfile defined?', typeof updateProfile);

const router = express.Router();

//Validation middleware
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min:3 })
        .withMessage('Username must be at least 3 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6})
        .withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Middleware to check validation results and return 400 if errors exist
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array().map(e => e.msg).join(', '),
            statusCode: 400,
        });
    }
    next();
};

//Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

//Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;