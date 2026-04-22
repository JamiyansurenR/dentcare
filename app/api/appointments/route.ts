import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    
    // Type assertion ашиглах
    const user = (session as any).user;
    
    if (!user) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    const { doctorId, serviceId, scheduleId, date, time } = await req.json();

    // Get patient_id from user_id
    const [patientRows] = await pool.query<any[]>(
      `SELECT p.patient_id 
       FROM patients p 
       JOIN profiles pr ON p.profile_id = pr.profile_id 
       WHERE pr.user_id = ?`,
      [user.id]
    );

    if (patientRows.length === 0) {
      return NextResponse.json({ error: 'Өвчтөний мэдээлэл олдсонгүй' }, { status: 404 });
    }

    const patientId = patientRows[0].patient_id;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [scheduleRows] = await connection.query<any[]>(
        'SELECT status FROM schedules WHERE schedule_id = ? FOR UPDATE',
        [scheduleId]
      );

      if (scheduleRows.length === 0 || scheduleRows[0].status !== 'available') {
        await connection.rollback();
        return NextResponse.json({ error: 'Энэ цаг аль хэдийн захиалагдсан байна' }, { status: 400 });
      }

      await connection.query(
        `INSERT INTO appointments (patient_id, doctor_id, schedule_id, service_id, date, time, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [patientId, doctorId, scheduleId, serviceId, date, time]
      );

      await connection.query(
        'UPDATE schedules SET status = "booked" WHERE schedule_id = ?',
        [scheduleId]
      );

      await connection.commit();
      
      return NextResponse.json({ success: true, message: 'Захиалга амжилттай' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: error.message || 'Серверийн алдаа' }, { status: 500 });
  }
}