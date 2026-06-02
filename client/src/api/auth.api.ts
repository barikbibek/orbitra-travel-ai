import api from './axios';
import { User } from '../types';

export const registerApi = (data: {
  name: string; email: string; password: string
}) => api.post<{ user: User }>('/auth/register', data);

export const loginApi = (data: {
  email: string; password: string
}) => api.post<{ user: User }>('/auth/login', data);

export const logoutApi  = () => api.post('/auth/logout');
export const getMeApi   = () => api.get<{ user: User }>('/auth/me');
export const refreshApi = () => api.post('/auth/refresh');