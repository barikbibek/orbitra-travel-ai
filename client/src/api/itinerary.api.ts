import api from './axios';
import { Itinerary } from '../types';

export const uploadDocumentsApi = (formData: FormData) =>
  api.post<{ itinerary: Itinerary }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getHistoryApi = () =>
  api.get<{ itineraries: Itinerary[] }>('/itineraries');

export const getItineraryApi = (id: string) =>
  api.get<{ itinerary: Itinerary }>(`/itineraries/${id}`);

export const toggleShareApi = (id: string) =>
  api.patch<{ isShared: boolean; shareUrl: string | null }>(
    `/itineraries/${id}/share`
  );

export const getSharedApi = (token: string) =>
  api.get<{ itinerary: Itinerary }>(`/itineraries/shared/${token}`);

export const deleteItineraryApi = (id: string) =>
  api.delete(`/itineraries/${id}`);