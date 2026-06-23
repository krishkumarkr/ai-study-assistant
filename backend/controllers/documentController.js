import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import { uploadToR2, deleteFromR2 } from '../utils/r2Storage.js';
import mongoose from 'mongoose';

// Notice: 'fs' and 'path' are completely removed because we no longer touch the hard drive!

// @desc    Upload PDF document
// @route   POST /api/document/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if (!title) {
            // No need to delete a local file here anymore, the RAM buffer will just clear itself
            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400
            });
        }

        // 1. Upload the file buffer from RAM directly to Cloudflare R2
        const publicFileUrl = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
        
        // 2. Extract the unique filename from the URL to store in the DB
        const uniqueFileName = publicFileUrl.split('/').pop();

        // 3. Create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: uniqueFileName,
            filePath: publicFileUrl, // Store the production R2 cloud URL!
            fileSize: req.file.size,
            status: 'processing'
        });

        // 4. Process PDF in background using the RAM buffer
        processPDF(document._id, req.file.buffer).catch(err => {
            console.error('PDF processing error:', err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully. Processing in progress...'
        });

    } catch (error) {
        // No local file cleanup needed on error anymore
        next(error);
    }
};

// Helper function to process PDF
// Changed parameter from 'filePath' to 'fileBuffer'
const processPDF = async (documentId, fileBuffer) => {
    try {
        // Extract text directly from the memory buffer
        const { text } = await extractTextFromPDF(fileBuffer);

        // Create chunks
        const chunks = chunkText(text, 500, 50);

        // Update document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user._id) }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes'}
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: {
                    uploadDate: -1
                }
            }
        ]);

        res.status(200).json ({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get single document with chunks
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Get counts of associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({
            documentId: document._id,
            userId: req.user._id
        });

        const quizCount = await Quiz.countDocuments({
            documentId: document._id,
            userId: req.user._id
        });

        // Update last accessed
        document.lastAccessed = Date.now();
        await document.save();

        // Combine document data with counts
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json ({
            success: true,
            data: documentData
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne ({
            _id: req.params.id,
            userId: req.user._id
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // 1. Extract just the filename from the R2 URL
        const fileName = document.filePath.split('/').pop();

        // 2. Delete file from Cloudflare R2 bucket
        await deleteFromR2(fileName).catch((err) => {
            console.error(`Could not delete file from Cloudflare R2: ${fileName}`, err.message);
        });

        // 3. Delete document from MongoDB
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};