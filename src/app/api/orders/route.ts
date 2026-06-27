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

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { productIds } = await request.json().catch(() => ({ productIds: undefined }));

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
  }

  let itemsToOrder = cart.items;
  if (productIds && productIds.length > 0) {
    itemsToOrder = cart.items.filter((item: { productId: any; }) => productIds.includes(item.productId));
  }

  if (itemsToOrder.length === 0) {
    return NextResponse.json({ message: 'No items selected for checkout' }, { status: 400 });
  }

  const orderTotal = itemsToOrder.reduce((sum: number, item: { price: number; quantity: number; }) => sum + (item.price * item.quantity), 0);

  // Verify stock
  for (const item of itemsToOrder) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || product.stock < item.quantity) {
      return NextResponse.json({ message: `Insufficient stock for product ${product?.name || item.productId}` }, { status: 400 });
    }
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount: orderTotal,
      status: 'CONFIRMED',
      items: {
        create: itemsToOrder.map((item: { productId: any; quantity: any; price: any; }) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    },
    include: { items: true }
  });

  // Deduct stock and clear cart
  for (const item of itemsToOrder) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
        sold: { increment: item.quantity }
      }
    });

    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } }
    });
  }

  return NextResponse.json(order);
}
