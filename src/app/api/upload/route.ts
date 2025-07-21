import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET!;
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;

    const timestamp = Math.floor(Date.now() / 1000);
    const crypto = await import('crypto');
    const signature = crypto
      .createHash('sha1')
      .update(`timestamp=${timestamp}&upload_preset=${uploadPreset}${apiSecret}`)
      .digest('hex');

    const uploadData = new FormData();
    uploadData.append('file', new Blob([buffer]));
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', timestamp.toString());
    uploadData.append('upload_preset', uploadPreset);
    uploadData.append('signature', signature);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const uploadRes = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: uploadData,
    });

    const cloudinaryResult = await uploadRes.json();

    if (!uploadRes.ok) {
      return NextResponse.json({ error: cloudinaryResult.error?.message || 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ secure_url: cloudinaryResult.secure_url });
  } catch (err) {
    console.error('[UPLOAD_ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

