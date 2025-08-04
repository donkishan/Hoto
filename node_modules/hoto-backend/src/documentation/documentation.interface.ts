import { Document } from 'mongoose';

export interface Documentation extends Document {
  projectId: string;
  projectName: string;
  documents: {
    documentName: string;
    noOfDocuments: number;
    division: string;
    divisionName: string;
  }[];
}
