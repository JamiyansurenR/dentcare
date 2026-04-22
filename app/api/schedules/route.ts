import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get('doctorId');
  const date = searchParams.get('date');

  if (!doctorId || !date) {
    return NextResponse.json({ error: 'doctorId and date are required' }, { status: 400 });
  }

  try {
    const [rows] = await pool.query<any[]>(
      `SELECT schedule_id, start_time, end_time, status
       FROM schedules
       WHERE doctor_id = ? AND date = ? AND status = 'available'
       ORDER BY start_time`,
      [doctorId, date]
    );
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Schedules API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}