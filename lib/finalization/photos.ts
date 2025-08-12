import { Photo } from './types';

export const addPhoto = (photos: Photo[], photo: Photo): Photo[] => {
  return [...photos, photo];
};

export const removePhoto = (photos: Photo[], id: string): Photo[] => {
  return photos.filter(p => p.id !== id);
};
