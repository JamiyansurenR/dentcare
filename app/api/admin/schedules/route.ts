import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

// GET - Бүх хуваарийг авах
export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    let query = `
      SELECT s.schedule_id, s.doctor_id, s.date, s.start_time, s.end_time, s.status,
             p.first_name, p.last_name, d.specialization
      FROM schedules s
      JOIN doctors d ON s.doctor_id = d.doctor_id
      JOIN profiles p ON d.profile_id = p.profile_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (doctorId) {
      query += ' AND s.doctor_id = ?';
      params.push(doctorId);
    }
    if (date) {
      query += ' AND s.date = ?';
      params.push(date);
    }

    query += ' ORDER BY s.date, s.start_time';

    const [schedules] = await pool.query<any[]>(query, params);
    return NextResponse.json(schedules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Шинэ хуваарь нэмэх
export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { doctorId, date, startTime, endTime } = await req.json();

    if (!doctorId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Бүх талбарыг бөглөнө үү' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO schedules (doctor_id, date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, 'available')`,
      [doctorId, date, startTime, endTime]
    );

    return NextResponse.json({ success: true, message: 'Хуваарь амжилттай нэмэгдлээ' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Хуваарь устгах
export async function DELETE(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get('scheduleId');

    if (!scheduleId) {
      return NextResponse.json({ error: 'scheduleId шаардлагатай' }, { status: 400 });
    }

    await pool.query('DELETE FROM schedules WHERE schedule_id = ?', [scheduleId]);

    return NextResponse.json({ success: true, message: 'Хуваарь амжилттай устгагдлаа' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}