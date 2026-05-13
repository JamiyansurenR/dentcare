import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Нууц үг хамгийн багадаа 6 тэмдэгт' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, userId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}