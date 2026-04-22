import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'patient') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const [rows] = await pool.query<any[]>(
      `SELECT u.user_id, u.username,
              p.first_name, p.last_name, p.email, p.phone, p.address, p.avatar_url,
              pa.birth_date, pa.gender, pa.insurance_no
       FROM users u
       JOIN profiles p ON u.user_id = p.user_id
       LEFT JOIN patients pa ON p.profile_id = pa.profile_id
       WHERE u.user_id = ?`,
      [user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Өвчтөн олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Get patient profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'patient') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { firstName, lastName, email, phone, address, birthDate, gender, insuranceNo } = await req.json();

    await pool.query(
      `UPDATE profiles 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?
       WHERE user_id = ?`,
      [firstName, lastName, email, phone, address, user.id]
    );

    await pool.query(
      `UPDATE patients pa
       JOIN profiles p ON pa.profile_id = p.profile_id
       SET pa.birth_date = ?, pa.gender = ?, pa.insurance_no = ?
       WHERE p.user_id = ?`,
      [birthDate, gender, insuranceNo, user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update patient profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}