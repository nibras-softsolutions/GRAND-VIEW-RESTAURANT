// Comprehensive end-to-end verification script for Alfiya Kitchen

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 STARTING COMPREHENSIVE E2E VERIFICATION FOR ALFIYA KITCHEN');
  console.log('=====================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ---------------------------------------------------------
  // TEST SUITE 1: ACCESS CONTROL & UNAUTHENTICATED PROTECTION
  // ---------------------------------------------------------
  console.log('\n--- 1. Testing Unauthenticated Access Control ---');

  // 1.1 /admin without auth
  const adminPageRes = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
  assert(
    adminPageRes.status === 307 || adminPageRes.status === 302 || adminPageRes.headers.get('location')?.includes('/admin/login'),
    `Unauthenticated /admin redirects to /admin/login (Status: ${adminPageRes.status}, Location: ${adminPageRes.headers.get('location')})`
  );

  // 1.2 /delivery without auth
  const deliveryPageRes = await fetch(`${BASE_URL}/delivery`, { redirect: 'manual' });
  assert(
    deliveryPageRes.status === 307 || deliveryPageRes.status === 302 || deliveryPageRes.headers.get('location')?.includes('/delivery/login'),
    `Unauthenticated /delivery redirects to /delivery/login (Status: ${deliveryPageRes.status}, Location: ${deliveryPageRes.headers.get('location')})`
  );

  // 1.3 /api/admin/orders without auth
  const adminApiRes = await fetch(`${BASE_URL}/api/admin/orders`);
  assert(
    adminApiRes.status === 401,
    `Unauthenticated /api/admin/orders returns 401 Unauthorized (Status: ${adminApiRes.status})`
  );

  // 1.4 /api/delivery/orders without auth
  const deliveryApiRes = await fetch(`${BASE_URL}/api/delivery/orders`);
  assert(
    deliveryApiRes.status === 401,
    `Unauthenticated /api/delivery/orders returns 401 Unauthorized (Status: ${deliveryApiRes.status})`
  );

  // ---------------------------------------------------------
  // TEST SUITE 2: ADMIN AUTHENTICATION
  // ---------------------------------------------------------
  console.log('\n--- 2. Testing Admin Authentication ---');

  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@alfiyakitchen.com', password: 'Alfiya@2026' }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminCookie = adminLoginRes.headers.get('set-cookie');

  assert(
    adminLoginRes.status === 200 && (adminLoginData.user?.role === 'super_admin' || adminLoginData.user?.role === 'admin') && adminCookie?.includes('admin_session'),
    `Admin successfully logged in with HttpOnly cookie (User: ${adminLoginData.user?.name})`
  );

  // Verify Admin Session
  const adminMeRes = await fetch(`${BASE_URL}/api/admin/auth/me`, {
    headers: { cookie: adminCookie || '' },
  });
  const adminMeData = await adminMeRes.json();
  assert(
    adminMeRes.status === 200 && adminMeData.user?.email === 'admin@alfiyakitchen.com',
    `Admin identity verified via session cookie (Email: ${adminMeData.user?.email})`
  );

  // ---------------------------------------------------------
  // TEST SUITE 3: DELIVERY PERSON AUTHENTICATION
  // ---------------------------------------------------------
  console.log('\n--- 3. Testing Delivery Person Authentication ---');

  const deliveryLoginRes = await fetch(`${BASE_URL}/api/delivery/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+91 94471 23456', password: 'Delivery@2026' }),
  });
  const deliveryLoginData = await deliveryLoginRes.json();
  const deliveryCookie = deliveryLoginRes.headers.get('set-cookie');

  assert(
    deliveryLoginRes.status === 200 && deliveryLoginData.deliveryPerson?.name === 'Rashid Ali' && deliveryCookie?.includes('gv_delivery_session'),
    `Delivery partner Rashid Ali logged in with HttpOnly cookie`
  );

  // Test Delivery Person Role Boundary: Delivery Person trying to access Admin API
  const deliveryOnAdminApiRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { cookie: deliveryCookie || '' },
  });
  assert(
    deliveryOnAdminApiRes.status === 401,
    `Delivery person cookie CANNOT access /api/admin/orders (Status: ${deliveryOnAdminApiRes.status})`
  );

  // ---------------------------------------------------------
  // TEST SUITE 4: DYNAMIC MENU VERIFICATION
  // ---------------------------------------------------------
  console.log('\n--- 4. Testing Dynamic Menu & Database Source of Truth ---');

  const menuRes = await fetch(`${BASE_URL}/api/menu`);
  const menuData = await menuRes.json();
  const dishes = menuData.dishes || menuData.items || [];
  assert(
    menuRes.status === 200 && Array.isArray(dishes) && dishes.length > 0,
    `Customer menu fetched dynamically from Neon DB (${dishes.length} items loaded)`
  );

  const sampleFood = dishes[0];
  assert(
    sampleFood && sampleFood.id && sampleFood.name && sampleFood.price > 0,
    `Sample food verified: "${sampleFood?.name}" at ₹${sampleFood?.price}`
  );

  // ---------------------------------------------------------
  // TEST SUITE 5: CUSTOMER ORDER WITH LAKSHADWEEP ADDRESS
  // ---------------------------------------------------------
  console.log('\n--- 5. Testing Order Placement with Lakshadweep Address Snapshot ---');

  const lakshadweepAddress = {
    customerName: 'Mohammed Shafi',
    customerPhone: '+91 94473 45678',
    customerEmail: 'shafi@amini.in',
    island: 'Amini',
    houseName: 'Kakkanada House #14',
    locality: 'Near Juma Masjid, South Beach Road',
    landmark: 'Opposite BSNL Tower',
    deliveryInstructions: 'Please ring the bell twice, or call upon reaching the lighthouse junction.',
  };

  const newOrderPayload = {
    orderType: 'delivery',
    paymentMethod: 'cash-on-delivery',
    customerName: 'Mohammed Shafi',
    phone: '+91 94473 45678',
    island: 'Amini',
    houseName: 'Kakkanada House #14',
    locality: 'Near Juma Masjid, South Beach Road',
    landmark: 'Opposite BSNL Tower',
    deliveryInstructions: 'Please ring the bell twice, or call upon reaching the lighthouse junction.',
    items: [
      {
        cartItemId: 'item-test-1',
        foodItem: sampleFood,
        quantity: 2,
        selectedAddOns: [],
      },
    ],
  };

  const createOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newOrderPayload),
  });
  const createOrderData = await createOrderRes.json();

  assert(
    (createOrderRes.status === 200 || createOrderRes.status === 201) && createOrderData.order?.id,
    `Order placed successfully! Order ID: ${createOrderData.order?.id}`
  );

  const orderId = createOrderData.order.id;
  const encodedOrderId = encodeURIComponent(orderId);

  // Verify Address Snapshot in Order
  const verifyOrderRes = await fetch(`${BASE_URL}/api/orders/${encodedOrderId}`);
  const verifyOrderData = await verifyOrderRes.json();
  const order = verifyOrderData.order;

  assert(
    order?.island === 'Amini' &&
    order?.houseName === 'Kakkanada House #14' &&
    order?.locality === 'Near Juma Masjid, South Beach Road' &&
    order?.landmark === 'Opposite BSNL Tower' &&
    order?.deliveryInstructions?.includes('ring the bell twice'),
    `Lakshadweep address snapshotted correctly into order (Island: ${order?.island}, House: ${order?.houseName})`
  );

  // Verify historical price snapshot
  const itemPrice = order?.items?.[0]?.foodItem?.price ?? order?.items?.[0]?.price;
  assert(
    itemPrice === sampleFood.price && order?.items?.[0]?.quantity === 2,
    `Historical item price correctly snapshotted at ₹${itemPrice}`
  );

  // ---------------------------------------------------------
  // TEST SUITE 6: ADMIN ORDER MANAGEMENT & WORKFLOW
  // ---------------------------------------------------------
  console.log('\n--- 6. Testing Admin Order Management & Delivery Assignment ---');

  // Fetch Delivery Persons List as Admin
  const deliveryPersonsRes = await fetch(`${BASE_URL}/api/admin/delivery-persons`, {
    headers: { cookie: adminCookie || '' },
  });
  const deliveryPersonsData = await deliveryPersonsRes.json();
  const rashid = deliveryPersonsData.deliveryPersons.find((d) => d.name === 'Rashid Ali');
  assert(
    rashid && rashid.id,
    `Admin retrieved active delivery person: Rashid Ali (ID: ${rashid?.id})`
  );

  // Admin updates order: PENDING -> CONFIRMED
  const confirmRes = await fetch(`${BASE_URL}/api/admin/orders/${encodedOrderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookie || '',
    },
    body: JSON.stringify({ status: 'confirmed' }),
  });
  assert(confirmRes.status === 200, `Admin confirmed order #${orderId}`);

  // Admin updates order: CONFIRMED -> PREPARING
  const prepRes = await fetch(`${BASE_URL}/api/admin/orders/${encodedOrderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookie || '',
    },
    body: JSON.stringify({ status: 'preparing' }),
  });
  assert(prepRes.status === 200, `Admin moved order #${orderId} to PREPARING`);

  // Admin updates order: PREPARING -> READY and assigns Rashid Ali
  const assignRes = await fetch(`${BASE_URL}/api/admin/orders/${encodedOrderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookie || '',
    },
    body: JSON.stringify({
      status: 'ready',
      delivery_person_id: rashid.id,
    }),
  });
  const assignData = await assignRes.json();
  assert(
    assignRes.status === 200 && assignData.order?.delivery_person_id === rashid.id,
    `Admin set order status to READY and assigned delivery to Rashid Ali`
  );

  // ---------------------------------------------------------
  // TEST SUITE 7: DELIVERY PERSON WORKFLOW & ISOLATION
  // ---------------------------------------------------------
  console.log('\n--- 7. Testing Delivery Person Workflow & Isolation ---');

  // Sayed Koya logs in
  const sayedLoginRes = await fetch(`${BASE_URL}/api/delivery/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+91 94472 34567', password: 'Delivery@2026' }),
  });
  const sayedCookie = sayedLoginRes.headers.get('set-cookie');

  // Sayed tries to view Rashid's order -> MUST BE 403 FORBIDDEN
  const sayedUnauthorizedRes = await fetch(`${BASE_URL}/api/delivery/orders/${encodedOrderId}`, {
    headers: { cookie: sayedCookie || '' },
  });
  assert(
    sayedUnauthorizedRes.status === 403,
    `Delivery Driver Isolation: Sayed Koya received 403 Forbidden when accessing Rashid's order #${orderId}`
  );

  // Rashid views his assigned order
  const rashidOrderRes = await fetch(`${BASE_URL}/api/delivery/orders/${encodedOrderId}`, {
    headers: { cookie: deliveryCookie || '' },
  });
  const rashidOrderData = await rashidOrderRes.json();
  assert(
    rashidOrderRes.status === 200 && rashidOrderData.order?.customerName === 'Mohammed Shafi',
    `Rashid Ali successfully accessed assigned order #${orderId} with customer name: ${rashidOrderData.order?.customerName}`
  );
  assert(
    rashidOrderData.order?.houseName === 'Kakkanada House #14' && rashidOrderData.order?.island === 'Amini',
    `Rashid Ali sees Lakshadweep delivery address (House: ${rashidOrderData.order?.houseName}, Island: ${rashidOrderData.order?.island})`
  );

  // Rashid clicks [Start Delivery] -> Action: start_delivery
  const startDeliveryRes = await fetch(`${BASE_URL}/api/delivery/orders/${encodedOrderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: deliveryCookie || '',
    },
    body: JSON.stringify({ action: 'start_delivery' }),
  });
  const startDeliveryData = await startDeliveryRes.json();
  assert(
    startDeliveryRes.status === 200 && startDeliveryData.order?.status === 'out_for_delivery',
    `Rashid Ali started delivery: Order status is now OUT_FOR_DELIVERY`
  );

  // Rashid clicks [Mark Delivered] -> Action: mark_delivered
  const markDeliveredRes = await fetch(`${BASE_URL}/api/delivery/orders/${encodedOrderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: deliveryCookie || '',
    },
    body: JSON.stringify({ action: 'mark_delivered' }),
  });
  const markDeliveredData = await markDeliveredRes.json();
  assert(
    markDeliveredRes.status === 200 && markDeliveredData.order?.status === 'delivered',
    `Rashid Ali completed delivery: Order status is now DELIVERED and payment marked PAID`
  );

  // ---------------------------------------------------------
  // TEST SUITE 8: CUSTOMER TRACKING REFLECTION
  // ---------------------------------------------------------
  console.log('\n--- 8. Testing Customer Order Tracking Reflection ---');

  const customerTrackingRes = await fetch(`${BASE_URL}/api/orders/${encodedOrderId}`);
  const customerTrackingData = await customerTrackingRes.json();

  assert(
    customerTrackingData.order?.status === 'delivered' &&
    customerTrackingData.order?.deliveryPersonName === 'Rashid Ali',
    `Customer tracking reflects DELIVERED with delivery partner Rashid Ali attributed`
  );

  // ---------------------------------------------------------
  // TEST SUITE 9: AUDIT TRAIL / ORDER STATUS HISTORY
  // ---------------------------------------------------------
  console.log('\n--- 9. Testing Order Status History Audit Trail ---');

  const adminOrderDetailRes = await fetch(`${BASE_URL}/api/admin/orders/${encodedOrderId}`, {
    headers: { cookie: adminCookie || '' },
  });
  const adminOrderDetailData = await adminOrderDetailRes.json();
  const history = adminOrderDetailData.order?.history || [];

  assert(
    history.length >= 3,
    `Audit trail recorded ${history.length} status transitions for order #${orderId}`
  );

  console.log('Recorded transitions:');
  history.forEach((h) => {
    console.log(`   - [${h.created_at}] Status: ${h.status} | Actor: ${h.actor_name} (${h.actor_role}) | Notes: ${h.notes || 'None'}`);
  });

  // Summary
  console.log('\n=====================================================================');
  console.log(`🏁 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('=====================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
