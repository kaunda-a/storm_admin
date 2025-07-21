// src/lib/upload.ts

export async function uploadImageToCloudinary(buffer: Buffer): Promise<string> {
  const { v2: cloudinary } = await import('cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error('No secure_url returned'));
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

