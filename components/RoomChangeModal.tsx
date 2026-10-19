'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { HOTEL_INFO } from '@/data/menuData';
import { X, BedDouble, Check } from 'lucide-react';

export default function RoomChangeModal() {
  const { isRoomModalOpen, setIsRoomModalOpen, guestInfo, updateGuestInfo, showToast } = useCart();
  const [customRoom, setCustomRoom] = useState(guestInfo.roomNumber);
  const [guestName, setGuestName] = useState(guestInfo.name);

  if (!isRoomModalOpen) return null;

  const handleSelectPreset = (roomStr: string) => {
    // Extract room number from e.g. "Room 302 (Executive Premier)"
    const match = roomStr.match(/Room\s*(\d+[A-Z]?)/i);
    const roomNum = match ? match[1] : roomStr;
    setCustomRoom(roomNum);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoom.trim()) {
      showToast('Please enter your room number', 'error');
      return;
    }
    updateGuestInfo({
      roomNumber: customRoom.trim(),
      name: guestName.trim() || 'Guest',
    });
    setIsRoomModalOpen(false);
    showToast(`Updated delivery destination to Room ${customRoom.trim()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#E8E3D8] relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-room-title"
      >
        <button
          onClick={() => setIsRoomModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#77736C] hover:text-[#1D1D1B] rounded-full hover:bg-[#F8F7F3] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-[#B98A3E]/10 flex items-center justify-center text-[#B98A3E]">
            <BedDouble className="w-5 h-5" />
          </div>
          <div>
            <h3 id="modal-room-title" className="font-serif text-lg font-semibold text-[#1D1D1B]">
              In-Room Delivery Destination
            </h3>
            <p className="text-xs text-[#77736C]">Specify your room at Grand View Hotel</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#77736C] mb-1.5">
              Guest Name
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Alexander Wright"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3D8] bg-[#F8F7F3] text-sm text-[#1D1D1B] focus:outline-none focus:border-[#B98A3E] focus:ring-1 focus:ring-[#B98A3E] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#77736C] mb-1.5">
              Room Number
            </label>
            <input
              type="text"
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
              placeholder="e.g. 302"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3D8] bg-[#F8F7F3] text-sm text-[#1D1D1B] focus:outline-none focus:border-[#B98A3E] focus:ring-1 focus:ring-[#B98A3E] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#77736C] mb-2">
              Quick Select Room
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {HOTEL_INFO.availableRooms.map((room) => {
                const match = room.match(/Room\s*(\d+[A-Z]?)/i);
                const roomNum = match ? match[1] : room;
                const isSelected = customRoom.trim() === roomNum;

                return (
                  <button
                    key={room}
                    type="button"
                    onClick={() => handleSelectPreset(room)}
                    className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-[#B98A3E] bg-[#B98A3E]/10 text-[#B98A3E] font-medium'
                        : 'border-[#E8E3D8] hover:border-[#B98A3E]/60 text-[#1D1D1B]'
                    }`}
                  >
                    <span className="truncate">{room}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#B98A3E]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E3D8] text-xs font-medium text-[#77736C] hover:bg-[#F8F7F3] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#B98A3E] text-white text-xs font-medium tracking-wide hover:bg-[#A3772F] transition-colors shadow-sm"
            >
              Confirm Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
