import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [rows] = await pool.query<any[]>(
      `SELECT d.doctor_id, d.specialization, d.experience, d.description, d.rating, d.active,
              p.first_name, p.last_name, p.email, p.phone
       FROM doctors d
       JOIN profiles p ON d.profile_id = p.profile_id
       WHERE d.doctor_id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Эмч олдсонгүй' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Doctor detail API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
