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

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    let query = `
      SELECT s.schedule_id, s.date, s.start_time, s.end_time, s.status
      FROM schedules s
      WHERE s.doctor_id = (SELECT doctor_id FROM doctors WHERE profile_id = (SELECT profile_id FROM profiles WHERE user_id = ?))
    `;
    const params: any[] = [user.id];

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

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { date, startTime, endTime } = await req.json();

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Бүх талбарыг бөглөнө үү' }, { status: 400 });
    }

    const [doctorRows] = await pool.query<any[]>(
      `SELECT doctor_id FROM doctors WHERE profile_id = (SELECT profile_id FROM profiles WHERE user_id = ?)`,
      [user.id]
    );

    if (doctorRows.length === 0) {
      return NextResponse.json({ error: 'Эмч олдсонгүй' }, { status: 404 });
    }

    await pool.query(
      `INSERT INTO schedules (doctor_id, date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, 'available')`,
      [doctorRows[0].doctor_id, date, startTime, endTime]
    );

    return NextResponse.json({ success: true, message: 'Хуваарь нэмэгдлээ' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getIronSession(req, {} as any, sessionOptions);
    const user = (session as any).user;
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get('scheduleId');

    if (!scheduleId) {
      return NextResponse.json({ error: 'scheduleId шаардлагатай' }, { status: 400 });
    }

    await pool.query('DELETE FROM schedules WHERE schedule_id = ?', [scheduleId]);

    return NextResponse.json({ success: true, message: 'Хуваарь устгагдлаа' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}