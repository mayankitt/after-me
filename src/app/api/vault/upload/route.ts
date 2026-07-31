import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { uploadObject } from '@/lib/storage/storageService';
import type { NextAuthRequest } from 'next-auth';

export const POST = auth(async (req: NextAuthRequest) => {
  const session = req.auth;
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const category = formData.get('category') as string;
  const isRequired = formData.get('isRequired') === 'true';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const fileExt = file.name.split('.').pop();
  const key = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadObject(key, buffer, file.type || 'application/octet-stream');

  const metadata = {
    key,
    name: name || file.name,
    fileName: file.name,
    type: type || fileExt || 'Unknown',
    category: category || 'Other',
    contentType: file.type,
    uploadDate: new Date().toISOString(),
    isRequired,
    userId,
  };

  return NextResponse.json({ success: true, document: metadata }, { status: 201 });
});
