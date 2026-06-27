import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-velora';

function getUserId(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.sub;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  
  const { password, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PUT(request: Request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const user = await prisma.user.update({
    where: { id: userId },
    data: body
  });
  
  const { password, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function DELETE(request: Request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
