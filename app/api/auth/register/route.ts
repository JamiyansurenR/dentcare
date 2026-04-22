import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName, phone } = await req.json();
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Имэйл бүртгэлтэй эсэх (төрлийг заасан)
    const [existing] = await connection.query<any[]>(
      'SELECT * FROM profiles WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'Энэ имэйл бүртгэлтэй байна' }, { status: 400 });
    }
    
    // Username үүсгэх
    const username = email.split('@')[0] + Math.floor(Math.random() * 10000);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // User үүсгэх (төрлийг заасан)
    const [userRes] = await connection.query<any>(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'patient']
    );
    const userId = userRes.insertId;
    
    // Profile үүсгэх (төрлийг заасан)
    const [profileRes] = await connection.query<any>(
      'INSERT INTO profiles (user_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)',
      [userId, firstName || '', lastName || '', email, phone || '']
    );
    const profileId = profileRes.insertId;
    
    // Patient үүсгэх
    await connection.query(
      'INSERT INTO patients (profile_id) VALUES (?)',
      [profileId]
    );
    
    await connection.commit();
    
    // Амжилттай бол username-г буцаах
    return NextResponse.json({ success: true, username: username });
    
  } catch (error: any) {
    await connection.rollback();
    console.error('Register error:', error);
    return NextResponse.json({ error: error.message || 'Бүртгэл амжилтгүй боллоо' }, { status: 500 });
  } finally {
    connection.release();
  }
}