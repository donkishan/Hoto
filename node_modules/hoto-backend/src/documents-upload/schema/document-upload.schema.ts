import { Schema } from 'mongoose';

export const DocumentsUploadSchema = new Schema(
  {
    documentId: { type: String, required: true },
    projectId: { type: String, required: true },
    uploadedLinks: { type: [String], required: true },
    uploadedCount: { type: Number, default: 0 },
    acceptedByOM: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);
