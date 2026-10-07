import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { TechnicianProfile } from '../types/database';
import { CEBU_CITY_BARANGAYS } from '../data/seedData';
import { X, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BookingModalProps {
  technician: TechnicianProfile | null;
  onClose: () => void;
  onBookedSuccess: () => void;
}

const TIME_SLOTS = [
  { label: '08:30 AM (Morning Slot)', value: '08:30' },
  { label: '10:30 AM (Late Morning)', value: '10:30' },
  { label: '01:30 PM (Early Afternoon)', value: '13:30' },
  { label: '03:30 PM (Late Afternoon)', value: '15:30' },
  { label: '05:00 PM (After-Work Visit)', value: '17:00' },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  technician,
  onClose,
  onBookedSuccess,
}) => {
  const { users, categories, currentUser, createBooking } = useDatabase();

  const getDefaultFutureDate = () => {
    const tomorrow = new Date(Date.now() + 2 * 86400000);
    return tomorrow.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getDefaultFutureDate());
  const [selectedTime, setSelectedTime] = useState<string>('10:30');
  const [barangay, setBarangay] = useState<string>(technician?.barangay || 'Lahug');
  const [streetAddress, setStreetAddress] = useState<string>(
    'Unit 4B, Sanson Road Residences, Cebu City'
  );
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [settlementMethod, setSettlementMethod] = useState<
    'Cash on Completion' | 'GCash (External)' | 'Maya (External)'
  >('Cash on Completion');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!technician) return null;

  const techUser = users.find((u) => u.user_id === technician.user_id);
  const category = categories.find((c) => c.category_id === technician.category_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!issueDescription.trim()) {
      setErrorMsg('Please describe the household repair issue before submitting.');
      return;
    }

    const combinedIso = `${selectedDate}T${selectedTime}:00`;
    const res = createBooking({
      technician_id: technician.profile_id,
      scheduled_at: combinedIso,
      barangay,
      street_address: streetAddress,
      issue_description: issueDescription,
      settlement_method: settlementMethod,
      estimated_fee_php: technician.hourly_rate_php,
    });

    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg(res.message);
    setTimeout(() => {
      onBookedSuccess();
      onClose();
    }, 500);
  };

  const triggerPastDateConstraintTest = () => {
    setSelectedDate('2024-01-10');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 overflow-y-auto">
      <div className="bg-[#F8F7F4] border border-stone-300 rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-xl my-8">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <p className="text-xs font-mono text-stone-500">
              F-03 Booking &amp; Scheduling Engine · Enforces BR-04 &amp; BR-05
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#141413] mt-1">
              Schedule Home Service Visit
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-[#141413] rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Technician Summary */}
        <div className="mt-4 p-4 bg-white border border-stone-200 rounded-lg flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-[#141413]">
              {techUser?.full_name || `Technician #${technician.profile_id}`}
            </div>
            <div className="text-xs text-stone-600 mt-0.5">
              <span>{category?.name}</span>
              <span className="mx-1.5">·</span>
              <span>Base Brgy. {technician.barangay}</span>
              <span className="mx-1.5">·</span>
              <span>Verified Credential</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-sm font-semibold text-[#1E3A2F] tabular-nums">
              ₱{technician.hourly_rate_php.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-500">Standard Visit Rate</div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Date & Time Slot Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>Service Date (<span className="font-mono">BR-04</span>)</span>
                </label>
                <button
                  type="button"
                  onClick={triggerPastDateConstraintTest}
                  className="text-[11px] font-mono text-amber-800 underline hover:text-amber-950 cursor-pointer"
                  title="Set a past date to test BR-04 CHECK (scheduled_at > created_at)"
                >
                  Test Past Date
                </button>
              </div>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>Preferred Time Slot</span>
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Cebu City Barangay
              </label>
              <select
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
              >
                {CEBU_CITY_BARANGAYS.map((b) => (
                  <option key={b} value={b}>
                    Brgy. {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                House / Unit No. &amp; Street (Cebu City Limits Only)
              </label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="House No., Street, Subdivision, Cebu City"
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Household Repair Details &amp; Symptoms
            </label>
            <textarea
              rows={3}
              required
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe the repair needed (e.g., Tripping 20A breaker on kitchen line, leaking PPR joint under sink)..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              External Settlement Preference
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                ['Cash on Completion', 'GCash (External)', 'Maya (External)'] as const
              ).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSettlementMethod(method)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    settlementMethod === method
                      ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-200">
            <div className="text-xs text-stone-600">
              Booking Client: <span className="font-semibold text-[#141413]">{currentUser?.full_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-[#141413] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors cursor-pointer"
              >
                Confirm Booking Request
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
