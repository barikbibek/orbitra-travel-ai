import { Types } from 'mongoose';
import { Itinerary } from '../models/Itinerary.model';
import { TravelDocument } from '../models/Document.model';
import { AppError } from '../utils/AppError';
import { generateShareToken } from '../utils/shareToken';
import {
  extractFromDocument,
  generateItinerary,
  ExtractedTravelData,
} from './ai.service';
import {
  uploadToS3,
  isS3Enabled,
} from './s3.service';
import { getCache, setCache, deleteCache, deleteCachePattern } from '../utils/cache';

import * as fs from 'fs';
import * as path from 'path';

// Cache TTLs
const HISTORY_TTL  = 60 * 2;   
const ITINERARY_TTL = 60 * 10; 
const SHARED_TTL   = 60 * 15;  

// Upload file , S3 or local fallback

export const storeFile = async (
  file: Express.Multer.File,
  userId: string
): Promise<{ storageKey: string; storageUrl: string }> => {

  const ext        = path.extname(file.originalname);
  const storageKey = `uploads/${userId}/${Date.now()}${ext}`;

  if (isS3Enabled()) {
    const storageUrl = await uploadToS3(file.buffer, storageKey, file.mimetype);
    return { storageKey, storageUrl };
  }

  // Local fallback — save to /uploads directory
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const localPath = path.join(uploadDir, `${Date.now()}${ext}`);
  fs.writeFileSync(localPath, file.buffer);

  return {
    storageKey: localPath,
    storageUrl: `/uploads/${path.basename(localPath)}`,
  };
};

// Process uploaded documents & generate itinerary

export const processDocumentsAndGenerate = async (
  files:  Express.Multer.File[],
  userId: string
): Promise<InstanceType<typeof Itinerary>> => {

  // store all files and extract data in parallel
  const processedDocs = await Promise.all(
    files.map(async (file) => {
      const { storageKey, storageUrl } = await storeFile(file, userId);

      // extract travel data using AI
      const extracted: ExtractedTravelData = await extractFromDocument(
        file.buffer,
        file.mimetype,
        file.originalname
      );

      // save document 
      const doc = await TravelDocument.create({
        userId,
        originalName:  file.originalname,
        fileType:      file.mimetype === 'application/pdf' ? 'pdf' : 'image',
        documentType:  extracted.documentType,
        storageKey,
        storageUrl,
        extractedText: extracted.rawText,
        isProcessed:   true,
      });

      return { doc, extracted };
    })
  );

  const documentIds  = processedDocs.map(d => d.doc._id);
  const extractedAll = processedDocs.map(d => d.extracted);

  // generate itinerary from all extracted data
  const { structured, raw } = await generateItinerary(extractedAll);

  // save itinerary to DB
  const itinerary = await Itinerary.create({
    userId,
    documentIds,
    title:       structured.title,
    destination: structured.destination,
    startDate:   structured.startDate,
    endDate:     structured.endDate,
    days:        structured.days,
    rawAiOutput: raw,
    shareToken:  generateShareToken(),
    isShared:    false,
  });

  return itinerary;
};

// get user's itinerary history 

export const getUserItineraries = async (userId: string) => {
  const cacheKey = `itineraries:history:${userId}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const itineraries = await Itinerary
    .find({ userId })
    .select('-rawAiOutput -days')
    .sort({ createdAt: -1 });

  await setCache(cacheKey, itineraries, HISTORY_TTL);
  return itineraries;
};

// get single itinerary, must belong to user

export const getItineraryById = async (
  itineraryId: string,
  userId:      string
) => {
  const cacheKey = `itineraries:detail:${itineraryId}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const itinerary = await Itinerary.findOne({
    _id:    new Types.ObjectId(itineraryId),
    userId: new Types.ObjectId(userId),
  });

  if (!itinerary) throw new AppError('Itinerary not found', 404);

  await setCache(cacheKey, itinerary, ITINERARY_TTL);
  return itinerary;
};

// Get shared itinerary by token ,public — no auth

export const getSharedItinerary = async (token: string) => {
  const cacheKey = `itineraries:shared:${token}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const itinerary = await Itinerary.findOne({
    shareToken: token,
    isShared:   true,
  });

  if (!itinerary) throw new AppError('Shared itinerary not found', 404);

  await setCache(cacheKey, itinerary, SHARED_TTL);
  return itinerary;
};

// toggle share on/off

export const toggleShare = async (itineraryId: string, userId: string) => {
  const itinerary = await Itinerary.findOne({
    _id: new Types.ObjectId(itineraryId),
    userId: new Types.ObjectId(userId),
  });
  if (!itinerary) throw new AppError('Itinerary not found', 404);

  itinerary.isShared = !itinerary.isShared;
  await itinerary.save();

  // Invalidate affected cache keys
  await deleteCache(`itineraries:detail:${itineraryId}`);
  await deleteCache(`itineraries:shared:${itinerary.shareToken}`);
  await deleteCachePattern(`itineraries:history:${userId}`);

  return itinerary;
};

//delete itinerary 

export const deleteItinerary = async (
  itineraryId: string,
  userId:      string
): Promise<void> => {
  const itinerary = await Itinerary.findOne({
    _id: new Types.ObjectId(itineraryId),
    userId: new Types.ObjectId(userId),
  });
  if (!itinerary) throw new AppError('Itinerary not found', 404);

  await itinerary.deleteOne();

  // Invalidate all related cache
  await deleteCache(`itineraries:detail:${itineraryId}`);
  await deleteCache(`itineraries:shared:${itinerary.shareToken}`);
  await deleteCachePattern(`itineraries:history:${userId}`);
};