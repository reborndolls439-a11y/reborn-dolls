import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@reborn/db";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber, parseDecimal } from "@/lib/utils";
import {
  sendNewOrderEmailToAdmin,
  sendOrderConfirmationToCustomer,
} from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          items: true,
          shippingAddress: true,
        },
      }),
      prisma.order.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      orders: orders.map(serializeOrder),
      meta: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const {
      items, shippingAddress, guestEmail, guestName, guestPhone,
      subtotal, shippingCost = 0, tax = 0, total,
      couponCode, discountAmount, notes,
    } = body;

    if (!items?.length || !shippingAddress) {
      return NextResponse.json({ error: "Order items and shipping address are required." }, { status: 400 });
    }

    const customerEmail = user?.email || guestEmail;
    const customerName = user?.name || guestName || "Customer";

    if (!customerEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();

    // Verify stock for all items
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stockQuantity: true, name: true },
    });

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json({
          error: `"${product.name}" only has ${product.stockQuantity} in stock.`,
        }, { status: 400 });
      }
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id ?? null,
          guestEmail: user ? null : customerEmail,
          guestName: user ? null : customerName,
          guestPhone: user ? null : guestPhone,
          subtotal,
          shippingCost,
          tax,
          total,
          couponCode,
          discountAmount,
          notes,
          status: "PENDING",
          items: {
            create: items.map((item: {
              productId: string; productName: string;
              productImage?: string; price: number; quantity: number; subtotal: number;
            }) => ({
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.subtotal,
            })),
          },
          shippingAddress: {
            create: {
              firstName: shippingAddress.firstName,
              lastName: shippingAddress.lastName,
              line1: shippingAddress.line1,
              line2: shippingAddress.line2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
              phone: shippingAddress.phone,
            },
          },
        },
        include: { items: true, shippingAddress: true },
      });

      // Decrement stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `Order ${orderNumber}`,
            newQuantity: (products.find((p) => p.id === item.productId)!.stockQuantity) - item.quantity,
          },
        });
      }

      // Admin notification
      await tx.adminNotification.create({
        data: {
          type: "NEW_ORDER",
          title: "New Order Received",
          message: `Order #${orderNumber} from ${customerName} — $${total.toFixed(2)}`,
          link: `/admin/orders/${newOrder.id}`,
        },
      });

      return newOrder;
    });

    // Send emails (non-blocking)
    const emailItems = order.items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      price: parseDecimal(i.price),
    }));

    sendNewOrderEmailToAdmin({
      orderNumber,
      customerName,
      customerEmail,
      total,
      itemCount: items.length,
      items: emailItems,
      shippingAddress,
    }).catch(console.error);

    sendOrderConfirmationToCustomer({
      orderNumber,
      customerName,
      customerEmail,
      total,
      items: emailItems,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      order: serializeOrder(order),
    }, { status: 201 });
  } catch (error) {
    console.error("[ORDER_CREATE]", error);
    return NextResponse.json({ error: "Failed to place order." }, { status: 500 });
  }
}

function serializeOrder(order: Record<string, unknown>) {
  return {
    ...order,
    subtotal: parseDecimal(order.subtotal),
    shippingCost: parseDecimal(order.shippingCost),
    tax: parseDecimal(order.tax),
    total: parseDecimal(order.total),
    items: Array.isArray(order.items)
      ? order.items.map((item: Record<string, unknown>) => ({
          ...item,
          price: parseDecimal(item.price),
          subtotal: parseDecimal(item.subtotal),
        }))
      : [],
  };
}
