import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { processDocumentsAndGenerate } from '../services/itinerary.service';

export const uploadDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    // multer add files in  req.files
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('Please upload at least one document', 400);
    }

    if (files.length > 5) {
      throw new AppError('Maximum 5 documents per upload', 400);
    }

    const userId = req.user!._id.toString();

    // full pipeline: store → extract → generate → save
    const itinerary = await processDocumentsAndGenerate(files, userId);

    res.status(201).json({
      success: true,
      message: 'Itinerary generated successfully',
      itinerary,
    });
  }
);