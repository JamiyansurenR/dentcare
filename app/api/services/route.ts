import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query<any[]>(`
      SELECT service_id, name, price, duration, description
      FROM services
      ORDER BY service_id
    `);
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Services API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}