import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Download, Star } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { categories, technicianProfiles, bookings, reviews, users } = useDatabase();

  const categorySummary = categories.map((cat) => {
    const catProfiles = technicianProfiles.filter((p) => p.category_id === cat.category_id);
    const verifiedCount = catProfiles.filter((p) => p.is_verified).length;
    const profileIds = new Set(catProfiles.map((p) => p.profile_id));

    const catBookings = bookings.filter((b) => profileIds.has(b.technician_id));
    const completedBookings = catBookings.filter((b) => b.status === 'COMPLETED');
    const completedIds = new Set(completedBookings.map((b) => b.booking_id));

    const catReviews = reviews.filter((r) => completedIds.has(r.booking_id));
    const avgRating =
      catReviews.length > 0
        ? (catReviews.reduce((sum, r) => sum + r.rating, 0) / catReviews.length).toFixed(2)
        : '—';

    const totalCompletedValue = completedBookings.reduce(
      (sum, b) => sum + b.estimated_fee_php,
      0
    );

    return {
      category_id: cat.category_id,
      name: cat.name,
      totalTechnicians: catProfiles.length,
      verifiedTechnicians: verifiedCount,
      totalBookings: catBookings.length,
      completedCount: completedBookings.length,
      avgRating,
      totalCompletedValue,
    };
  });

  const technicianLeaderboard = technicianProfiles.map((profile) => {
    const techUser = users.find((u) => u.user_id === profile.user_id);
    const category = categories.find((c) => c.category_id === profile.category_id);
    const techBookings = bookings.filter((b) => b.technician_id === profile.profile_id);
    const completed = techBookings.filter((b) => b.status === 'COMPLETED');
    const completedIds = new Set(completed.map((b) => b.booking_id));
    const techReviews = reviews.filter((r) => completedIds.has(r.booking_id));
    const avgScore =
      techReviews.length > 0
        ? (techReviews.reduce((s, r) => s + r.rating, 0) / techReviews.length).toFixed(1)
        : '—';

    return {
      profile_id: profile.profile_id,
      fullName: techUser?.full_name || 'Unknown',
      categoryName: category?.name || 'Unknown',
      barangay: profile.barangay,
      isVerified: profile.is_verified,
      hourlyRate: profile.hourly_rate_php,
      totalBookings: techBookings.length,
      completedJobs: completed.length,
      avgScore,
      reviewCount: techReviews.length,
    };
  });

  const barangayMap = new Map<
    string,
    { barangay: string; totalRequests: number; completed: number; totalVolumePhp: number }
  >();
  bookings.forEach((b) => {
    const existing = barangayMap.get(b.barangay) || {
      barangay: b.barangay,
      totalRequests: 0,
      completed: 0,
      totalVolumePhp: 0,
    };
    existing.totalRequests += 1;
    if (b.status === 'COMPLETED') {
      existing.completed += 1;
    }
    existing.totalVolumePhp += b.estimated_fee_php;
    barangayMap.set(b.barangay, existing);
  });
  const barangaySummary = Array.from(barangayMap.values()).sort(
    (a, b) => b.totalRequests - a.totalRequests
  );

  const handleExportCsv = () => {
    const headers = [
      'Category ID',
      'Trade Category',
      'Total Technicians',
      'Verified Technicians',
      'Total Bookings',
      'Completed Visits',
      'Average Rating',
      'Settled Volume (PHP)',
    ];
    const rows = categorySummary.map((r) => [
      r.category_id,
      `"${r.name}"`,
      r.totalTechnicians,
      r.verifiedTechnicians,
      r.totalBookings,
      r.completedCount,
      r.avgRating,
      r.totalCompletedValue,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'toolup_cebu_service_summary_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <span>SDD Section 2.1 Multi-Table Summary Report</span>
            <span>·</span>
            <span>Joined: service_categories ⋈ technician_profiles ⋈ users ⋈ bookings ⋈ reviews</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#141413] mt-1">
            Cebu City Service Summary Report
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Relational aggregation across trade categories, barangay service demand, and verified technician performance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Joined Report CSV</span>
        </button>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#141413]">
            01. Trade Category Performance Matrix
          </h2>
          <p className="text-xs font-mono text-stone-500 mt-0.5">
            SELECT c.category_id, c.name, COUNT(DISTINCT tp.profile_id), COUNT(b.booking_id),
            AVG(r.rating) FROM service_categories c LEFT JOIN technician_profiles tp ...
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-mono text-stone-500">
                  <th className="py-3 px-4">category_id</th>
                  <th className="py-3 px-4">Trade Category</th>
                  <th className="py-3 px-4 text-right">Verified / Total Techs</th>
                  <th className="py-3 px-4 text-right">Total Bookings</th>
                  <th className="py-3 px-4 text-right">Completed Visits</th>
                  <th className="py-3 px-4 text-right">Avg Rating (BR-07)</th>
                  <th className="py-3 px-4 text-right">Completed Repair Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {categorySummary.map((row) => (
                  <tr key={row.category_id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#141413] tabular-nums">
                      #{row.category_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#141413]">{row.name}</td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums text-stone-700">
                      {row.verifiedTechnicians} / {row.totalTechnicians}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums text-[#141413] font-semibold">
                      {row.totalBookings}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums text-emerald-700 font-semibold">
                      {row.completedCount}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums text-amber-700 font-semibold">
                      {row.avgRating !== '—' ? `★ ${row.avgRating}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums font-semibold text-[#141413]">
                      ₱{row.totalCompletedValue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 space-y-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#141413]">
              02. Joined Technician Directory &amp; Review Ledger
            </h2>
            <p className="text-xs font-mono text-stone-500 mt-0.5">
              users ⋈ technician_profiles ⋈ service_categories ⋈ bookings ⋈ reviews
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-mono text-stone-500">
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-4">Category &amp; Barangay</th>
                    <th className="py-3 px-4">Directory Status</th>
                    <th className="py-3 px-4 text-right">Done / Total</th>
                    <th className="py-3 px-4 text-right">Client Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {technicianLeaderboard.map((t) => (
                    <tr key={t.profile_id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#141413]">{t.fullName}</div>
                        <div className="font-mono text-[11px] text-stone-500">
                          profile_id: #{t.profile_id} · ₱{t.hourlyRate}/visit
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#141413]">{t.categoryName}</div>
                        <div className="text-stone-500">Brgy. {t.barangay}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {t.isVerified ? (
                          <span className="text-emerald-700 font-semibold">VERIFIED</span>
                        ) : (
                          <span className="text-amber-700 font-semibold">UNVERIFIED (Hidden)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-right tabular-nums">
                        {t.completedJobs} / {t.totalBookings}
                      </td>
                      <td className="py-3 px-4 font-mono text-right tabular-nums font-semibold">
                        {t.avgScore !== '—' ? (
                          <span className="inline-flex items-center gap-1 text-[#141413]">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {t.avgScore} ({t.reviewCount})
                          </span>
                        ) : (
                          <span className="text-stone-400">No reviews</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="lg:col-span-4 space-y-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#141413]">
              03. Demand by Barangay
            </h2>
            <p className="text-xs font-mono text-stone-500 mt-0.5">
              GROUP BY bookings.barangay (Cebu City)
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-mono text-stone-500">
                  <th className="py-3 px-4">Barangay</th>
                  <th className="py-3 px-4 text-right">Bookings</th>
                  <th className="py-3 px-4 text-right">Est. Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {barangaySummary.map((b) => (
                  <tr key={b.barangay} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#141413]">
                      Brgy. {b.barangay}
                    </td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums">
                      {b.completed} / {b.totalRequests}
                    </td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums font-semibold text-[#1E3A2F]">
                      ₱{b.totalVolumePhp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
