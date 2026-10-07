import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { RotateCcw, Database, CheckCircle2, AlertOctagon } from 'lucide-react';

type TableName =
  | 'users'
  | 'service_categories'
  | 'technician_profiles'
  | 'verification_documents'
  | 'bookings'
  | 'reviews';

const BUSINESS_RULES_REFERENCE = [
  {
    id: 'BR-01',
    rule: 'Each user must register with a unique email address.',
    entity: 'users',
    enforcement: 'UNIQUE (email)',
  },
  {
    id: 'BR-02',
    rule: "A user's role must be CLIENT, TECHNICIAN, or ADMIN.",
    entity: 'users',
    enforcement: "CHECK (role IN ('CLIENT', 'TECHNICIAN', 'ADMIN'))",
  },
  {
    id: 'BR-03',
    rule: 'A technician profile must not appear in the public directory unless verified.',
    entity: 'technician_profiles, verification_documents',
    enforcement: 'Application logic & foreign key validation (is_verified = TRUE)',
  },
  {
    id: 'BR-04',
    rule: 'A booking time slot must be set for a future date and time.',
    entity: 'bookings',
    enforcement: 'CHECK (scheduled_at > created_at)',
  },
  {
    id: 'BR-05',
    rule: "A booking's status must be PENDING, ACCEPTED, COMPLETED, or CANCELLED.",
    entity: 'bookings',
    enforcement: "CHECK (status IN ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'))",
  },
  {
    id: 'BR-06',
    rule: 'A client can only submit a review for a booking marked as COMPLETED.',
    entity: 'reviews, bookings',
    enforcement: 'Application logic & UNIQUE (booking_id) 1:1 FK',
  },
  {
    id: 'BR-07',
    rule: 'A rating score must be an integer between 1 and 5.',
    entity: 'reviews',
    enforcement: 'CHECK (rating BETWEEN 1 AND 5)',
  },
  {
    id: 'BR-08',
    rule: 'Each technician profile must link to exactly one valid user account.',
    entity: 'technician_profiles',
    enforcement: 'UNIQUE (user_id) & FK -> users(user_id) ON DELETE CASCADE',
  },
];

