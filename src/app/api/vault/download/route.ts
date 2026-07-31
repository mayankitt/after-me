import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getPresignedDownloadUrl } from '@/lib/storage/storageService';
import type { NextAuthRequest } from 'next-auth';

export const GET = auth(async (req: NextAuthRequest) => {
  const session = req.auth;
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  // Ensure the key belongs to the authenticated user
  if (!key.startsWith(`${userId}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = await getPresignedDownloadUrl(key);
  return NextResponse.json({ url });
});
