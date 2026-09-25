import mongoose from "mongoose";
import { encrypt, decrypt, isEncrypted } from "../utils/encryption.js";

const chatHistorySchema = new mongoose.Schema ({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    messages: [{
        role: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        relevantChunks: {
            type: [Number],
            default: []
        }
    }],
}, {
    timestamps: true
});

// ==========================================
// ENCRYPTION HOOKS (AES-256-GCM)
// ==========================================

/**
 * Pre-save hook: Encrypt message content before storing in MongoDB.
 * Only encrypts messages that aren't already encrypted (prevents double-encryption).
 */
chatHistorySchema.pre('save', function () {
    if (this.messages && this.messages.length > 0) {
        this.messages.forEach((msg) => {
            if (msg.content && !isEncrypted(msg.content)) {
                msg.content = encrypt(msg.content);
            }
        });
    }
});

// Helper: Decrypt all messages in a chat history document.

const decryptMessages = (doc) => {
    if (doc && doc.messages && doc.messages.length > 0) {
        doc.messages.forEach((msg) => {
            if (msg.content && isEncrypted(msg.content)) {
                msg.content = decrypt(msg.content);
            }
        });
    }
    return doc;
};

// Post-findOne hook: Decrypt message content after reading from MongoDB.

chatHistorySchema.post('findOne', function (doc) {
    return decryptMessages(doc);
});

// Post-find hook: Decrypt message content for bulk queries.
chatHistorySchema.post('find', function (docs) {
    if (Array.isArray(docs)) {
        docs.forEach(decryptMessages);
    }
    return docs;
});

// Index for faster queries
chatHistorySchema.index({ userId:1, documentId: 1});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;