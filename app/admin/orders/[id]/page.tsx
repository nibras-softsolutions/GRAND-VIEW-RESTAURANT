'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Bike,
  Store,
  CreditCard,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Home,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { OrderStatus } from '@/types';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const rawId = decodeURIComponent(resolvedParams.id);
  const router = useRouter();

  const [order, setOrder] = useState<any | null>(null);
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(rawId)}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setSelectedDriverId(data.order.deliveryPersonId || '');
      }
    } catch (e) {
      console.error('Failed to load order', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPersons = async () => {
    try {
      const res = await fetch('/api/admin/delivery-persons');
      if (res.ok) {
        const data = await res.json();
        setDeliveryPersons(data.deliveryPersons || []);
      }
    } catch (e) {
      console.error('Failed to load delivery persons', e);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
    fetchDeliveryPersons();
  }, [rawId]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(rawId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrderDetail();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      }
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignDriver = async (driverId: string) => {
    try {
      setAssigning(true);
      setSelectedDriverId(driverId);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(rawId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_person_id: driverId || null }),
      });

      if (res.ok) {
        await fetchOrderDetail();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to assign driver');
      }
    } catch (e) {
      console.error('Failed to assign driver', e);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#77736C]">
        <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading order {rawId}...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E6E1D5] text-center max-w-md mx-auto">
        <h3 className="font-serif text-lg font-bold text-[#1A1814] mb-2">Order Not Found</h3>
        <p className="text-xs text-[#77736C] mb-4">The order {rawId} could not be retrieved from the database.</p>
        <Link href="/admin/orders" className="btn-gold py-2 px-4 text-xs font-semibold inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isPickup = order.orderType === 'pickup';

  // Determine available next step in workflow
  const getNextStep = (status: string) => {
    if (status === 'pending') return { label: 'Confirm Order', next: 'confirmed' };
    if (status === 'confirmed') return { label: 'Mark as Preparing in Kitchen', next: 'preparing' };
    if (status === 'preparing') {
      return isPickup
        ? { label: 'Mark Ready for Pickup', next: 'ready_for_pickup' }
        : { label: 'Mark Ready for Delivery', next: 'ready' };
    }
    if (status === 'ready') {
      return { label: 'Dispatch (Out for Delivery)', next: 'out_for_delivery' };
    }
    if (status === 'out_for_delivery' || status === 'ready_for_pickup') {
      return { label: isPickup ? 'Mark as Picked Up' : 'Mark as Delivered', next: 'delivered' };
    }
    return null;
  };

  const nextAction = getNextStep(order.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 -ml-2 rounded-xl text-[#1A1814] hover:bg-white transition-colors border border-transparent hover:border-[#E6E1D5]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-2xl font-bold text-[#1A1814]">
                {order.id}
              </h2>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'rejected' || order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-[#77736C] mt-0.5">
              Created {order.createdAt} • Type: <span className="capitalize font-semibold">{order.orderType || 'delivery'}</span>
            </p>
          </div>
        </div>

        {/* Workflow Advance Button & Reject */}
        <div className="flex items-center gap-2">
          {order.status === 'pending' && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleStatusChange('rejected' as OrderStatus)}
              className="py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
            >
              Reject Order
            </button>
          )}

          {nextAction && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleStatusChange(nextAction.next as OrderStatus)}
              className="btn-gold py-2.5 px-5 text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#C99A4A]/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{nextAction.label}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Line Items & Pricing */}
        <div className="lg:col-span-8 space-y-6">
          {/* Ordered Dishes Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E1D5] shadow-xs">
            <h3 className="font-serif text-base font-bold text-[#1A1814] mb-4">
              Ordered Items ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-[#E6E1D5]/70">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.foodItem?.image && (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#1D1B18] shrink-0 border border-[#E6E1D5]">
                        <Image
                          src={item.foodItem.image}
                          alt={item.foodItem.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#1A1814] text-sm">
                        {item.foodItem?.name || item.name || 'Dish'}
                      </p>
                      <p className="text-xs text-[#77736C]">
                        ₹{item.foodItem?.price || item.price} × {item.quantity}
                      </p>
                      {item.selectedAddOns?.length > 0 && (
                        <p className="text-[11px] text-[#C99A4A] mt-0.5">
                          + {item.selectedAddOns.map((a: any) => `${a.name} (₹${a.price})`).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="font-bold text-sm text-[#1A1814]">
                    ₹{item.itemTotal || ((item.foodItem?.price || item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Calculation */}
            <div className="mt-5 pt-4 border-t border-[#E6E1D5] space-y-2 text-xs">
              <div className="flex justify-between text-[#77736C]">
                <span>Subtotal</span>
                <span className="font-medium text-[#1A1814]">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-[#77736C]">
                <span>Delivery Charge</span>
                <span className="font-medium text-[#1A1814]">₹{order.deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-[#77736C]">
                <span>GST Tax (5%)</span>
                <span className="font-medium text-[#1A1814]">₹{order.tax}</span>
              </div>
              <div className="border-t border-[#E6E1D5] pt-2 flex justify-between text-base font-bold text-[#1A1814]">
                <span>Total Amount</span>
                <span className="text-[#C99A4A]">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Timeline History */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E1D5] shadow-xs">
            <h3 className="font-serif text-base font-bold text-[#1A1814] mb-4">
              Status Progression Timeline
            </h3>

            <div className="space-y-4">
              {order.timeline?.map((step: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      step.completed
                        ? 'bg-[#C99A4A] text-white'
                        : step.current
                        ? 'bg-amber-100 text-amber-700 border-2 border-[#C99A4A]'
                        : 'bg-[#FAF8F5] text-[#A0988C] border border-[#E6E1D5]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-[#1A1814]">{step.title}</p>
                      {step.time && <span className="text-[11px] text-[#77736C]">{step.time}</span>}
                    </div>
                    <p className="text-[11px] text-[#77736C] mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Audit History Log */}
            {order.history && order.history.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#E6E1D5]/70">
                <p className="text-xs font-bold text-[#1A1814] uppercase tracking-wider mb-2">
                  Action History Log
                </p>
                <div className="space-y-1.5 text-[11px] text-[#77736C]">
                  {order.history.map((h: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-[#FAF9F6] p-2 rounded-lg border border-[#E6E1D5]">
                      <span>
                        <strong className="text-[#1A1814]">{h.actor_name || h.actor_role}</strong>: {h.notes || `Changed to ${h.status}`}
                      </span>
                      <span className="text-[10px] text-[#A0988C]">
                        {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer, Delivery Person Assignment & Address */}
        <div className="lg:col-span-4 space-y-6">
          {/* Assign Delivery Partner Card */}
          {!isPickup && (
            <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#C99A4A]">
                <Bike className="w-4 h-4" />
                <h4 className="font-serif text-sm font-bold text-[#1A1814]">
                  Assign Delivery Partner
                </h4>
              </div>

              {order.deliveryPersonName ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <p className="text-[10px] uppercase font-bold text-emerald-800">Assigned Partner</p>
                  <p className="font-bold text-sm text-[#1A1814]">{order.deliveryPersonName}</p>
                  <p className="text-[#77736C]">{order.deliveryPersonPhone}</p>
                  {order.deliveryPersonVehicle && (
                    <p className="text-[11px] text-[#77736C]">Vehicle: {order.deliveryPersonVehicle}</p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  <span className="font-bold">Unassigned:</span> Select a delivery driver below to assign this order.
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#1A1814] mb-1">
                  Choose Active Delivery Partner
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => handleAssignDriver(e.target.value)}
                  disabled={assigning}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] bg-[#FAF9F6] text-xs text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                >
                  <option value="">-- Select Delivery Partner --</option>
                  {deliveryPersons
                    .filter((dp) => dp.active)
                    .map((dp) => (
                      <option key={dp.id} value={dp.id}>
                        {dp.name} ({dp.phone}) {dp.vehicleInfo ? `• ${dp.vehicleInfo}` : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Customer Details */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#1A1814]">
              Customer Information
            </h4>
            <div className="text-xs space-y-2">
              <p className="font-bold text-sm text-[#1A1814]">{order.customerName}</p>
              <a
                href={`tel:${order.phone}`}
                className="flex items-center gap-2 text-[#C99A4A] hover:underline font-semibold"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{order.phone}</span>
              </a>
              {order.email && (
                <p className="flex items-center gap-2 text-[#77736C]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{order.email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Structured Local Delivery Address */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#1A1814]">
              {isPickup ? 'Pickup Location' : 'Local Delivery Address'}
            </h4>
            
            {isPickup ? (
              <div className="text-xs text-[#1A1814] flex items-center gap-2">
                <Store className="w-4 h-4 text-[#C99A4A]" />
                <span>Front Counter Pickup at Grand View Restaurant</span>
              </div>
            ) : (
              <div className="text-xs space-y-2 text-[#1A1814]">
                <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E6E1D5]">
                  <span className="text-[10px] text-[#77736C] uppercase font-bold block">
                    Island & Locality
                  </span>
                  <p className="font-bold text-sm">
                    {order.island || 'Amini'} • {order.locality || 'Locality'}
                  </p>
                </div>

                <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E6E1D5]">
                  <span className="text-[10px] text-[#77736C] uppercase font-bold block">
                    House Name / Number
                  </span>
                  <p className="font-bold">
                    {order.houseName || order.deliveryAddress}
                  </p>
                </div>

                {order.landmark && (
                  <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E6E1D5]">
                    <span className="text-[10px] text-[#77736C] uppercase font-bold block">
                      Landmark
                    </span>
                    <p>{order.landmark}</p>
                  </div>
                )}

                {order.deliveryInstructions && (
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                    <span className="text-[10px] uppercase font-bold block text-amber-800">
                      Delivery Instructions
                    </span>
                    <p className="font-medium">{order.deliveryInstructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#1A1814]">
              Payment Details
            </h4>
            <div className="text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#1A1814]">
                <CreditCard className="w-3.5 h-3.5 text-[#C99A4A]" />
                <span className="font-semibold capitalize">
                  {order.paymentMethod?.replace(/-/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-[#77736C]">
                Total: <span className="font-bold text-[#1A1814]">₹{order.total}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
