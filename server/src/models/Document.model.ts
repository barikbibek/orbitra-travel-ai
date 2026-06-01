import mongoose, { Document, Schema, Types } from 'mongoose';

export type DocumentType = 'flight' | 'hotel' | 'train' | 'bus' | 'other';
export type FileType = 'pdf' | 'image';

export interface IDocument extends Document {
  userId:        Types.ObjectId;
  originalName:  string;
  fileType:      FileType;
  documentType:  DocumentType;
  storageKey:    string;       // S3 key or local filename
  storageUrl:    string;       // accessible URL
  extractedText: string;       
  isProcessed:   boolean;
  createdAt:     Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalName:  { type: String, required: true },
    fileType:      { type: String, enum: ['pdf', 'image'], required: true },
    documentType:  { type: String, enum: ['flight','hotel','train','bus','other'], default: 'other' },
    storageKey:    { type: String, required: true },
    storageUrl:    { type: String, required: true },
    extractedText: { type: String, default: '' },
    isProcessed:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fetching all docs of a user efficiently
DocumentSchema.index({ userId: 1, createdAt: -1 });

export const TravelDocument = mongoose.model<IDocument>('Document', DocumentSchema);