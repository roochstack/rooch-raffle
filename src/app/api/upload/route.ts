import { uuid } from '@/utils/kit';
import { supabaseClient } from '@/utils/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const filename = `${uuid()}.${ext}`;

  const { error } = await supabaseClient.storage
    .from('images')
    .upload(`user_uploaded/${filename}`, file);

  if (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }

  return NextResponse.json({ path: `/images/${filename}` });
};
