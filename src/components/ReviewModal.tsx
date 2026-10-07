import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Booking } from '../types/database';
import { X, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ booking, onClose }) => {
  const { users, technicianProfiles, submitReview } = useDatabase();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!booking) return null;

  const techProfile = technicianProfiles.find((t) => t.profile_id === booking.technician_id);
  const techUser = users.find((u) => u.user_id === techProfile?.user_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = submitReview({
      booking_id: booking.booking_id,
      rating,
      comment,
    });

    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg(res.message);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 overflow-y-auto">
      <div className="bg-[#F8F7F4] border border-stone-300 rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-xl my-8">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <p className="text-xs font-mono text-stone-500">
              F-06 Post-Job Review · Enforces BR-06 (COMPLETED only) &amp; BR-07 (1..5 Rating)
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#141413] mt-1">
              Rate Completed Service Visit
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

        <div className="mt-4 p-3.5 bg-white border border-stone-200 rounded-lg text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-stone-500">booking_id: #{booking.booking_id}</span>
            <span className="font-mono text-emerald-800 font-semibold">status: {booking.status}</span>
          </div>
          <div className="font-semibold text-[#141413] text-sm">
            Technician: {techUser?.full_name} (Brgy. {booking.barangay})
          </div>
          <p className="text-stone-600">{booking.issue_description}</p>
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
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Integer Star Rating (<span className="font-mono">BR-07: CHECK (rating BETWEEN 1 AND 5)</span>)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setRating(score)}
                  className={`flex-1 py-2.5 px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    rating >= score
                      ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      rating >= score ? 'fill-amber-400 text-amber-400' : 'text-stone-400'
                    }`}
                  />
                  <span>{score}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Written Workmanship Feedback (<span className="font-mono">reviews.comment</span>)
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details on punctuality, repair quality, and diagnostic transparency..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              Submit Verified Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
