import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from './app/lib/auth';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession(req, res, sessionOptions);
  const user = (session as any).user;
  const path = req.nextUrl.pathname;

  console.log('Middleware - Path:', path);
  console.log('Middleware - User:', user);

  // Админ хэсэг
  if (path.startsWith('/admin')) {
    if (!user || user.role !== 'admin') {
      if (path !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }
  }

  // Эмчийн хэсэг
  if (path.startsWith('/doctor')) {
    // Нэвтрээгүй бол login руу
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // Нэвтэрсэн боловч эмч биш бол
    if (user.role !== 'doctor') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Өвчтөний хэсэг
  if (path.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Захиалгын хуудас
  if (path.startsWith('/booking')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*', '/dashboard/:path*', '/booking/:path*'],
};