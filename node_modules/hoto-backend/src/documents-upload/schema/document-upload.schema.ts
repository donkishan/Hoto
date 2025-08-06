import { Schema } from 'mongoose';

export const DocumentsUploadSchema = new Schema(
  {
    documentId: { type: String, required: true },
    projectId: { type: String, required: true },
    
    uploadedLinks: [
      {
        link: { type: String, required: true },
        status: {
          type: String,
          enum: ['approved', 'rejected', 'pending'],
          default: 'pending'
        }
      }
    ],

    uploadedCount: { type: Number, default: 0 },
    acceptedByOM: { type: Number, default: 0 },
    rejectedByOM: { type: Number, default: 0 },
  },
  { timestamps: true }
);
