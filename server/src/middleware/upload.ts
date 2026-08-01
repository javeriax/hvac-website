import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary, cloudinaryConfigured } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

const storage = cloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: async (req) => ({
        folder: `serviceflow/${(req.query.folder as string) ?? 'uploads'}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
        transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
      }),
    })
  : multer.memoryStorage();

export const upload = multer({
  storage: storage as multer.StorageEngine,
  limits: { fileSize: MAX_FILE_SIZE, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(ApiError.badRequest('Only image files can be uploaded'));
    }
    return cb(null, true);
  },
});

export interface UploadedImage {
  url: string;
  publicId?: string;
}

/** Normalises multer/Cloudinary output into the shape our models store. */
export function filesToImages(files?: Express.Multer.File[]): UploadedImage[] {
  if (!files?.length) return [];
  return files.map((f) => {
    const cf = f as Express.Multer.File & { path?: string; filename?: string };
    return { url: cf.path ?? '', publicId: cf.filename };
  }).filter((img) => Boolean(img.url));
}
