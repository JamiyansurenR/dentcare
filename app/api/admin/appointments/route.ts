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

    const [appointments] = await pool.query<any[]>(
      `SELECT a.appointment_id, a.date, a.time, a.status, a.created_at,
              d.doctor_id,
              p.first_name as doctor_first_name, p.last_name as doctor_last_name,
              d.specialization,
              s.service_id, s.name as service_name, s.price,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name,
              pr.email as patient_email, pr.phone as patient_phone
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.doctor_id
       JOIN profiles p ON d.profile_id = p.profile_id
       JOIN services s ON a.service_id = s.service_id
       JOIN patients pa ON a.patient_id = pa.patient_id
       JOIN profiles pr ON pa.profile_id = pr.profile_id
       JOIN profiles pat ON pr.profile_id = pat.profile_id
       ORDER BY a.created_at DESC`
    );

    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error('Admin appointments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { appointmentId, status } = await req.json();

    if (!appointmentId || !status) {
      return NextResponse.json({ error: 'appointmentId болон status шаардлагатай' }, { status: 400 });
    }

    await pool.query(
      'UPDATE appointments SET status = ? WHERE appointment_id = ?',
      [status, appointmentId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}