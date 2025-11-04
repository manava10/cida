import mongoose from 'mongoose';

const ChunkSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', index: true, required: true },
    page: { type: Number, index: true },
    text: { type: String, required: true },
    embedding: { type: [Number], default: [] }
  },
  { timestamps: true }
);

export const Chunk = mongoose.model('Chunk', ChunkSchema);


