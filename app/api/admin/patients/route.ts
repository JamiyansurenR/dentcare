import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const [patients] = await pool.query<any[]>(`
      SELECT u.user_id, u.username, u.role, u.created_at,
             p.first_name, p.last_name, p.email, p.phone, p.address,
             pa.birth_date, pa.gender, pa.insurance_no, pa.medical_history
      FROM users u
      JOIN profiles p ON u.user_id = p.user_id
      LEFT JOIN patients pa ON p.profile_id = pa.profile_id
      WHERE u.role = 'patient'
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json(patients);
  } catch (error: any) {
    console.error('Admin patients error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}