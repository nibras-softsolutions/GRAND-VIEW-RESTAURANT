import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Order, CartItem, OrderStatus } from '@/types';
import { logOrderStatusTransition } from '@/lib/auth';

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
    island: row.island || 'Amini',
    houseName: row.house_name || '',
    locality: row.locality || '',
    landmark: row.landmark || '',
    deliveryInstructions: row.delivery_instructions || '',
    deliveryPersonId: row.delivery_person_id,
    deliveryStatus: row.delivery_status || 'unassigned',
    customerName: row.customer_name,
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
      const itemId = clientItem.foodItem?.id || (clientItem as any).id || (clientItem as any).foodId;
      const itemName = clientItem.foodItem?.name || (clientItem as any).name || 'Alfiya Kitchen Dish';

      // Match by exact ID or by normalized item name
      const dbItem =
        (itemId ? dbItemMap.get(itemId) : null) ||
        Array.from(dbItemMap.values()).find(
          (item) => item.name.toLowerCase().trim() === itemName.toLowerCase().trim()
        );

      let authoritativePrice = Number(clientItem.foodItem?.price || (clientItem as any).price) || 100;
      let finalName = itemName;
      let finalImage = clientItem.foodItem?.image || '';

      if (dbItem) {
        if (dbItem.available === false) {
          return NextResponse.json(
            { error: `"${dbItem.name}" is currently sold out.` },
            { status: 400 }
          );
        }
        authoritativePrice = Number(dbItem.price) || authoritativePrice;
        finalName = dbItem.name;
        finalImage = dbItem.image || finalImage;
      }

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
        cartItemId: clientItem.cartItemId || `ci_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        quantity: qty,
        selectedAddOns: validatedAddons,
        itemTotal: lineTotal,
        specialInstructions: clientItem.specialInstructions,
        foodItem: {
          ...clientItem.foodItem,
          id: itemId || dbItem?.id || 'dish-custom',
          price: authoritativePrice,
          name: finalName,
          image: finalImage,
        },
      });
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

    const orderId = orderData.id || `#AK${Date.now().toString().slice(-6)}`;
    const itemsJson = JSON.stringify(validatedItems);

    const initialStatus = 'confirmed';
    const initialTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const timeline = [
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Received and confirmed by Alfiya Kitchen.',
        time: initialTimeStr,
        completed: true,
        current: true,
      },
      {
        status: 'preparing',
        title: 'Preparing in Kitchen',
        description: 'Chefs are cooking your meal fresh.',
        completed: false,
      },
      {
        status: isPickup ? 'ready_for_pickup' : 'out_for_delivery',
        title: isPickup ? 'Ready for Pickup' : 'Out for Delivery',
        description: isPickup
          ? 'Ready at counter for customer pickup.'
          : 'Delivery partner on the way to your address.',
        completed: false,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Order completed. Bon Appétit!',
        completed: false,
      },
    ];

    const timelineJson = JSON.stringify(timeline);

    const combinedAddress = isPickup
      ? 'Front Counter Pickup at Alfiya Kitchen'
      : orderData.deliveryAddress || `${orderData.houseName || ''}, ${orderData.locality || ''}, ${orderData.island || 'Amini'}`;

    await sql`
      INSERT INTO orders (
        id,
        order_type,
        status,
        customer_name,
        phone,
        email,
        delivery_address,
        island,
        house_name,
        locality,
        landmark,
        delivery_instructions,
        delivery_status,
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
        ${initialStatus},
        ${orderData.customerName || 'Valued Customer'},
        ${orderData.phone || ''},
        ${orderData.phone || ''},
        ${combinedAddress},
        ${orderData.island || 'Amini'},
        ${orderData.houseName || ''},
        ${orderData.locality || ''},
        ${orderData.landmark || ''},
        ${orderData.deliveryInstructions || ''},
        'unassigned',
        ${orderData.paymentMethod || 'cash-on-delivery'},
        ${orderData.paymentSubOption || null},
        ${calculatedSubtotal},
        ${calculatedDeliveryCharge},
        ${calculatedTax},
        ${authoritativeTotal},
        ${isPickup ? '15–20 mins' : '30–35 mins'},
        ${itemsJson}::jsonb,
        ${timelineJson}::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        timeline = EXCLUDED.timeline,
        updated_at = CURRENT_TIMESTAMP;
    `;

    // Record initial status transition
    await logOrderStatusTransition(
      orderId,
      initialStatus,
      'customer',
      orderData.customerName || 'Customer',
      'Order placed via customer checkout'
    );

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
        timeline,
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
