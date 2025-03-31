import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { envelopeAttributes } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { ClaimDialogConfig, SocialLink } from '@/interfaces';
import { useRouter } from '@/i18n/routing';

export interface EnvelopeAttributes {
  roochObjectId: string;
  socialLinks: SocialLink[];
  claimDialogConfig: ClaimDialogConfig;
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be a Neon postgres connection string');
}
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({
  client: sql,
  schema: { ...schema },
});

export const POST = async (request: NextRequest) => {
  try {
    const data = await request.json();

    const result = await db
      .insert(envelopeAttributes)
      .values({
        roochObjectId: data.roochObjectId,
        socialLinks: data.socialLinks,
        claimDialogConfig: data.claimDialogConfig,
      })
      .returning();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
};

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'missing id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await db
      .select()
      .from(envelopeAttributes)
      .where(eq(envelopeAttributes.roochObjectId, id));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const data = await request.json();

    const result = await db
      .insert(envelopeAttributes)
      .values({
        roochObjectId: data.roochObjectId,
        socialLinks: data.socialLinks,
        claimDialogConfig: data.claimDialogConfig,
      })
      .onConflictDoUpdate({
        target: envelopeAttributes.roochObjectId,
        set: {
          socialLinks: data.socialLinks,
          claimDialogConfig: data.claimDialogConfig,
        },
      });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
};
