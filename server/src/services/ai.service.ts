import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import pdf from 'pdf-parse';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

// STEP 1: Extract travel info from document

export interface ExtractedTravelData {
  documentType: 'flight' | 'hotel' | 'train' | 'bus' | 'other';
  passengerName?: string;
  from?:          string;
  to?:            string;
  departureDate?: string;
  arrivalDate?:   string;
  checkIn?:       string;
  checkOut?:      string;
  hotelName?:     string;
  flightNumber?:  string;
  pnr?:           string;
  rawText:        string; 
}

export const extractFromDocument = async (
  buffer:      Buffer,
  mimeType:    string,
  originalName: string
): Promise<ExtractedTravelData> => {

  let prompt: string;
  let parts:  Part[];

  const extractionInstruction = `
    You are a travel document parser. Extract all relevant travel information.
    Return ONLY a valid JSON object with these fields (omit fields you cannot find):
    {
      "documentType": "flight | hotel | train | bus | other",
      "passengerName": "",
      "from": "",
      "to": "",
      "departureDate": "YYYY-MM-DD",
      "arrivalDate": "YYYY-MM-DD",
      "checkIn": "YYYY-MM-DD",
      "checkOut": "YYYY-MM-DD",
      "hotelName": "",
      "flightNumber": "",
      "pnr": "",
      "rawText": "full text content of the document"
    }
    No markdown, no backticks, no explanation. Pure JSON only.
  `;

  if (mimeType === 'application/pdf') {
    // For PDFs — parse text first, then send text to Gemini
    // More reliable than sending PDF bytes directly
    const parsed = await pdf(buffer);
    const text = parsed.text.trim();

    if (!text) throw new AppError('Could not extract text from PDF', 422);

    prompt = `${extractionInstruction}\n\nDocument text:\n${text}`;
    parts  = [{ text: prompt }];

  } else {
    // For images — send directly to Gemini Vision
    const base64 = buffer.toString('base64');
    parts = [
      { text: extractionInstruction },
      {
        inlineData: {
          mimeType: mimeType as any,
          data:     base64,
        },
      },
    ];
  }

  const result   = await model.generateContent(parts);
  const response = result.response.text().trim();

  try {
    // Strip any accidental markdown fences
    const clean   = response.replace(/```json|```/g, '').trim();
    const parsed  = JSON.parse(clean) as ExtractedTravelData;
    return parsed;
  } catch {
    throw new AppError('AI failed to return valid JSON for extraction', 502);
  }
};

// STEP 2: Generate itinerary from extracted data

export interface GeneratedItinerary {
  title:       string;
  destination: string;
  startDate:   string;
  endDate:     string;
  days: {
    day:           number;
    date:          string;
    location:      string;
    activities:    string[];
    accommodation?: string;
    transport?:    string;
    notes?:        string;
  }[];
}

export const generateItinerary = async (
  extractedDocuments: ExtractedTravelData[]
): Promise<{ structured: GeneratedItinerary; raw: string }> => {

  const documentsContext = extractedDocuments
    .map((doc, i) => `Document ${i + 1} (${doc.documentType}):\n${JSON.stringify(doc, null, 2)}`)
    .join('\n\n');

  const prompt = `
    You are a travel itinerary planner. Based on the following travel booking documents,
    generate a detailed, structured day-by-day itinerary.

    Travel Documents:
    ${documentsContext}

    Instructions:
    - Create a logical day-by-day plan connecting all bookings
    - Add realistic activity suggestions for each location
    - Account for travel time between locations
    - Be specific with times and places
    - Return ONLY a valid JSON object in this exact format:
    {
      "title": "Trip title e.g. Paris & Rome Adventure",
      "destination": "Primary destination",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "days": [
        {
          "day": 1,
          "date": "YYYY-MM-DD",
          "location": "City, Country",
          "activities": [
            "9:00 AM - Arrive at Charles de Gaulle Airport",
            "11:00 AM - Check in at Hotel XYZ",
            "2:00 PM - Visit Eiffel Tower"
          ],
          "accommodation": "Hotel name if any",
          "transport": "Flight/Train/Bus details if any",
          "notes": "Any tips or reminders"
        }
      ]
    }
    No markdown, no backticks, no explanation. Pure JSON only.
  `;

  const result  = await model.generateContent(prompt);
  const raw     = result.response.text().trim();

  try {
    const clean      = raw.replace(/```json|```/g, '').trim();
    const structured = JSON.parse(clean) as GeneratedItinerary;
    return { structured, raw };
  } catch {
    throw new AppError('AI failed to generate a valid itinerary', 502);
  }
};