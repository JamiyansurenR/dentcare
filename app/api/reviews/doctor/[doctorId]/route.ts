import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ doctorId: string }> }) {
  try {
    const { doctorId } = await params;
    
    const [reviews] = await pool.query<any[]>(
      `SELECT r.review_id, r.rating, r.comment, r.created_at,
              p.first_name, p.last_name
       FROM doctor_reviews r
       JOIN patients pa ON r.patient_id = pa.patient_id
       JOIN profiles p ON pa.profile_id = p.profile_id
       WHERE r.doctor_id = ?
       ORDER BY r.created_at DESC`,
      [doctorId]
    );

    const [avgResult] = await pool.query<any[]>(
      `SELECT AVG(rating) as average, COUNT(*) as total FROM doctor_reviews WHERE doctor_id = ?`,
      [doctorId]
    );

    return NextResponse.json({
      reviews,
      average: avgResult[0]?.average || 0,
      total: avgResult[0]?.total || 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}