import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        ...body,
        password: hashedPassword,
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to register' }, { status: 500 });
  }
}
