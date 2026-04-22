import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const [rows] = await pool.query<any[]>(
      `SELECT u.user_id, u.username,
              p.first_name, p.last_name, p.email, p.phone, p.address, p.avatar_url,
              d.specialization, d.experience, d.description, d.rating
       FROM users u
       JOIN profiles p ON u.user_id = p.user_id
       JOIN doctors d ON p.profile_id = d.profile_id
       WHERE u.user_id = ?`,
      [user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Эмч олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Get doctor profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { firstName, lastName, email, phone, address, specialization, experience, description } = await req.json();

    await pool.query(
      `UPDATE profiles 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?
       WHERE user_id = ?`,
      [firstName, lastName, email, phone, address, user.id]
    );

    await pool.query(
      `UPDATE doctors d
       JOIN profiles p ON d.profile_id = p.profile_id
       SET d.specialization = ?, d.experience = ?, d.description = ?
       WHERE p.user_id = ?`,
      [specialization, experience, description, user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update doctor profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}