import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', index: true, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    title: { type: String, required: true },
    mimeType: { type: String },
    sizeBytes: { type: Number },
    checksum: { type: String, index: true },
    status: { type: String, enum: ['uploaded', 'processing', 'ready', 'error'], default: 'uploaded' },
    originalPath: { type: String, required: true },
    textPath: { type: String },
    errorMessage: { type: String }
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', DocumentSchema);


