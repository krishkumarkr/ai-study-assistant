import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    chunkIndex: {
        type: Number,
        required: true
    },
    pageNumber: {
        type: Number,
        default: 0
    },
    embedding: {
        type: [Number], // The 384-dimension float array!
        required: true
    }
});

// We do NOT add a Mongoose index for 'embedding'. 
// Vector indexes MUST be created in the MongoDB Atlas UI.
chunkSchema.index({ documentId: 1, chunkIndex: 1 });

const Chunk = mongoose.model('Chunk', chunkSchema);
export default Chunk;