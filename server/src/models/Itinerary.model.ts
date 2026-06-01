import mongoose, { Document, Schema, Types } from 'mongoose';

// Nested structure foor a single day's plan
interface DayPlan {
  day:        number;
  date:       string;
  location:   string;
  activities: string[];
  accommodation?: string;
  transport?:     string;
  notes?:         string;
}

export interface IItinerary extends Document {
  userId:      Types.ObjectId;
  documentIds: Types.ObjectId[];   // which uploads generated this
  title:       string;
  destination: string;
  startDate:   string;
  endDate:     string;
  days:        DayPlan[];
  rawAiOutput: string;             // full Gemini response for debugging
  shareToken:  string;             
  isShared:    boolean;
  createdAt:   Date;
}

const DayPlanSchema = new Schema<DayPlan>(
  {
    day:           { type: Number, required: true },
    date:          { type: String, required: true },
    location:      { type: String, required: true },
    activities:    [{ type: String }],
    accommodation: { type: String },
    transport:     { type: String },
    notes:         { type: String },
  },
  { _id: false }  // no separate _id for subdocuments
);

const ItinerarySchema = new Schema<IItinerary>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    documentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    title:       { type: String, required: true },
    destination: { type: String, required: true },
    startDate:   { type: String, required: true },
    endDate:     { type: String, required: true },
    days:        [DayPlanSchema],
    rawAiOutput: { type: String, default: '' },
    shareToken:  { type: String, unique: true, index: true },
    isShared:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Fetch history for a user
ItinerarySchema.index({ userId: 1, createdAt: -1 });

export const Itinerary = mongoose.model<IItinerary>('Itinerary', ItinerarySchema);