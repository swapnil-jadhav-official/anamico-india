import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { stat, mkdir } from 'fs/promises';

async function fileExists(path: string) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = join(process.cwd(), 'public', 'uploads');

  if (!await fileExists(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const filePath = join(uploadsDir, file.name);
  await writeFile(filePath, buffer);

  const fileUrl = `/uploads/${file.name}`;

  return NextResponse.json({ success: true, url: fileUrl });
}
