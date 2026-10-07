import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { VerificationStatus } from '../types/database';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface VerificationViewProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({ onOpenAuthModal }) => {
  const {
    users,
    categories,
    technicianProfiles,
    verificationDocuments,
    currentUser,
    quickSwitchUser,
    reviewVerificationDocument,
    setTechnicianVerified,
  } = useDatabase();

  const [docStatusFilter, setDocStatusFilter] = useState<VerificationStatus | 'ALL'>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';

  const filteredDocs = verificationDocuments.filter((d) =>
    docStatusFilter === 'ALL' ? true : d.status === docStatusFilter
  );

  const handleDocAction = (docId: number, status: VerificationStatus) => {
    const res = reviewVerificationDocument(docId, status);
    setFeedback({ type: res.ok ? 'ok' : 'err', text: res.message });
  };

  const handleProfileVerifyToggle = (profileId: number, nextVerified: boolean) => {
    const res = setTechnicianVerified(profileId, nextVerified);
    setFeedback({ type: res.ok ? 'ok' : 'err', text: res.message });
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <span>F-04 Administrative Verification Module</span>
            <span>·</span>
            <span>Tables: verification_documents, technician_profiles, users</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#141413] mt-1">
            Trade License &amp; Barangay Clearance Verification
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Enforces Business Rule <strong>BR-03</strong>: A technician profile must not appear in
            the public Cebu City directory unless verified by a Platform Administrator.
          </p>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 px-4 py-2.5 rounded-lg">
            <Lock className="w-4 h-4 text-amber-800 shrink-0" />
            <div className="text-xs text-amber-900">
              Viewing in read-only mode ({currentUser ? currentUser.role : 'Guest'}).
            </div>
            <button
              type="button"
              onClick={() => quickSwitchUser(8)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-md whitespace-nowrap cursor-pointer"
            >
              Switch to Admin Role
            </button>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg border text-xs flex items-center justify-between ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Directory Gate Table */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#141413]">
            01. Technician Directory Activation Matrix (BR-03)
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Toggle <span className="font-mono">technician_profiles.is_verified</span> once submitted credentials are approved.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-mono text-stone-500">
                  <th className="py-3 px-4">profile_id</th>
                  <th className="py-3 px-4">Tradesman &amp; User (BR-08)</th>
                  <th className="py-3 px-4">Category &amp; Barangay</th>
                  <th className="py-3 px-4">Submitted Docs</th>
                  <th className="py-3 px-4">Visibility (BR-03)</th>
                  <th className="py-3 px-4 text-right">Admin Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {technicianProfiles.map((profile) => {
                  const techUser = users.find((u) => u.user_id === profile.user_id);
                  const category = categories.find((c) => c.category_id === profile.category_id);
                  const docs = verificationDocuments.filter(
                    (d) => d.profile_id === profile.profile_id
                  );
                  const approvedCount = docs.filter((d) => d.status === 'APPROVED').length;
                  const pendingCount = docs.filter((d) => d.status === 'PENDING').length;

                  return (
                    <tr key={profile.profile_id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#141413] tabular-nums">
                        #{profile.profile_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#141413]">{techUser?.full_name}</div>
                        <div className="font-mono text-[11px] text-stone-500">
                          user_id: #{profile.user_id} · {techUser?.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#141413]">{category?.name}</div>
                        <div className="text-stone-500">Brgy. {profile.barangay}, Cebu City</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        <span className="text-emerald-700 font-semibold">
                          {approvedCount} Approved
                        </span>
                        <span className="mx-1.5 text-stone-300">·</span>
                        <span
                          className={
                            pendingCount > 0 ? 'text-amber-700 font-semibold' : 'text-stone-500'
                          }
                        >
                          {pendingCount} Pending
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {profile.is_verified ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold">
                            <Eye className="w-3.5 h-3.5" />
                            is_verified = TRUE (Public)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-800 font-semibold">
                            <EyeOff className="w-3.5 h-3.5" />
                            is_verified = FALSE (Hidden)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isAdmin ? (
                          profile.is_verified ? (
                            <button
                              type="button"
                              onClick={() => handleProfileVerifyToggle(profile.profile_id, false)}
                              className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleProfileVerifyToggle(profile.profile_id, true)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-md transition-colors cursor-pointer"
                            >
                              Activate
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenAuthModal('login')}
                            className="text-xs font-mono text-stone-500 underline hover:text-[#141413] cursor-pointer"
                          >
                            Requires ADMIN
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Verification Documents Queue */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#141413]">
              02. Uploaded Trade Licenses &amp; Barangay Clearances
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Constraint: <span className="font-mono">CHECK (status IN (&apos;PENDING&apos;, &apos;APPROVED&apos;, &apos;REJECTED&apos;))</span>
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-lg">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setDocStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors cursor-pointer ${
                  docStatusFilter === st
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-stone-600 hover:text-[#141413]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-mono text-stone-500">
                  <th className="py-3 px-4">doc_id</th>
                  <th className="py-3 px-4">Applicant (profile_id)</th>
                  <th className="py-3 px-4">Document Type &amp; Ref</th>
                  <th className="py-3 px-4">Issuing Authority</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Review Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {filteredDocs.map((doc) => {
                  const profile = technicianProfiles.find((p) => p.profile_id === doc.profile_id);
                  const techUser = users.find((u) => u.user_id === profile?.user_id);

                  return (
                    <tr key={doc.doc_id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#141413] tabular-nums">
                        #{doc.doc_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#141413]">{techUser?.full_name}</div>
                        <div className="font-mono text-[11px] text-stone-500">
                          profile_id: #{doc.profile_id} · Brgy. {profile?.barangay}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#141413]">{doc.document_type}</div>
                        <div className="font-mono text-[11px] text-stone-500">
                          {doc.reference_number}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">{doc.issuing_authority}</td>
                      <td className="py-3.5 px-4 font-mono text-stone-600 tabular-nums whitespace-nowrap">
                        {new Date(doc.submitted_at).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold whitespace-nowrap">
                        {doc.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 text-amber-700">
                            <Clock className="w-3.5 h-3.5" />
                            PENDING
                          </span>
                        )}
                        {doc.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            APPROVED
                          </span>
                        )}
                        {doc.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1.5 text-red-700">
                            <XCircle className="w-3.5 h-3.5" />
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            {doc.status !== 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleDocAction(doc.doc_id, 'APPROVED')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}
                            {doc.status !== 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => handleDocAction(doc.doc_id, 'REJECTED')}
                                className="px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => quickSwitchUser(8)}
                            className="text-xs font-mono text-[#1E3A2F] underline hover:text-[#141413] cursor-pointer"
                          >
                            Switch to Admin to Review
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
