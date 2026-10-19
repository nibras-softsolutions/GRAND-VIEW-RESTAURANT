'use client';

import React, { useState, useEffect } from 'react';
import {
  Bike,
  Plus,
  Search,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Key,
  Edit2,
  AlertCircle,
  Package,
} from 'lucide-react';

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicleInfo?: string;
  active: boolean;
  activeOrdersCount: number;
  lastLoginAt?: string;
  createdAt: string;
}

export default function AdminDeliveryPersonsPage() {
  const [persons, setPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newVehicle, setNewVehicle] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Reset Password State
  const [resetPerson, setResetPerson] = useState<DeliveryPerson | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const fetchDeliveryPersons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/delivery-persons');
      if (res.ok) {
        const data = await res.json();
        setPersons(data.deliveryPersons || []);
      }
    } catch (err) {
      console.error('Failed to load delivery staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      const res = await fetch('/api/admin/delivery-persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          password: newPassword,
          vehicle_info: newVehicle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || 'Failed to create delivery person.');
        setModalLoading(false);
        return;
      }

      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
      setNewPassword('');
      setNewVehicle('');
      await fetchDeliveryPersons();
    } catch {
      setModalError('Connection failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/delivery-persons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive }),
      });

      if (res.ok) {
        setPersons((prev) =>
          prev.map((p) => (p.id === id ? { ...p, active: !currentActive } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPerson || !resetPasswordValue) return;

    try {
      const res = await fetch('/api/admin/delivery-persons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resetPerson.id, password: resetPasswordValue }),
      });

      if (res.ok) {
        alert(`Password for ${resetPerson.name} updated successfully.`);
        setResetPerson(null);
        setResetPasswordValue('');
      } else {
        alert('Failed to reset password.');
      }
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  };

  const filtered = persons.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.vehicleInfo && p.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C99A4A]">
            Staff & Logistics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814] mt-1">
            Delivery Partners
          </h1>
          <p className="text-xs text-[#77736C] mt-1">
            Manage restaurant delivery personnel, assign orders, and monitor active dispatches.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gold py-2.5 px-4 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer rounded-xl self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Partner</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-[#77736C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone number, vehicle..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E6E1D5] text-xs text-[#1A1814] placeholder-[#77736C] focus:outline-none focus:border-[#C99A4A]"
          />
        </div>

        <div className="bg-white rounded-xl px-4 py-2 border border-[#E6E1D5] flex items-center justify-between">
          <span className="text-xs text-[#77736C]">Total Partners</span>
          <span className="font-serif text-lg font-bold text-[#1A1814]">{persons.length}</span>
        </div>
      </div>

      {/* Table & Cards */}
      <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading delivery staff...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C] space-y-2">
            <Bike className="w-8 h-8 text-[#A0988C] mx-auto mb-1" />
            <p className="font-serif text-sm font-bold text-[#1A1814]">No Delivery Partners Found</p>
            <p className="max-w-xs mx-auto">
              Add your delivery drivers so orders can be assigned and dispatched across Lakshadweep.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-[#77736C] uppercase font-bold text-[10px] tracking-wider border-b border-[#E6E1D5]">
                <tr>
                  <th className="py-3 px-4">Partner</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Active Deliveries</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D5]/60">
                {filtered.map((person) => (
                  <tr key={person.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C99A4A]/10 text-[#C99A4A] flex items-center justify-center font-bold">
                          <Bike className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-[#1A1814]">{person.name}</p>
                          <p className="text-[10px] text-[#A0988C]">{person.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#1A1814]">
                      {person.phone}
                    </td>

                    <td className="py-3.5 px-4 text-[#77736C]">
                      {person.vehicleInfo || 'Standard Delivery'}
                    </td>

                    <td className="py-3.5 px-4">
                      {person.activeOrdersCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                          <Package className="w-3 h-3" />
                          <span>{person.activeOrdersCount} in progress</span>
                        </span>
                      ) : (
                        <span className="text-[#A0988C] text-[11px]">Idle / Available</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          person.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {person.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setResetPerson(person)}
                          className="p-1.5 rounded-lg border border-[#E6E1D5] hover:bg-white text-[#77736C] hover:text-[#1A1814] transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleActive(person.id, person.active)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                            person.active
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {person.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1A1814]">
                Add New Delivery Partner
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#77736C] hover:text-[#1A1814] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1814] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rashid Ali"
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1814] mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 94471 23456"
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1814] mb-1">Login Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter initial password"
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1814] mb-1">
                  Vehicle Details (Optional)
                </label>
                <input
                  type="text"
                  value={newVehicle}
                  onChange={(e) => setNewVehicle(e.target.value)}
                  placeholder="e.g. Honda Activa (LD-01-A-1234)"
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 rounded-xl border border-[#E6E1D5] text-[#77736C] hover:text-[#1A1814]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-gold py-2 px-5 rounded-xl text-white font-semibold cursor-pointer"
                >
                  {modalLoading ? 'Adding...' : 'Save Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPerson && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-left">
            <h3 className="font-serif text-base font-bold text-[#1A1814]">
              Reset Password for {resetPerson.name}
            </h3>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1814] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPerson(null)}
                  className="py-1.5 px-3 rounded-xl border border-[#E6E1D5] text-[#77736C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold py-1.5 px-4 rounded-xl text-white font-semibold cursor-pointer"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
