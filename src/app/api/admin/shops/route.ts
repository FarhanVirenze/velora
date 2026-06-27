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

  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  return NextResponse.json(shops);
}

export async function PUT(request: Request) {
  const admin = await ensureAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const shopId = body.shopId;
  const status = body.status?.toString().toUpperCase();

  if (!shopId || !status || !['PENDING', 'ACTIVE', 'REJECTED'].includes(status)) {
    return NextResponse.json({ message: 'Invalid shop update payload' }, { status: 400 });
  }

  const shop = await prisma.shop.update({
    where: { id: shopId },
    data: { status },
  });

  return NextResponse.json(shop);
}
