import { Document } from 'mongoose';

export interface Project extends Document {
  projectId: string;
  projectName: string;
  plantPower: string;
}
