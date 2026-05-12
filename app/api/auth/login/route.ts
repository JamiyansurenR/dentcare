import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    const [rows] = await pool.query<any[]>(
      'SELECT user_id, username, password, role FROM users WHERE username = ?',
      [username]
    );
    const user = rows[0];
    
    if (!user) {
      return NextResponse.json({ error: 'Нэвтрэх нэр эсвэл нууц үг буруу' }, { status: 401 });
    }
    
    // bcrypt-г түр хасаад энгийн харьцуулалт хийх
    if (password !== user.password) {
      return NextResponse.json({ error: 'Нэвтрэх нэр эсвэл нууц үг буруу' }, { status: 401 });
    }
    
    const res = NextResponse.json({ success: true, role: user.role });
    const session = await getIronSession(req, res, sessionOptions);
    (session as any).user = { id: user.user_id, username: user.username, role: user.role };
    await session.save();
    
    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}