import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const [reviews] = await pool.query<any[]>(`
      SELECT r.review_id, r.rating, r.comment, r.created_at,
             d.doctor_id,
             CONCAT(p.first_name, ' ', p.last_name) as doctor_name,
             d.specialization,
             CONCAT(pat.first_name, ' ', pat.last_name) as patient_name
      FROM doctor_reviews r
      JOIN doctors d ON r.doctor_id = d.doctor_id
      JOIN profiles p ON d.profile_id = p.profile_id
      JOIN patients pa ON r.patient_id = pa.patient_id
      JOIN profiles pat ON pa.profile_id = pat.profile_id
      ORDER BY r.created_at DESC
    `);

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('Admin reviews error:', error);
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
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId шаардлагатай' }, { status: 400 });
    }

    await pool.query('DELETE FROM doctor_reviews WHERE review_id = ?', [reviewId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete review error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}