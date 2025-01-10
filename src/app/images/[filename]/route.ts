import { supabaseClient } from '@/utils/supabase';
import { NextRequest, NextResponse } from 'next/server';

const extToContentType = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  ico: 'image/x-icon',
};

export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) => {
  const { filename } = await params;
  const ext = filename.split('.').pop();
  const { data: imageData, error: imageError } = await supabaseClient.storage
    .from('images')
    .download(`user_uploaded/${filename}`, {
      transform: { width: 500 },
    });

  if (imageError) {
    return new NextResponse('Not found', { status: 404 });
  }

  return new NextResponse(imageData, {
    headers: {
      // 3 days
      'Cache-Control': 'public, max-age=259200, immutable',
      'Content-Type': extToContentType[ext as keyof typeof extToContentType] || 'image/jpeg',
    },
  });
};
