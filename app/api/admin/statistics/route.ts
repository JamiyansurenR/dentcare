import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    // 1. Эмч бүрийн үзлэгийн тоо (баталгаажсан захиалгаар)
    const [doctorStats] = await pool.query<any[]>(`
      SELECT 
        d.doctor_id,
        p.first_name,
        p.last_name,
        d.specialization,
        COUNT(a.appointment_id) as total_appointments,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM doctors d
      JOIN profiles p ON d.profile_id = p.profile_id
      LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
      GROUP BY d.doctor_id
      ORDER BY total_appointments DESC
    `);

    // 2. Хамгийн ачаалалтай өдөр, цаг
    const [busyDay] = await pool.query<any[]>(`
      SELECT 
        date,
        COUNT(*) as appointment_count
      FROM appointments
      WHERE status != 'cancelled'
      GROUP BY date
      ORDER BY appointment_count DESC
      LIMIT 1
    `);

    const [busyHour] = await pool.query<any[]>(`
      SELECT 
        HOUR(time) as hour,
        COUNT(*) as appointment_count
      FROM appointments
      WHERE status != 'cancelled'
      GROUP BY HOUR(time)
      ORDER BY appointment_count DESC
      LIMIT 1
    `);

    // 3. Сарын статистик (энэ сарын захиалга)
    const [monthlyStats] = await pool.query<any[]>(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(*) as count
      FROM appointments
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
    `);

    return NextResponse.json({
      doctorStats,
      busyDay: busyDay[0] || null,
      busyHour: busyHour[0] || null,
      monthlyStats,
    });
  } catch (error: any) {
    console.error('Statistics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
