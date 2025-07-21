import { v2 as cloudinary } from 'cloudinary';
import { NextRequest } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return Response.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const upload = await new Promise<{ url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'billboards' }, function (error, result) {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url });
      })
      .end(buffer);
  });

  return Response.json(upload);
}

