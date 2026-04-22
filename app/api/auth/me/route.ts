import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  const res = NextResponse.json({});
  const session = await getIronSession(req, res, sessionOptions);
  
  if (session.user) {
    return NextResponse.json({ user: session.user });
  }
  
  return NextResponse.json({ user: null });
}