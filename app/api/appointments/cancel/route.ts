import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    const { appointmentId, scheduleId } = await req.json();

    if (!appointmentId || !scheduleId) {
      return NextResponse.json({ error: 'appointmentId болон scheduleId шаардлагатай' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Захиалгын төлөвийг цуцлагдсан болгох
      await connection.query(
        'UPDATE appointments SET status = "cancelled" WHERE appointment_id = ? AND status = "pending"',
        [appointmentId]
      );

      // Холбогдох цагийг дахин боломжтой болгох
      await connection.query(
        'UPDATE schedules SET status = "available" WHERE schedule_id = ?',
        [scheduleId]
      );

      await connection.commit();
      
      return NextResponse.json({ success: true, message: 'Захиалга амжилттай цуцлагдлаа' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Cancel appointment error:', error);
    return NextResponse.json({ error: error.message || 'Серверийн алдаа' }, { status: 500 });
  }
}