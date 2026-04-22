import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Зураг олдсонгүй' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Зургийг хэмжээг нь тохируулах
    const optimizedBuffer = await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Хадгалах зам
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });
    
    const filename = `avatar-${userId}-${Date.now()}.jpg`;
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, optimizedBuffer);

    const imageUrl = `/uploads/${filename}`;

    // Өгөгдлийн санд зурагны URL хадгалах
    const pool = (await import('@/app/lib/db')).default;
    await pool.query(
      'UPDATE profiles SET avatar_url = ? WHERE user_id = ?',
      [imageUrl, userId]
    );

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}