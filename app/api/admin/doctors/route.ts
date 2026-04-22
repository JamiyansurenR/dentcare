import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const [rows] = await pool.query<any[]>(
      `SELECT d.doctor_id, d.specialization, d.experience, d.description, d.rating, d.active,
              p.first_name, p.last_name, p.email, p.phone
       FROM doctors d
       JOIN profiles p ON d.profile_id = p.profile_id
       ORDER BY d.doctor_id`
    );
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET doctors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { firstName, lastName, specialization, email, phone, experience, description, active } = await req.json();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const username = email.split('@')[0] + Math.floor(Math.random() * 10000);
      const hashedPassword = await bcrypt.hash('doctor123', 10);
      
      const [userResult] = await connection.query<any>(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, 'doctor']
      );
      const userId = userResult.insertId;
      
      const [profileResult] = await connection.query<any>(
        'INSERT INTO profiles (user_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)',
        [userId, firstName, lastName, email, phone || '']
      );
      const profileId = profileResult.insertId;
      
      await connection.query(
        'INSERT INTO doctors (profile_id, specialization, experience, description, active) VALUES (?, ?, ?, ?, ?)',
        [profileId, specialization, experience || 0, description || '', active !== false]
      );
      
      await connection.commit();
      return NextResponse.json({ success: true });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('POST doctor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { doctorId, firstName, lastName, specialization, email, phone, experience, description, active } = await req.json();

    await pool.query(
      `UPDATE profiles p
       JOIN doctors d ON p.profile_id = d.profile_id
       SET p.first_name = ?, p.last_name = ?, p.email = ?, p.phone = ?,
           d.specialization = ?, d.experience = ?, d.description = ?, d.active = ?
       WHERE d.doctor_id = ?`,
      [firstName, lastName, email, phone, specialization, experience, description, active, doctorId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PUT doctor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId шаардлагатай' }, { status: 400 });
    }

    await pool.query('DELETE FROM doctors WHERE doctor_id = ?', [doctorId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE doctor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}