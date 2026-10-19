import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Order, CartItem, OrderStatus } from '@/types';

// Helper to format DB row to Order object
function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    createdAt: row.created_at ? new Date(row.created_at).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) : 'Just now',
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
    subtotal: Number(row.subtotal),
    deliveryCharge: Number(row.delivery_charge),
    tax: Number(row.tax),
    total: Number(row.total),
    orderType: row.order_type,
    deliveryAddress: row.delivery_address || '',
    landmark: row.landmark || '',
    customerName: row.customer_name,
    guestName: row.customer_name,
    roomNumber: row.landmark || '',
    phone: row.phone,
    paymentMethod: row.payment_method,
    paymentSubOption: row.payment_sub_option,
    status: row.status,
    estimatedTime: row.estimated_time || (row.order_type === 'pickup' ? '15–20 mins' : '30–35 mins'),
    timeline: typeof row.timeline === 'string' ? JSON.parse(row.timeline) : row.timeline || [],
  };
}

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM orders 
      ORDER BY created_at DESC 
      LIMIT 50;
    `;
    const orders = rows.map(mapRowToOrder);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Failed to fetch orders from Neon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'DB error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const orderData: Order = await request.json();
    const sql = getDb();

    // 1. Check Restaurant Settings (Open/Closed & Ordering rules)
    const settingsRows = await sql`
      SELECT key, value FROM restaurant_settings;
    `;
    const settingsMap: Record<string, any> = {};
    for (const r of settingsRows) {
      settingsMap[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
    }

    const generalSettings = settingsMap.general || { isOpen: true };
    const orderingSettings = settingsMap.ordering || {
      standardDeliveryFee: 40,
      freeDeliveryThreshold: 500,
      minimumOrderAmount: 150,
      taxRatePercent: 5,
    };

    if (generalSettings.isOpen === false) {
      return NextResponse.json(
        {
          error: generalSettings.closureNotice || "We're currently closed. We'll be accepting orders again at 11:00 AM.",
        },
        { status: 400 }
      );
    }

    // 2. Server-side Menu Items Validation & Re-pricing
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty.' }, { status: 400 });
    }

    // Fetch active items from database
    const dbItems = await sql`
      SELECT id, name, price, available, image, category_id 
      FROM menu_items 
      WHERE deleted_at IS NULL;
    `;
    const dbItemMap = new Map(dbItems.map((item) => [item.id, item]));

    let calculatedSubtotal = 0;
    const validatedItems: CartItem[] = [];

    for (const clientItem of orderData.items) {
      const dbItem = dbItemMap.get(clientItem.foodItem?.id);
      if (!dbItem) {
        return NextResponse.json(
          { error: `Item "${clientItem.foodItem?.name || 'Dish'}" is no longer on the menu.` },
          { status: 400 }
        );
      }

      if (dbItem.available === false) {
        return NextResponse.json(
          { error: `"${dbItem.name}" is currently sold out.` },
          { status: 400 }
        );
      }

      const authoritativePrice = Number(dbItem.price);
      const qty = Math.max(Number(clientItem.quantity) || 1, 1);

      // Validate add-ons
      let addonsTotal = 0;
      const validatedAddons = (clientItem.selectedAddOns || []).map((addon) => {
        const addonPrice = Number(addon.price) || 0;
        addonsTotal += addonPrice;
        return {
          id: addon.id,
          name: addon.name,
          price: addonPrice,
        };
      });

      const lineTotal = (authoritativePrice + addonsTotal) * qty;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        cartItemId: clientItem.cartItemId,
        quantity: qty,
        selectedAddOns: validatedAddons,
        itemTotal: lineTotal,
        specialInstructions: clientItem.specialInstructions,
        foodItem: {
          ...clientItem.foodItem,
          price: authoritativePrice, // Use DB price!
          name: dbItem.name,
          image: dbItem.image,
        },
      });
    }

    // Minimum order check
    const minOrder = Number(orderingSettings.minimumOrderAmount) || 150;
    if (calculatedSubtotal < minOrder) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${minOrder}. Current subtotal: ₹${calculatedSubtotal}` },
        { status: 400 }
      );
    }

    // Calculate delivery charge
    const isPickup = orderData.orderType === 'pickup';
    const freeThreshold = Number(orderingSettings.freeDeliveryThreshold) || 500;
    const stdFee = Number(orderingSettings.standardDeliveryFee) || 40;
    const calculatedDeliveryCharge = isPickup || calculatedSubtotal >= freeThreshold ? 0 : stdFee;

    // Calculate tax
    const taxRate = Number(orderingSettings.taxRatePercent) || 5;
    const calculatedTax = Math.round((calculatedSubtotal * taxRate) / 100);

    // Final authoritative total
    const authoritativeTotal = calculatedSubtotal + calculatedDeliveryCharge + calculatedTax;

    const orderId = orderData.id || `#GV${Date.now().toString().slice(-6)}`;
    const itemsJson = JSON.stringify(validatedItems);
    const timelineJson = JSON.stringify(orderData.timeline || []);

    await sql`
      INSERT INTO orders (
        id,
        order_type,
        status,
        customer_name,
        phone,
        email,
        delivery_address,
        landmark,
        payment_method,
        payment_sub_option,
        subtotal,
        delivery_charge,
        tax,
        total,
        estimated_time,
        items,
        timeline
      ) VALUES (
        ${orderId},
        ${orderData.orderType || 'delivery'},
        ${orderData.status || 'confirmed'},
        ${orderData.customerName || orderData.guestName || 'Valued Customer'},
        ${orderData.phone || ''},
        ${orderData.phone || ''},
        ${orderData.deliveryAddress || ''},
        ${orderData.landmark || ''},
        ${orderData.paymentMethod || 'cash-on-delivery'},
        ${orderData.paymentSubOption || null},
        ${calculatedSubtotal},
        ${calculatedDeliveryCharge},
        ${calculatedTax},
        ${authoritativeTotal},
        ${orderData.estimatedTime || (isPickup ? '15–20 mins' : '30–35 mins')},
        ${itemsJson}::jsonb,
        ${timelineJson}::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        timeline = EXCLUDED.timeline,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return NextResponse.json({
      success: true,
      order: {
        ...orderData,
        id: orderId,
        subtotal: calculatedSubtotal,
        deliveryCharge: calculatedDeliveryCharge,
        tax: calculatedTax,
        total: authoritativeTotal,
        items: validatedItems,
      },
    });
  } catch (error) {
    console.error('Failed to create order in Neon:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'DB error' },
      { status: 500 }
    );
  }
}
