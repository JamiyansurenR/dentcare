import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query<any[]>(`
      SELECT d.doctor_id, d.specialization, d.experience, d.description, d.rating, d.active,
             p.first_name, p.last_name, p.email, p.phone
      FROM doctors d
      JOIN profiles p ON d.profile_id = p.profile_id
      WHERE d.active = true
      ORDER BY d.doctor_id
    `);
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Doctors API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}