import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    // Эмчийн doctor_id авах
    const [doctorRows] = await pool.query<any[]>(
      `SELECT d.doctor_id 
       FROM doctors d 
       JOIN profiles p ON d.profile_id = p.profile_id 
       WHERE p.user_id = ?`,
      [user.id]
    );

    if (doctorRows.length === 0) {
      return NextResponse.json({ error: 'Эмч олдсонгүй' }, { status: 404 });
    }

    const doctorId = doctorRows[0].doctor_id;

    // 1. Нийт захиалгын тоо
    const [totalRows] = await pool.query<any[]>(
      `SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?`,
      [doctorId]
    );
    const totalAppointments = totalRows[0]?.count || 0;

    // 2. Төлөвөөр захиалгын тоо
    const [statusRows] = await pool.query<any[]>(
      `SELECT status, COUNT(*) as count 
       FROM appointments 
       WHERE doctor_id = ? 
       GROUP BY status`,
      [doctorId]
    );
    const statusCounts: Record<string, number> = {};
    statusRows.forEach((row: any) => {
      statusCounts[row.status] = row.count;
    });

    // 3. Сарын захиалгын тоо (сүүлийн 6 сар)
    const [monthlyRows] = await pool.query<any[]>(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month, COUNT(*) as count
       FROM appointments
       WHERE doctor_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(date, '%Y-%m')
       ORDER BY month DESC`,
      [doctorId]
    );

    // 4. Хамгийн их захиалгатай өдөр
    const [busyDayRows] = await pool.query<any[]>(
      `SELECT date, COUNT(*) as count
       FROM appointments
       WHERE doctor_id = ?
       GROUP BY date
       ORDER BY count DESC
       LIMIT 1`,
      [doctorId]
    );
    const busyDay = busyDayRows[0] || null;

    // 5. Хамгийн их захиалгатай цаг
    const [busyHourRows] = await pool.query<any[]>(
      `SELECT HOUR(time) as hour, COUNT(*) as count
       FROM appointments
       WHERE doctor_id = ?
       GROUP BY HOUR(time)
       ORDER BY count DESC
       LIMIT 1`,
      [doctorId]
    );
    const busyHour = busyHourRows[0] || null;

    // 6. Үйлчилгээний тоо
    const [serviceRows] = await pool.query<any[]>(
      `SELECT s.name, COUNT(*) as count
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       WHERE a.doctor_id = ?
       GROUP BY s.service_id
       ORDER BY count DESC
       LIMIT 5`,
      [doctorId]
    );

    return NextResponse.json({
      totalAppointments,
      pending: statusCounts.pending || 0,
      confirmed: statusCounts.confirmed || 0,
      cancelled: statusCounts.cancelled || 0,
      completed: statusCounts.completed || 0,
      monthlyStats: monthlyRows,
      busyDay,
      busyHour,
      topServices: serviceRows,
    });
  } catch (error: any) {
    console.error('Doctor statistics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}