import { nanoid } from 'nanoid';

export const generateShareToken = (): string => nanoid(21);