import { v2 as cloudinary } from 'cloudinary';
import { env, cloudinaryConfigured } from './env';

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

/** Uploads a base64 data URL (used for signature capture) and returns the secure URL. */
export async function uploadDataUrl(dataUrl: string, folder: string): Promise<string> {
  if (!cloudinaryConfigured) return dataUrl;
  const res = await cloudinary.uploader.upload(dataUrl, {
    folder: `serviceflow/${folder}`,
    resource_type: 'image',
  });
  return res.secure_url;
}

export { cloudinary, cloudinaryConfigured };
