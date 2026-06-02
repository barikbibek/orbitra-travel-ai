import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getUserItineraries,
  getItineraryById,
  getSharedItinerary,
  toggleShare,
  deleteItinerary,
} from '../services/itinerary.service';
import { env } from '../config/env';

// history 

export const getHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const itineraries = await getUserItineraries(req.user!._id.toString());
    res.json({ success: true, itineraries });
  }
);

// get single itinerary detail

export const getOne = asyncHandler(
  async (req: Request, res: Response) => {
    const itinerary = await getItineraryById(
      req.params.id as string,
      req.user!._id.toString()
    );
    res.json({ success: true, itinerary });
  }
);

// toggle share 

export const share = asyncHandler(
  async (req: Request, res: Response) => {
    const itinerary = await toggleShare(
      req.params.id as string,
      req.user!._id.toString()
    );

    // build the public share url for the frontend
    const shareUrl = itinerary.isShared
      ? `${env.CLIENT_URL}/share/${itinerary.shareToken}`
      : null;

    res.json({
      success:  true,
      isShared: itinerary.isShared,
      shareUrl,
    });
  }
);

// get shared itinerary by token, public — no auth

export const getShared = asyncHandler(
  async (req: Request, res: Response) => {
    const itinerary = await getSharedItinerary(req.params.token as string);
    res.json({ success: true, itinerary });
  }
);

//  delete itinerary 

export const remove = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteItinerary(
      req.params.id as string,
      req.user!._id.toString()
    );
    res.json({ success: true, message: 'Itinerary deleted' });
  }
);