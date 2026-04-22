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

    // Захиалгын тоо
    const [appointments] = await pool.query<any[]>('SELECT COUNT(*) as count FROM appointments');
    
    // Эмчийн тоо
    const [doctors] = await pool.query<any[]>('SELECT COUNT(*) as count FROM doctors');
    
    // Үйлчилгээний тоо
    const [services] = await pool.query<any[]>('SELECT COUNT(*) as count FROM services');
const [patients] = await pool.query<any[]>('SELECT COUNT(*) as count FROM users WHERE role = "patient"'); 
    return NextResponse.json({
      appointments: appointments[0]?.count || 0,
      doctors: doctors[0]?.count || 0,
      services: services[0]?.count || 0,
        patients: patients[0]?.count || 0,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
const [patients] = await pool.query<any[]>('SELECT COUNT(*) as count FROM users WHERE role = "patient"');