export const SchemaExplorerView: React.FC = () => {
  const {
    users,
    categories,
    technicianProfiles,
    verificationDocuments,
    bookings,
    reviews,
    auditLog,
    resetDatabaseToSeed,
  } = useDatabase();

  const [selectedTable, setSelectedTable] = useState<TableName>('users');
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);

  const tablesMeta: { name: TableName; count: number; pk: string; relation: string }[] = [
    { name: 'users', count: users.length, pk: 'user_id SERIAL PK', relation: '1:1 tech, 1:M bookings' },
    {
      name: 'service_categories',
      count: categories.length,
      pk: 'category_id SERIAL PK',
      relation: '1:M technician_profiles',
    },
    {
      name: 'technician_profiles',
      count: technicianProfiles.length,
      pk: 'profile_id SERIAL PK',
      relation: 'FK user_id (UNIQUE), FK category_id',
    },
    {
      name: 'verification_documents',
      count: verificationDocuments.length,
      pk: 'doc_id SERIAL PK',
      relation: 'FK profile_id (M:1)',
    },
    {
      name: 'bookings',
      count: bookings.length,
      pk: 'booking_id SERIAL PK',
      relation: 'FK client_id, FK technician_id',
    },
    {
      name: 'reviews',
      count: reviews.length,
      pk: 'review_id SERIAL PK',
      relation: 'FK booking_id (UNIQUE 1:1)',
    },
  ];

  const handleReset = () => {
    resetDatabaseToSeed();
    setResetConfirm(true);
    setTimeout(() => setResetConfirm(false), 3000);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <span>CSIT327 Information Management 2 · SDD Section 3.0 &amp; 4.0</span>
            <span>·</span>
            <span>Prepared By: Godinez, Henry James Molde</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#141413] mt-1">
            Normalized PostgreSQL Data Model &amp; Business Rules
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Inspect live rows across all 6 relational entities and verify real-time enforcement of
            Business Rules BR-01 through BR-08.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{resetConfirm ? 'Database Reset to Initial Seed!' : 'Reset Database to Seed'}</span>
        </button>
      </div>

      {/* Interactive Table Selector Tabs */}
      <section className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {tablesMeta.map((tb) => {
            const active = selectedTable === tb.name;
            return (
              <button
                key={tb.name}
                type="button"
                onClick={() => setSelectedTable(tb.name)}
                className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                    : 'bg-white text-[#141413] border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <Database className={`w-3.5 h-3.5 ${active ? 'text-amber-300' : 'text-[#1E3A2F]'}`} />
                  <span className="font-mono text-xs font-semibold tabular-nums">
                    {tb.count} rows
                  </span>
                </div>
                <div className="font-mono text-xs font-semibold mt-2 truncate">{tb.name}</div>
                <div
                  className={`font-mono text-[10px] mt-0.5 truncate ${
                    active ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  {tb.pk}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Relational Table Viewer */}
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#141413]">
              SELECT * FROM {selectedTable};
            </span>
            <span className="font-mono text-xs text-stone-500">
              PostgreSQL Normalized Entity (3NF)
            </span>
          </div>

          <div className="overflow-x-auto">
            {selectedTable === 'users' && (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/60 text-[11px] text-stone-500">
                    <th className="py-2.5 px-4">user_id (PK)</th>
                    <th className="py-2.5 px-4">email (UNIQUE, BR-01)</th>
                    <th className="py-2.5 px-4">full_name (NOT NULL)</th>
                    <th className="py-2.5 px-4">role (CHECK BR-02)</th>
                    <th className="py-2.5 px-4">password_hash</th>
                    <th className="py-2.5 px-4">created_at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-4 font-semibold tabular-nums">{u.user_id}</td>
                      <td className="py-2.5 px-4 text-[#1E3A2F]">{u.email}</td>
                      <td className="py-2.5 px-4 font-sans font-semibold">{u.full_name}</td>
                      <td className="py-2.5 px-4 font-semibold">{u.role}</td>
                      <td className="py-2.5 px-4 text-stone-400 truncate max-w-[160px]">
                        {u.password_hash}
                      </td>
                      <td className="py-2.5 px-4 text-stone-500 tabular-nums">{u.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'service_categories' && (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/60 text-[11px] text-stone-500">
                    <th className="py-2.5 px-4">category_id (PK)</th>
                    <th className="py-2.5 px-4">name (UNIQUE, NOT NULL)</th>
                    <th className="py-2.5 px-4">description (TEXT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {categories.map((c) => (
                    <tr key={c.category_id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-4 font-semibold tabular-nums">{c.category_id}</td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-[#141413]">
                        {c.name}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-stone-600">{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'technician_profiles' && (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/60 text-[11px] text-stone-500">
                    <th className="py-2.5 px-4">profile_id (PK)</th>
                    <th className="py-2.5 px-4">user_id (UNIQUE FK, BR-08)</th>
                    <th className="py-2.5 px-4">category_id (FK)</th>
                    <th className="py-2.5 px-4">barangay (VARCHAR)</th>
                    <th className="py-2.5 px-4">is_verified (BOOLEAN, BR-03)</th>
                    <th className="py-2.5 px-4 text-right">hourly_rate_php</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {technicianProfiles.map((tp) => (
                    <tr key={tp.profile_id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-4 font-semibold tabular-nums">{tp.profile_id}</td>
                      <td className="py-2.5 px-4 tabular-nums">{tp.user_id}</td>
                      <td className="py-2.5 px-4 tabular-nums">{tp.category_id}</td>
                      <td className="py-2.5 px-4 font-sans font-semibold">{tp.barangay}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={
                            tp.is_verified
                              ? 'text-emerald-700 font-semibold'
                              : 'text-amber-700 font-semibold'
                          }
                        >
                          {tp.is_verified ? 'TRUE' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        ₱{tp.hourly_rate_php}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'verification_documents' && (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/60 text-[11px] text-stone-500">
                    <th className="py-2.5 px-4">doc_id (PK)</th>
                    <th className="py-2.5 px-4">profile_id (FK)</th>
                    <th className="py-2.5 px-4">document_type (VARCHAR)</th>
                    <th className="py-2.5 px-4">reference_number</th>
                    <th className="py-2.5 px-4">status (CHECK)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {verificationDocuments.map((d) => (
                    <tr key={d.doc_id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-4 font-semibold tabular-nums">{d.doc_id}</td>
                      <td className="py-2.5 px-4 tabular-nums">{d.profile_id}</td>
                      <td className="py-2.5 px-4 font-sans font-semibold">{d.document_type}</td>
                      <td className="py-2.5 px-4 text-stone-600">{d.reference_number}</td>
                      <td className="py-2.5 px-4 font-semibold">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'bookings' && (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/60 text-[11px] text-stone-500">
                    <th className="py-2.5 px-4">booking_id (PK)</th>
                    <th className="py-2.5 px-4">client_id (FK)</th>
                    <th className="py-2.5 px-4">technician_id (FK)</th>
                    <th className="py-2.5 px-4">scheduled_at (BR-04)</th>
                    <th className="py-2.5 px-4">status (CHECK BR-05)</th>
                    <th className="py-2.5 px-4">barangay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {bookings.map((b) => (
                    <tr key={b.booking_id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-4 font-semibold tabular-nums">{b.booking_id}</td>
                      <td className="py-2.5 px-4 tabular-nums">{b.client_id}</td>
                      <td className="py-2.5 px-4 tabular-nums">{b.technician_id}</td>
                      <td className="py-2.5 px-4 tabular-nums text-stone-600">{b.scheduled_at}</td>
                      <td className="py-2.5 px-4 font-semibold">{b.status}</td>
                      <td className="py-2.5 px-4 font-sans">{b.barangay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'reviews' && (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/60 text-[11px] text-stone-500">
                    <th className="py-2.5 px-4">review_id (PK)</th>
                    <th className="py-2.5 px-4">booking_id (UNIQUE FK, BR-06)</th>
                    <th className="py-2.5 px-4">rating (CHECK 1..5, BR-07)</th>
                    <th className="py-2.5 px-4">comment (TEXT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {reviews.map((r) => (
                    <tr key={r.review_id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-4 font-semibold tabular-nums">{r.review_id}</td>
                      <td className="py-2.5 px-4 tabular-nums">{r.booking_id}</td>
                      <td className="py-2.5 px-4 font-semibold text-amber-700 tabular-nums">
                        {r.rating}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-stone-700">{r.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Business Rules & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 space-y-3">
          <h2 className="font-display text-xl font-semibold text-[#141413]">
            01. SDD Section 3.1 Business Rules Specification
          </h2>
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-mono text-stone-500">
                  <th className="py-3 px-4">Rule ID</th>
                  <th className="py-3 px-4">Business Rule Statement</th>
                  <th className="py-3 px-4">Enforcement Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {BUSINESS_RULES_REFERENCE.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80">
                    <td className="py-3 px-4 font-mono font-semibold text-[#1E3A2F] whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 text-[#141413]">
                      <div>{item.rule}</div>
                      <div className="font-mono text-[11px] text-stone-500 mt-0.5">
                        Entity: {item.entity}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-700">
                      {item.enforcement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-5 space-y-3">
          <h2 className="font-display text-xl font-semibold text-[#141413]">
            02. Live Constraint Execution Audit Log
          </h2>
          <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-200 max-h-[460px] overflow-y-auto">
            {auditLog.map((entry) => (
              <div key={entry.id} className="p-3.5 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2 font-mono">
                  <span className="font-semibold text-[#141413]">
                    {entry.rule_id} · {entry.entity}
                  </span>
                  {entry.outcome === 'ENFORCED' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ENFORCED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      BLOCKED
                    </span>
                  )}
                </div>
                <p className="text-stone-600 leading-snug">{entry.detail}</p>
                <div className="font-mono text-[10px] text-stone-400 tabular-nums">
                  {new Date(entry.timestamp).toLocaleString('en-PH')}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
