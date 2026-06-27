import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    // Verify stock
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ message: `Product ${item.productId} not found` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ message: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
    }

    // Deduct stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          sold: { increment: item.quantity },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
