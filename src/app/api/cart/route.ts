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

  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
  }

  const totalPrice = cart.items.reduce((total: number, item: { price: number; quantity: number; }) => total + (item.price * item.quantity), 0);
  return NextResponse.json({ ...cart, totalPrice });
}

export async function POST(request: Request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { productId, quantity, price } = await request.json();
  const itemPrice = price || Math.floor(Math.random() * 5000000) + 1000000;

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        price: itemPrice,
      },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return NextResponse.json({ success: true });
}
