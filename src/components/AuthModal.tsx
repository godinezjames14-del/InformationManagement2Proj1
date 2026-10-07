import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { UserRole } from '../types/database';
import { CEBU_CITY_BARANGAYS } from '../data/seedData';
import { X, CheckCircle2, AlertCircle, ShieldCheck, Wrench, Home, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccessNavigate?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccessNavigate,
}) => {
  const { users, categories, currentUser, login, register, quickSwitchUser } = useDatabase();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState(currentUser?.email || 'godinezjames14@gmail.com');
  const [password, setPassword] = useState('cebu2026');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+63 917 ');
  const [role, setRole] = useState<UserRole>('CLIENT');

  // Technician registration fields (BR-08 & BR-03)
  const [categoryId, setCategoryId] = useState<number>(1);
  const [barangay, setBarangay] = useState<string>('Lahug');
  const [hourlyRate, setHourlyRate] = useState<number>(600);
  const [yearsExp, setYearsExp] = useState<number>(5);
  const [skillsInput, setSkillsInput] = useState<string>('Pipe Leak Repair, Pressure Tank Setup');
  const [bio, setBio] = useState<string>('');
  const [docType, setDocType] = useState<string>('TESDA NC II Trade Certificate');
  const [docRef, setDocRef] = useState<string>('TESDA-R07-2026-4410');

  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setFeedback({ type: 'error', text: res.message });
      return;
    }
    setFeedback({ type: 'success', text: res.message });
    const matched = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    setTimeout(() => {
      if (matched && onSuccessNavigate) {
        onSuccessNavigate(matched.role);
      }
      onClose();
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFeedback({ type: 'error', text: 'Full name is required (users.full_name NOT NULL).' });
      return;
    }
    const res = register({
      full_name: fullName,
      email,
      password,
      phone,
      role,
      category_id: categoryId,
      barangay,
      hourly_rate_php: hourlyRate,
      years_experience: yearsExp,
      skills: skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      bio,
      initial_doc_type: docType,
      initial_doc_ref: docRef,
      initial_doc_authority: 'TESDA Region VII / Cebu City Hall',
    });

    if (!res.ok) {
      setFeedback({ type: 'error', text: res.message });
      return;
    }

    setFeedback({ type: 'success', text: res.message });
    setTimeout(() => {
      if (onSuccessNavigate) {
        onSuccessNavigate(role);
      }
      onClose();
    }, 350);
  };

  const handleQuickSwitch = (userId: number) => {
    quickSwitchUser(userId);
    const target = users.find((u) => u.user_id === userId);
    if (target && onSuccessNavigate) {
      onSuccessNavigate(target.role);
    }
    onClose();
  };

  const demoPersonas = [
    {
      userId: 1,
      title: 'Homeowner (Client)',
      name: 'Henry James Molde Godinez',
      email: 'godinezjames14@gmail.com',
      role: 'CLIENT' as UserRole,
      note: 'Browse directory, schedule Cebu City visits, rate completed repairs',
    },
    {
      userId: 3,
      title: 'Verified Technician',
      name: 'Rodrigo "Noy Rod" Bacalso',
      email: 'rodrigo.bacalso@toolup.ph',
      role: 'TECHNICIAN' as UserRole,
      note: 'Master Plumber (Brgy. Lahug) · Manage job requests & credentials',
    },
    {
      userId: 7,
      title: 'Unverified Technician (BR-03 Demo)',
      name: 'Dante Magpale',
      email: 'dante.magpale@toolup.ph',
      role: 'TECHNICIAN' as UserRole,
      note: 'Appliance Tech (Brgy. Tisa) · Hidden from directory until Admin approves',
    },
    {
      userId: 8,
      title: 'Platform Administrator',
      name: 'Beatriz Osmeña',
      email: 'admin@toolup-cebu.ph',
      role: 'ADMIN' as UserRole,
      note: 'Approve TESDA licenses & barangay clearances (F-04)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 overflow-y-auto">
      <div className="bg-[#F8F7F4] border border-stone-300 rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-xl my-8">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <p className="text-xs font-mono text-stone-500">
              F-01 Authentication · Enforces BR-01 (UNIQUE email) &amp; BR-02 (Role CHECK)
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#141413] mt-1">
              {mode === 'login' ? 'Sign In or Switch Active Role' : 'Register New ToolUp Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-[#141413] rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Segmented Toggle */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-lg mt-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFeedback(null);
            }}
            className={`flex-1 py-2 px-4 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#141413] shadow-xs'
                : 'text-stone-600 hover:text-[#141413]'
            }`}
          >
            Sign In / Role Switcher
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setEmail('');
              setFeedback(null);
            }}
            className={`flex-1 py-2 px-4 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#141413] shadow-xs'
                : 'text-stone-600 hover:text-[#141413]'
            }`}
          >
            Register New User (BR-01 / BR-02)
          </button>
        </div>

        {feedback && (
          <div
            className={`mt-4 p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {mode === 'login' ? (
          <div className="mt-6 space-y-6">
            {/* Instant Role Switcher for Evaluators */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-stone-700">
                  Instant Demo Role Switcher (PostgreSQL Seeded Users)
                </span>
                <span className="text-xs text-stone-500">1-Click Session Switch</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoPersonas.map((p) => {
                  const isCurrent = currentUser?.user_id === p.userId;
                  return (
                    <button
                      key={p.userId}
                      type="button"
                      onClick={() => handleQuickSwitch(p.userId)}
                      className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#1E3A2F]/8 border-[#1E3A2F]'
                          : 'bg-white border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#141413]">{p.title}</span>
                        <span className="font-mono text-[11px] text-[#1E3A2F]">{p.role}</span>
                      </div>
                      <p className="text-xs font-semibold text-stone-800 mt-1">{p.name}</p>
                      <p className="text-[11px] font-mono text-stone-500 truncate">{p.email}</p>
                      <p className="text-[11px] text-stone-600 mt-1.5 leading-snug">{p.note}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Standard Email + Password Form */}
            <form onSubmit={handleLoginSubmit} className="pt-5 border-t border-stone-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                <KeyRound className="w-3.5 h-3.5 text-stone-500" />
                <span>Sign In with Email Credentials</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address (<span className="font-mono">users.email</span>)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="godinezjames14@gmail.com"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
                  />
                </div>
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
                  Authenticate Session
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-4">
            {/* Role selection enforcing BR-02 */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Select Account Role (<span className="font-mono">BR-02: CHECK role IN (&apos;CLIENT&apos;, &apos;TECHNICIAN&apos;, &apos;ADMIN&apos;)</span>)
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'CLIENT', label: 'Homeowner (CLIENT)', icon: Home },
                    { id: 'TECHNICIAN', label: 'Tradesman (TECHNICIAN)', icon: Wrench },
                    { id: 'ADMIN', label: 'Administrator (ADMIN)', icon: ShieldCheck },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id)}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                          : 'bg-white text-[#141413] border-stone-300 hover:border-stone-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${active ? 'text-amber-300' : 'text-[#1E3A2F]'}`} />
                      <div className="text-xs font-semibold leading-tight">{item.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name (<span className="font-mono">NOT NULL</span>)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Carlo Rama"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address (<span className="font-mono">BR-01 UNIQUE</span>)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlo.rama@cebu.ph"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Cebu Mobile Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63 917 555 0199"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password (<span className="font-mono">password_hash</span>)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#1E3A2F]"
                />
              </div>
            </div>

            {role === 'TECHNICIAN' && (
              <div className="p-4 bg-stone-100 border border-stone-200 rounded-lg space-y-3.5">
                <p className="text-xs font-semibold text-[#1E3A2F]">
                  Technician Profile Initialization (BR-08 1:1 Link &amp; BR-03 Verification Gate)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Trade Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg"
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
                      Cebu City Barangay
                    </label>
                    <select
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg"
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
                      Base Visit Rate (PHP)
                    </label>
                    <input
                      type="number"
                      min={250}
                      max={5000}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Initial Verification Document Type
                    </label>
                    <input
                      type="text"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      placeholder="TESDA NC II Certificate / Barangay Clearance"
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      License / Clearance Reference No.
                    </label>
                    <input
                      type="text"
                      value={docRef}
                      onChange={(e) => setDocRef(e.target.value)}
                      placeholder="BRGY-LAHUG-2026-8812"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Key Trade Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Years Experience
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={45}
                      value={yearsExp}
                      onChange={(e) => setYearsExp(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Professional Summary
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your trade background and Cebu City residential repair experience..."
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg"
                  />
                </div>
              </div>
            )}

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
                Create Account &amp; Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
