import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    // Нэвтрэх нэр эсвэл утасны дугаараар хайх
    const [rows] = await pool.query<any[]>(
      `SELECT u.user_id, u.username, u.password, u.role,
              p.phone, p.email
       FROM users u
       JOIN profiles p ON u.user_id = p.user_id
       WHERE u.username = ? OR p.phone = ?`,
      [username, username]
    );
    const user = rows[0];
    
    if (!user) {
      return NextResponse.json({ error: 'Нэвтрэх нэр, утас эсвэл нууц үг буруу' }, { status: 401 });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Нэвтрэх нэр, утас эсвэл нууц үг буруу' }, { status: 401 });
    }
    
    const res = NextResponse.json({ 
      success: true, 
      role: user.role,
      redirect: user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/doctor/dashboard' : '/doctors'
    });
    
    const session = await getIronSession(req, res, sessionOptions);
    (session as any).user = { id: user.user_id, username: user.username, role: user.role };
    await session.save();
    
    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}