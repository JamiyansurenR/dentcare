import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    // Эмчийн мэдээлэл авах
    const [doctorRows] = await pool.query<any[]>(
      `SELECT p.first_name, p.last_name 
       FROM doctors d 
       JOIN profiles p ON d.profile_id = p.profile_id 
       WHERE p.user_id = ?`,
      [user.id]
    );
    const doctorName = doctorRows.length > 0 
      ? `Dr. ${doctorRows[0].first_name} ${doctorRows[0].last_name}` 
      : user.username;

    // Захиалгуудыг авах
    const [appointments] = await pool.query<any[]>(
      `SELECT a.appointment_id, a.date, a.time, a.status,
              s.name as service_name, s.price,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name,
              pr.email as patient_email, pr.phone as patient_phone
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       JOIN patients pa ON a.patient_id = pa.patient_id
       JOIN profiles pr ON pa.profile_id = pr.profile_id
       JOIN profiles pat ON pr.profile_id = pat.profile_id
       WHERE a.doctor_id = (SELECT doctor_id FROM doctors WHERE profile_id = (SELECT profile_id FROM profiles WHERE user_id = ?))
       ORDER BY a.date DESC, a.time DESC`,
      [user.id]
    );

    return NextResponse.json({ doctorName, appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { appointmentId, status } = await req.json();

    await pool.query(
      'UPDATE appointments SET status = ? WHERE appointment_id = ?',
      [status, appointmentId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}