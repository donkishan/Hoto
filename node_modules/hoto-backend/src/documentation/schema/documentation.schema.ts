import { Schema } from 'mongoose';

export const DocumentationSchema = new Schema({
  // documentation.schema.ts

  projectId: { type: String, required: true },
  projectName: { type: String, required: true },
  documents: [
    {
      documentName: String,
      noOfDocuments: Number,
      division: String,
      divisionName: String,
    }
  ],
}, { timestamps: true });
