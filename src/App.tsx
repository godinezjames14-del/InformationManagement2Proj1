import React, { useState } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { DirectoryView } from './components/DirectoryView';
import { DashboardView } from './components/DashboardView';
import { VerificationView } from './components/VerificationView';
import { ReportsView } from './components/ReportsView';
import { SchemaExplorerView } from './components/SchemaExplorerView';
import { AuthModal } from './components/AuthModal';
import { BookingModal } from './components/BookingModal';
import { ReviewModal } from './components/ReviewModal';
import { TechnicianProfile, Booking, UserRole } from './types/database';

function ToolUpMarketplaceApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('directory');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [selectedTechForBooking, setSelectedTechForBooking] = useState<TechnicianProfile | null>(
    null
  );
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleRoleSwitchNavigation = (role: UserRole) => {
    if (role === 'ADMIN') {
      setActiveTab('verification');
    } else if (role === 'TECHNICIAN') {
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#141413]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={handleOpenAuthModal}
      />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-8 py-8">
        {activeTab === 'directory' && (
          <DirectoryView
            onSelectBookTechnician={(tech) => setSelectedTechForBooking(tech)}
            onOpenAuthModal={handleOpenAuthModal}
            onNavigateToVerification={() => setActiveTab('verification')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenReviewModal={(booking) => setSelectedBookingForReview(booking)}
            onOpenAuthModal={handleOpenAuthModal}
            onNavigateToDirectory={() => setActiveTab('directory')}
            onNavigateToVerification={() => setActiveTab('verification')}
          />
        )}

        {activeTab === 'verification' && (
          <VerificationView onOpenAuthModal={handleOpenAuthModal} />
        )}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'schema' && <SchemaExplorerView />}
      </main>

      <footer className="border-t border-stone-200 bg-[#F8F7F4] mt-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <span className="font-display font-semibold text-[#141413]">ToolUp</span>
            <span className="mx-2">·</span>
            <span>Cebu City On-Demand Household Repair Marketplace</span>
            <span className="mx-2">·</span>
            <span>CSIT327 Information Management 2 (Godinez, Henry James Molde)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className="hover:text-[#141413] transition-colors cursor-pointer"
            >
              Service Directory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className="hover:text-[#141413] transition-colors cursor-pointer"
            >
              Admin Verification
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schema')}
              className="hover:text-[#141413] transition-colors cursor-pointer"
            >
              Data Dictionary
            </button>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccessNavigate={handleRoleSwitchNavigation}
      />

      <BookingModal
        technician={selectedTechForBooking}
        onClose={() => setSelectedTechForBooking(null)}
        onBookedSuccess={() => setActiveTab('dashboard')}
      />

      <ReviewModal
        booking={selectedBookingForReview}
        onClose={() => setSelectedBookingForReview(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <ToolUpMarketplaceApp />
    </DatabaseProvider>
  );
}
