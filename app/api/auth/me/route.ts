import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  const res = NextResponse.json({});
  const session = await getIronSession(req, res, sessionOptions);
  
  // Type assertion ашиглах
  const user = (session as any).user;
  
  if (user) {
    return NextResponse.json({ user: user });
  }
  
  return NextResponse.json({ user: null });
}