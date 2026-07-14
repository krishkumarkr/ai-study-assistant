import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import {fileURLToPath} from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import rateLimit from 'express-rate-limit'; // ⬅️ NEW: Imported the rate limiter

//ES6 module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Initialize express app
const app = express();

//Connect to MongoDB
connectDB();

// Middleware to handle CORS
app.use(
    cors({
        // This function dynamically allows localhost AND your phone's local network IP
        origin: function (origin, callback) {
            if (!origin || origin.includes('localhost') || origin.includes('192.168.1.7')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// 🛡️ LAYER 1: THE BOUNCER (Global Rate Limit)
// ==========================================
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 150, // Limit each IP to 150 requests per 15 minutes
    message: {
        success: false,
        error: "Too many requests from this IP, please try again after 15 minutes.",
        statusCode: 429
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// Apply it globally to ALL /api routes
app.use('/api', globalLimiter);

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);


app.use(errorHandler);

//404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        statusCode: 404
    });
});


//Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});