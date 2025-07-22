import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/upload';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Limit to 10 files max
    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 files allowed' }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      if (!file || file.size === 0) {
        throw new Error(`Invalid file: ${file?.name || 'unknown'}`);
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File too large: ${file.name} (max 5MB)`);
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`Invalid file type: ${file.name} (images only)`);
      }

      const { url } = await uploadImageToCloudinary(file);
      return {
        url,
        originalName: file.name,
        size: file.size,
        type: file.type,
      };
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({ 
      success: true,
      images: results,
      count: results.length 
    }, { status: 200 });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Bulk upload failed' 
    }, { status: 500 });
  }
}
