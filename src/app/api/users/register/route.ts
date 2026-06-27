import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
        email: body.email,
        name: body.name,
        password: hashedPassword,
        role: body.role === 'SELLER' ? 'SELLER' : 'BUYER',
        avatar: body.avatar || null,
        phone: body.phone || null,
        address: body.address || null,
        gender: body.gender || null,
        dob: body.dob ? new Date(body.dob) : null,
        settings: body.settings || null,
      },
    });

    if (body.role === 'SELLER') {
      const storeName = body.storeName || `${user.name || 'Seller'} Shop`;
      const shopSlug = `${slugify(storeName)}-${user.id.slice(0, 6)}`;
      await prisma.shop.create({
        data: {
          ownerId: user.id,
          name: storeName,
          slug: shopSlug,
          description: body.storeDescription || null,
          category: body.storeCategory || 'General',
          status: 'PENDING',
        },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to register' }, { status: 500 });
  }
}
