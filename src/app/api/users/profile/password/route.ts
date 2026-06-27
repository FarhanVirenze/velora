import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
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

export async function PUT(request: Request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return NextResponse.json({ message: 'Invalid password' }, { status: 409 });

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });

  return NextResponse.json({ success: true });
}
