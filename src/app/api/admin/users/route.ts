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

async function ensureAdmin(request: Request) {
  const userId = getUserId(request);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'SUPERADMIN') return null;
  return user;
}

export async function GET(request: Request) {
  const admin = await ensureAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function PUT(request: Request) {
  const admin = await ensureAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const userId = body.userId;
  const role = body.role?.toString().toUpperCase();

  if (!userId || !role || !['BUYER', 'SELLER', 'SUPERADMIN'].includes(role)) {
    return NextResponse.json({ message: 'Invalid user update payload' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}
