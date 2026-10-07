import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { TechnicianProfile } from '../types/database';
import { CEBU_CITY_BARANGAYS } from '../data/seedData';
import { Search, Star, Calendar, ShieldCheck, SlidersHorizontal, Wrench, CheckCircle2 } from 'lucide-react';

interface DirectoryViewProps {
  onSelectBookTechnician: (tech: TechnicianProfile) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onNavigateToVerification: () => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  onSelectBookTechnician,
  onOpenAuthModal,
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
  } = useDatabase();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');
  const [selectedBarangay, setSelectedBarangay] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // BR-03 Enforcement: Only technician profiles with is_verified = true appear in the public directory
  const verifiedProfiles = useMemo(
    () => technicianProfiles.filter((p) => p.is_verified),
    [technicianProfiles]
  );

  const unverifiedCount = useMemo(
    () => technicianProfiles.filter((p) => !p.is_verified).length,
    [technicianProfiles]
  );

  const filteredProfiles = useMemo(() => {
    return verifiedProfiles.filter((profile) => {
      if (selectedCategoryId !== 'ALL' && profile.category_id !== selectedCategoryId) {
        return false;
      }
      if (selectedBarangay !== 'ALL' && profile.barangay !== selectedBarangay) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const techUser = users.find((u) => u.user_id === profile.user_id);
        const cat = categories.find((c) => c.category_id === profile.category_id);
        const matchesName = techUser?.full_name.toLowerCase().includes(q);
        const matchesBarangay = profile.barangay.toLowerCase().includes(q);
        const matchesCat = cat?.name.toLowerCase().includes(q);
        const matchesSkills = profile.skills.some((s) => s.toLowerCase().includes(q));
        return Boolean(matchesName || matchesBarangay || matchesCat || matchesSkills);
      }
      return true;
    });
  }, [verifiedProfiles, selectedCategoryId, selectedBarangay, searchQuery, users, categories]);

  const getTechnicianStats = (profileId: number) => {
    const techBookings = bookings.filter(
      (b) => b.technician_id === profileId && b.status === 'COMPLETED'
    );
    const completedBookingIds = new Set(techBookings.map((b) => b.booking_id));
    const techReviews = reviews.filter((r) => completedBookingIds.has(r.booking_id));
    const avgRating =
      techReviews.length > 0
        ? (techReviews.reduce((sum, r) => sum + r.rating, 0) / techReviews.length).toFixed(1)
        : null;
    const latestReview = techReviews[0] || null;
    const approvedDocs = verificationDocuments.filter(
      (d) => d.profile_id === profileId && d.status === 'APPROVED'
    );

    return {
      completedCount: techBookings.length,
      reviewCount: techReviews.length,
      avgRating,
      latestReview,
      approvedDocs,
    };
  };

  const handleBookClick = (profile: TechnicianProfile) => {
    if (!currentUser) {
      onOpenAuthModal('login');
      return;
    }
    onSelectBookTechnician(profile);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span>Cebu City Residential Repair Network</span>
            <span aria-hidden="true">·</span>
            <span>TESDA &amp; Barangay Clearance Verified</span>
            <span aria-hidden="true">·</span>
            <span>Direct External Settlement</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#141413] tracking-tight leading-[1.15] max-w-2xl">
            Verified Cebuano tradesmen for household repairs, booked on demand.
          </h1>

          <p className="text-base text-stone-700 leading-relaxed max-w-[65ch]">
            ToolUp connects homeowners across Cebu City barangays with credentialed local plumbers,
            master electricians, HVAC technicians, and carpenters. Every listed professional passes
            manual license and barangay clearance verification before public directory activation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#directory-grid"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap"
            >
              Browse Verified Directory
            </a>
            {!currentUser ? (
              <button
                type="button"
                onClick={() => onOpenAuthModal('register')}
                className="px-4 py-2.5 text-xs font-semibold text-[#141413] bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Register as Homeowner or Technician
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="px-4 py-2.5 text-xs font-semibold text-[#141413] bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Switch Active Role ({currentUser.role})
              </button>
            )}
          </div>

          {/* Quantitative Proof Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-5 border-t border-stone-200 max-w-xl">
            <div>
              <div className="font-mono text-xl font-semibold text-[#141413] tabular-nums">
                100% Verified
              </div>
              <div className="text-xs text-stone-600 mt-0.5">
                TESDA &amp; Clearance audited (BR-03)
              </div>
            </div>
            <div>
              <div className="font-mono text-xl font-semibold text-[#141413] tabular-nums">
                14 Barangays
              </div>
              <div className="text-xs text-stone-600 mt-0.5">
                Cebu City municipal service limits
              </div>
            </div>
            <div>
              <div className="font-mono text-xl font-semibold text-[#141413] tabular-nums">
                ₱450 – ₱1,200
              </div>
              <div className="text-xs text-stone-600 mt-0.5">
                Standardized upfront visit rates
              </div>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="lg:col-span-5">
          <div className="relative rounded-xl overflow-hidden border border-stone-300 bg-[#1E3A2F] text-white p-7 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-amber-300">
                  Featured Cebu Network
                </span>
                <span className="text-xs font-mono text-stone-300">CSIT327 Capstone Architecture</span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-white leading-tight">
                Verified Local Hands. Guaranteed Cebu City Coverage.
              </h2>
              <p className="text-xs leading-relaxed text-stone-200">
                &ldquo;Before ToolUp, finding an emergency plumber in Lahug meant risking unverified
                neighborhood repairmen. Booking Noy Rod took two minutes, and his TESDA NC II license was
                already vetted.&rdquo;
              </p>
              <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs text-stone-200">
                <div>
                  <div className="font-semibold text-white">Henry James Molde Godinez</div>
                  <div className="text-[11px] text-stone-300">Homeowner, Brgy. Lahug, Cebu City</div>
                </div>
                <div className="font-mono text-amber-300 font-semibold text-sm">★ 5.0 / 5.0</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorized Service Directory Section (F-02) */}
      <section id="directory-grid" className="space-y-6 pt-4 border-t border-stone-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#141413]">
              01. Categorized Service Directory
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Filter verified Cebu City tradesmen by repair specialty and barangay coverage.
            </p>
          </div>

          {/* BR-03 Live Enforcement Status Notice */}
          <div className="flex items-center gap-3 text-xs text-stone-700 bg-white border border-stone-200 px-3.5 py-2 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-[#1E3A2F] shrink-0" />
            <span>
              <strong>BR-03 Active:</strong> Showing{' '}
              <span className="font-mono font-semibold tabular-nums">{verifiedProfiles.length}</span>{' '}
              verified profiles ({unverifiedCount} unverified profile hidden).
            </span>
            <button
              type="button"
              onClick={onNavigateToVerification}
              className="font-semibold text-[#1E3A2F] underline hover:text-[#141413] whitespace-nowrap cursor-pointer"
            >
              Inspect Queue
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategoryId === 'ALL'
                    ? 'bg-[#1E3A2F] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Trades ({verifiedProfiles.length})
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategoryId === cat.category_id;
                return (
                  <button
                    key={cat.category_id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.category_id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#1E3A2F] text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-lg px-3 py-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <label htmlFor="barangay-filter" className="text-xs text-stone-600 whitespace-nowrap">
                  Barangay:
                </label>
                <select
                  id="barangay-filter"
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                  className="text-xs font-semibold text-[#141413] bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Cebu City</option>
                  {CEBU_CITY_BARANGAYS.map((b) => (
                    <option key={b} value={b}>
                      Brgy. {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search technician, skill..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#1E3A2F]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Directory Listing Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-3">
            <p className="text-base font-semibold text-[#141413]">
              No verified technicians match your current filter criteria.
            </p>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              Under Business Rule BR-03, technicians awaiting license or barangay clearance approval
              do not appear in the public directory.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId('ALL');
                setSelectedBarangay('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A2F] rounded-lg hover:bg-[#162B22] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProfiles.map((profile) => {
              const techUser = users.find((u) => u.user_id === profile.user_id);
              const category = categories.find((c) => c.category_id === profile.category_id);
              const stats = getTechnicianStats(profile.profile_id);

              return (
                <article
                  key={profile.profile_id}
                  className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div
                          style={{ backgroundColor: profile.avatar_color }}
                          className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center text-white font-mono font-semibold text-base shadow-xs"
                        >
                          {profile.avatar_initials}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                            <span className="font-semibold text-[#1E3A2F]">{category?.name}</span>
                            <span aria-hidden="true">·</span>
                            <span>Brgy. {profile.barangay}, Cebu City</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {profile.years_experience} yrs exp
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-[#141413] mt-0.5">
                            {techUser?.full_name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-1">
                            {stats.avgRating ? (
                              <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#141413] tabular-nums">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                {stats.avgRating} ({stats.reviewCount}{' '}
                                {stats.reviewCount === 1 ? 'review' : 'reviews'})
                              </span>
                            ) : (
                              <span>Newly Verified Professional</span>
                            )}
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {stats.completedCount} completed visits
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-base font-semibold text-[#141413] tabular-nums">
                          ₱{profile.hourly_rate_php.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-stone-500">per service visit</div>
                      </div>
                    </div>

                    <p className="text-sm text-stone-700 leading-relaxed">{profile.bio}</p>

                    <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs">
                      <div className="text-stone-600">
                        <span className="font-semibold text-[#141413]">Specialties: </span>
                        {profile.skills.join(' · ')}
                      </div>
                      <div className="text-stone-600">
                        <span className="font-semibold text-emerald-800">
                          Approved Credentials:{' '}
                        </span>
                        {stats.approvedDocs.length > 0
                          ? stats.approvedDocs
                              .map((d) => `${d.document_type} (${d.reference_number})`)
                              .join(' · ')
                          : 'Verified by Platform Administrator'}
                      </div>
                    </div>

                    {stats.latestReview && (
                      <div className="p-3 bg-stone-50 border-l-2 border-[#1E3A2F] text-xs text-stone-600 italic">
                        &ldquo;{stats.latestReview.comment}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-4">
                    <div className="text-xs font-mono text-stone-500 tabular-nums">
                      profile_id: #{profile.profile_id} · Verified
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBookClick(profile)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Service Visit</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
