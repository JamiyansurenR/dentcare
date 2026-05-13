import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'patient') {
      return NextResponse.json({ error: 'Зөвхөн өвчтөн захиалга хийх боломжтой' }, { status: 401 });
    }

    const { doctorId, serviceId, scheduleId, date, time } = await req.json();

    // Өвчтөний patient_id авах
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

    //  НЭГ ӨВЧТӨН НЭГ ЦАГТ ЗӨВХӨН НЭГ ЗАХИАЛГА ХИЙХ БОЛОМЖТОЙ
    const [existingAppointments] = await pool.query<any[]>(
      `SELECT COUNT(*) as count 
       FROM appointments 
       WHERE patient_id = ? AND date = ? AND time = ? AND status != 'cancelled'`,
      [patientId, date, time]
    );

    if (existingAppointments[0].count > 0) {
      return NextResponse.json({ 
        error: 'Та энэ цагт өөр захиалгатай байна. Нэг цагт зөвхөн нэг захиалга хийх боломжтой.' 
      }, { status: 400 });
    }

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