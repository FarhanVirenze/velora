import { NextRequest, NextResponse } from 'next/server';
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { quantity } = await request.json();
  const cart = await prisma.cart.findUnique({ where: { userId } });
  
  if (!cart) return NextResponse.json({ message: 'Cart not found' }, { status: 404 });

  await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const cart = await prisma.cart.findUnique({ where: { userId } });
  
  if (!cart) return NextResponse.json({ message: 'Cart not found' }, { status: 404 });

  await prisma.cartItem.delete({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  return NextResponse.json({ success: true });
}
