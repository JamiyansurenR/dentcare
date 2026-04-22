import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    // Get patient_id from user_id
    const [patientRows] = await pool.query<any[]>(
      `SELECT p.patient_id 
       FROM patients p 
       JOIN profiles pr ON p.profile_id = pr.profile_id 
       WHERE pr.user_id = ?`,
      [user.id]
    );

    if (patientRows.length === 0) {
      return NextResponse.json([]);
    }

    const patientId = patientRows[0].patient_id;

    // Get user's appointments
    const [appointments] = await pool.query<any[]>(
      `SELECT a.appointment_id, a.date, a.time, a.status, a.created_at,
              d.doctor_id, d.specialization,
              p.first_name as doctor_first_name, p.last_name as doctor_last_name,
              s.service_id, s.name as service_name, s.price
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.doctor_id
       JOIN profiles p ON d.profile_id = p.profile_id
       JOIN services s ON a.service_id = s.service_id
       WHERE a.patient_id = ?
       ORDER BY a.date DESC, a.time DESC`,
      [patientId]
    );

    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}