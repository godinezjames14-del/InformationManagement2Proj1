import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { LogOut, UserCheck } from 'lucide-react';

export type ActiveTab = 'directory' | 'dashboard' | 'verification' | 'reports' | 'schema';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuthModal: (defaultMode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
}) => {
  const { currentUser, logout, verificationDocuments } = useDatabase();

  const pendingDocsCount = verificationDocuments.filter((d) => d.status === 'PENDING').length;

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'directory', label: 'Service Directory' },
    {
      id: 'dashboard',
      label:
        currentUser?.role === 'TECHNICIAN'
          ? 'Technician Queue'
          : currentUser?.role === 'ADMIN'
          ? 'Bookings Overview'
          : 'My Bookings',
    },
    {
      id: 'verification',
      label:
        pendingDocsCount > 0 && currentUser?.role === 'ADMIN'
          ? `Admin Verification (${pendingDocsCount})`
          : 'Verification Module',
    },
    { id: 'reports', label: 'Service Report' },
    { id: 'schema', label: 'PostgreSQL Model' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#directory"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('directory');
          }}
          className="font-display text-xl font-semibold tracking-tight text-[#141413] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A2F]"
        >
          ToolUp
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#1E3A2F] text-[#141413] font-semibold'
                    : 'border-transparent text-stone-600 hover:text-[#141413] hover:border-stone-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#141413] bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors whitespace-nowrap cursor-pointer"
                title="Switch active user or role"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#1E3A2F] shrink-0" />
                <span className="truncate max-w-[160px]">{currentUser.full_name}</span>
                <span className="text-stone-400">·</span>
                <span className="font-mono text-[11px] text-[#1E3A2F]">{currentUser.role}</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-red-700 hover:bg-stone-200/60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-2 text-xs font-semibold text-[#141413] hover:bg-stone-200/60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Register Account
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile horizontal navigation bar */}
      <div className="flex lg:hidden items-center gap-4 px-4 py-2 overflow-x-auto border-t border-stone-200/80 bg-[#F8F7F4] text-xs">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#1E3A2F] text-[#141413] font-semibold'
                  : 'border-transparent text-stone-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
