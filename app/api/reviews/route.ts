import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'patient') {
      return NextResponse.json({ error: 'Зөвхөн өвчтөн үнэлгээ өгөх боломжтой' }, { status: 401 });
    }

    const { appointmentId, rating, comment } = await req.json();

    // Өвчтөний patient_id авах
    const [patientRows] = await pool.query<any[]>(
      `SELECT patient_id FROM patients WHERE profile_id = (SELECT profile_id FROM profiles WHERE user_id = ?)`,
      [user.id]
    );
    const patientId = patientRows[0]?.patient_id;

    if (!patientId) {
      return NextResponse.json({ error: 'Өвчтөн олдсонгүй' }, { status: 404 });
    }

    // Захиалга тухайн өвчтөнийх эсэх, төлөв нь 'completed' эсэхийг шалгах
    const [aptRows] = await pool.query<any[]>(
      `SELECT doctor_id FROM appointments WHERE appointment_id = ? AND patient_id = ? AND status = 'completed'`,
      [appointmentId, patientId]
    );

    if (aptRows.length === 0) {
      return NextResponse.json({ error: 'Үнэлгээ өгөх боломжгүй захиалга' }, { status: 400 });
    }

    const doctorId = aptRows[0].doctor_id;

    await pool.query(
      `INSERT INTO doctor_reviews (appointment_id, patient_id, doctor_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [appointmentId, patientId, doctorId, rating, comment || '']
    );

    // doctors хүснэгтийн дундаж rating-г шинэчлэх
    await pool.query(
      `UPDATE doctors d
       SET d.rating = (SELECT AVG(rating) FROM doctor_reviews WHERE doctor_id = d.doctor_id)
       WHERE d.doctor_id = ?`,
      [doctorId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Review error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}