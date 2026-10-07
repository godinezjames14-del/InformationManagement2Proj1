import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Booking, BookingStatus } from '../types/database';
import { CEBU_CITY_BARANGAYS } from '../data/seedData';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Wrench,
  Calendar,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenReviewModal: (booking: Booking) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onNavigateToDirectory: () => void;
  onNavigateToVerification: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenReviewModal,
  onOpenAuthModal,
  onNavigateToDirectory,
  onNavigateToVerification,
}) => {
  const {
    users,
    categories,
    technicianProfiles,
    verificationDocuments,
    bookings,
    reviews,
    currentUser,
    updateBookingStatus,
    updateTechnicianProfile,
    uploadVerificationDocument,
  } = useDatabase();

  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const myTechProfile = technicianProfiles.find((p) => p.user_id === currentUser?.user_id) || null;
  const [editCatId, setEditCatId] = useState<number>(myTechProfile?.category_id || 1);
  const [editBarangay, setEditBarangay] = useState<string>(myTechProfile?.barangay || 'Lahug');
  const [editRate, setEditRate] = useState<number>(myTechProfile?.hourly_rate_php || 600);
  const [editYears, setEditYears] = useState<number>(myTechProfile?.years_experience || 5);
  const [editSkills, setEditSkills] = useState<string>(
    myTechProfile ? myTechProfile.skills.join(', ') : ''
  );
  const [editBio, setEditBio] = useState<string>(myTechProfile?.bio || '');

  const [newDocType, setNewDocType] = useState<string>('Barangay Clearance (2026 Renewal)');
  const [newDocRef, setNewDocRef] = useState<string>('BRGY-CEBU-2026-5108');
  const [newDocAuthority, setNewDocAuthority] = useState<string>('Cebu City Barangay Hall');

  if (!currentUser) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-4">
        <h2 className="font-display text-2xl font-semibold text-[#141413]">
          Authentication Required for Role Workspace
        </h2>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Sign in as a Homeowner (Client), Local Tradesman (Technician), or Platform Administrator
          to view active booking requests, repair histories, and job queues.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onOpenAuthModal('login')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors cursor-pointer"
          >
            Sign In / Switch Demo Role
          </button>
          <button
            type="button"
            onClick={() => onOpenAuthModal('register')}
            className="px-4 py-2.5 text-xs font-semibold text-[#141413] bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const roleBookings = bookings.filter((b) => {
    if (currentUser.role === 'CLIENT') {
      return b.client_id === currentUser.user_id;
    }
    if (currentUser.role === 'TECHNICIAN' && myTechProfile) {
      return b.technician_id === myTechProfile.profile_id;
    }
    return true; // ADMIN
  });

  const filteredBookings = roleBookings.filter((b) =>
    statusFilter === 'ALL' ? true : b.status === statusFilter
  );

  const handleStatusChange = (bookingId: number, nextStatus: BookingStatus) => {
    const res = updateBookingStatus(bookingId, nextStatus);
    setBannerMessage(res.message);
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const handleSaveTechProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTechProfile) return;
    const res = updateTechnicianProfile({
      profile_id: myTechProfile.profile_id,
      category_id: editCatId,
      barangay: editBarangay,
      hourly_rate_php: editRate,
      years_experience: editYears,
      skills: editSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      bio: editBio,
    });
    setBannerMessage(res.message);
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const handleUploadCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTechProfile || !newDocType.trim() || !newDocRef.trim()) return;
    const res = uploadVerificationDocument({
      profile_id: myTechProfile.profile_id,
      document_type: newDocType,
      reference_number: newDocRef,
      issuing_authority: newDocAuthority,
    });
    setBannerMessage(res.message);
    setNewDocRef(`BRGY-CEBU-2026-${Math.floor(1000 + Math.random() * 8999)}`);
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const counts = {
    ALL: roleBookings.length,
    PENDING: roleBookings.filter((b) => b.status === 'PENDING').length,
    ACCEPTED: roleBookings.filter((b) => b.status === 'ACCEPTED').length,
    COMPLETED: roleBookings.filter((b) => b.status === 'COMPLETED').length,
    CANCELLED: roleBookings.filter((b) => b.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
            <span>F-05 Dashboards &amp; History</span>
            <span>·</span>
            <span>Active Session: {currentUser.email}</span>
            <span>·</span>
            <span>Role: {currentUser.role}</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#141413] mt-1">
            {currentUser.role === 'CLIENT' && 'Homeowner Repair Requests & History'}
            {currentUser.role === 'TECHNICIAN' && 'Technician Job Queue & Profile Management'}
            {currentUser.role === 'ADMIN' && 'Platform Bookings & Transaction Ledger'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {currentUser.role === 'CLIENT' && (
            <button
              type="button"
              onClick={onNavigateToDirectory}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Another Technician</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenAuthModal('login')}
            className="px-3.5 py-2 text-xs font-semibold text-[#141413] bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Switch Role / User
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <span>{bannerMessage}</span>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-emerald-700 font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {currentUser.role === 'TECHNICIAN' && myTechProfile && !myTechProfile.is_verified && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                BR-03 Enforcement Active: Your Technician Profile (#{myTechProfile.profile_id}) is
                currently hidden from the public Cebu City directory.
              </span>
            </div>
            <p className="text-xs text-amber-800">
              Platform Administrators must approve your uploaded Trade License and Barangay
              Clearance before homeowners can book your profile.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToVerification}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            Open Verification Module
          </button>
        </div>
      )}

      {/* Summary Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500">Total Bookings</div>
          <div className="font-mono text-2xl font-semibold text-[#141413] tabular-nums mt-1">
            {counts.ALL}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500">Pending Requests</div>
          <div className="font-mono text-2xl font-semibold text-amber-700 tabular-nums mt-1">
            {counts.PENDING}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500">Accepted / Scheduled</div>
          <div className="font-mono text-2xl font-semibold text-[#1E3A2F] tabular-nums mt-1">
            {counts.ACCEPTED}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500">Completed Visits</div>
          <div className="font-mono text-2xl font-semibold text-emerald-700 tabular-nums mt-1">
            {counts.COMPLETED}
          </div>
        </div>
      </div>

      {/* Bookings & Job Queue Table */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-[#141413]">
            {currentUser.role === 'TECHNICIAN'
              ? 'Incoming Service Job Queue'
              : 'Service Bookings & Repair Status Tracker'}
          </h2>

          <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-lg overflow-x-auto">
            {(['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-stone-600 hover:text-[#141413]'
                }`}
              >
                {st} ({counts[st]})
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-3">
            <p className="text-sm font-semibold text-[#141413]">
              No bookings found in the {statusFilter} state.
            </p>
            <p className="text-xs text-stone-600">
              {currentUser.role === 'CLIENT'
                ? 'Browse the Cebu City Service Directory to request a home repair visit.'
                : 'Bookings assigned to your profile will appear here in real time.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-mono text-stone-500">
                    <th className="py-3 px-4">booking_id</th>
                    <th className="py-3 px-4">Client &amp; Technician</th>
                    <th className="py-3 px-4">Barangay &amp; Scope</th>
                    <th className="py-3 px-4">Scheduled Slot (BR-04)</th>
                    <th className="py-3 px-4 text-right">Est. Rate</th>
                    <th className="py-3 px-4">Status (BR-05)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {filteredBookings.map((b) => {
                    const clientUser = users.find((u) => u.user_id === b.client_id);
                    const techProfile = technicianProfiles.find(
                      (t) => t.profile_id === b.technician_id
                    );
                    const techUser = users.find((u) => u.user_id === techProfile?.user_id);
                    const category = categories.find(
                      (c) => c.category_id === techProfile?.category_id
                    );
                    const existingReview = reviews.find((r) => r.booking_id === b.booking_id);

                    return (
                      <tr key={b.booking_id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#141413] tabular-nums align-top">
                          #{b.booking_id}
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-semibold text-[#141413]">
                            Tech: {techUser?.full_name}
                          </div>
                          <div className="text-stone-500 mt-0.5">
                            {category?.name} · Client: {clientUser?.full_name}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs align-top">
                          <div className="font-semibold text-[#141413]">
                            Brgy. {b.barangay} · {b.street_address}
                          </div>
                          <p className="text-stone-600 mt-0.5 leading-snug">
                            {b.issue_description}
                          </p>
                          {existingReview && (
                            <div className="mt-2 pt-1.5 border-t border-stone-200 text-[11px] text-stone-600">
                              <span className="font-mono font-semibold text-amber-700">
                                ★ {existingReview.rating}/5 Review:{' '}
                              </span>
                              <span>&ldquo;{existingReview.comment}&rdquo;</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-stone-700 align-top whitespace-nowrap">
                          <div>
                            {new Date(b.scheduled_at).toLocaleDateString('en-PH', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-stone-500 text-[11px]">
                            {new Date(b.scheduled_at).toLocaleTimeString('en-PH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-right tabular-nums text-[#141413] align-top whitespace-nowrap">
                          <div>₱{b.estimated_fee_php.toLocaleString()}</div>
                          <div className="text-[11px] font-sans font-normal text-stone-500">
                            {b.settlement_method}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold align-top whitespace-nowrap">
                          {b.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1.5 text-amber-700">
                              <Clock className="w-3.5 h-3.5" />
                              PENDING
                            </span>
                          )}
                          {b.status === 'ACCEPTED' && (
                            <span className="inline-flex items-center gap-1.5 text-[#1E3A2F]">
                              <Wrench className="w-3.5 h-3.5" />
                              ACCEPTED
                            </span>
                          )}
                          {b.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              COMPLETED
                            </span>
                          )}
                          {b.status === 'CANCELLED' && (
                            <span className="inline-flex items-center gap-1.5 text-stone-500">
                              <XCircle className="w-3.5 h-3.5" />
                              CANCELLED
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right align-top whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {(currentUser.role === 'TECHNICIAN' || currentUser.role === 'ADMIN') &&
                              b.status === 'PENDING' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(b.booking_id, 'ACCEPTED')}
                                    className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-md transition-colors cursor-pointer"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(b.booking_id, 'CANCELLED')}
                                    className="px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}

                            {b.status === 'ACCEPTED' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(b.booking_id, 'COMPLETED')}
                                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
                              >
                                Mark Completed
                              </button>
                            )}

                            {currentUser.role === 'CLIENT' && b.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(b.booking_id, 'CANCELLED')}
                                className="px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}

                            {b.status === 'COMPLETED' && !existingReview && (
                              <button
                                type="button"
                                onClick={() => onOpenReviewModal(b)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-md transition-colors cursor-pointer"
                              >
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>Leave Review (F-06)</span>
                              </button>
                            )}

                            {b.status === 'COMPLETED' && existingReview && (
                              <span className="font-mono text-[11px] text-stone-500">
                                Reviewed ({existingReview.rating}/5)
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Technician Profile Management */}
      {currentUser.role === 'TECHNICIAN' && myTechProfile && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-stone-200">
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <div>
              <span className="text-xs font-mono text-stone-500">
                technician_profiles (profile_id: #{myTechProfile.profile_id} · BR-08 1:1 user_id: #{currentUser.user_id})
              </span>
              <h3 className="font-display text-xl font-semibold text-[#141413] mt-0.5">
                Update Trade Profile &amp; Cebu City Coverage
              </h3>
            </div>

            <form onSubmit={handleSaveTechProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Primary Trade Category
                  </label>
                  <select
                    value={editCatId}
                    onChange={(e) => setEditCatId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Base Barangay
                  </label>
                  <select
                    value={editBarangay}
                    onChange={(e) => setEditBarangay(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    {CEBU_CITY_BARANGAYS.map((b) => (
                      <option key={b} value={b}>
                        Brgy. {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Visit Rate (PHP)
                  </label>
                  <input
                    type="number"
                    min={250}
                    max={5000}
                    value={editRate}
                    onChange={(e) => setEditRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Specialized Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Years Experience
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={editYears}
                    onChange={(e) => setEditYears(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Public Trade Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <div>
              <span className="text-xs font-mono text-stone-500">
                verification_documents (1:M with technician_profiles)
              </span>
              <h3 className="font-display text-xl font-semibold text-[#141413] mt-0.5">
                Trade Licenses &amp; Clearances
              </h3>
            </div>

            <div className="divide-y divide-stone-200 border border-stone-200 rounded-lg">
              {verificationDocuments
                .filter((d) => d.profile_id === myTechProfile.profile_id)
                .map((doc) => (
                  <div key={doc.doc_id} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#141413]">{doc.document_type}</div>
                      <div className="font-mono text-[11px] text-stone-500">
                        {doc.reference_number} · {doc.issuing_authority}
                      </div>
                    </div>
                    <span
                      className={`font-mono font-semibold ${
                        doc.status === 'APPROVED'
                          ? 'text-emerald-700'
                          : doc.status === 'REJECTED'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
            </div>

            <form
              onSubmit={handleUploadCredential}
              className="pt-3 border-t border-stone-200 space-y-3"
            >
              <div className="text-xs font-semibold text-stone-700">
                Submit Additional License or Barangay Clearance
              </div>
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Document Type</label>
                <input
                  type="text"
                  required
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  placeholder="e.g., TESDA NC II Certificate, Barangay Clearance"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Reference No.</label>
                  <input
                    type="text"
                    required
                    value={newDocRef}
                    onChange={(e) => setNewDocRef(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    required
                    value={newDocAuthority}
                    onChange={(e) => setNewDocAuthority(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};
