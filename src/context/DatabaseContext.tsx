import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  ServiceCategory,
  TechnicianProfile,
  VerificationDocument,
  VerificationStatus,
  Booking,
  BookingStatus,
  Review,
  BusinessRuleAuditEntry,
} from '../types/database';
import {
  INITIAL_USERS,
  INITIAL_SERVICE_CATEGORIES,
  INITIAL_TECHNICIAN_PROFILES,
  INITIAL_VERIFICATION_DOCUMENTS,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_AUDIT_LOG,
} from '../data/seedData';

interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  category_id?: number;
  barangay?: string;
  hourly_rate_php?: number;
  skills?: string[];
  bio?: string;
  years_experience?: number;
  initial_doc_type?: string;
  initial_doc_ref?: string;
  initial_doc_authority?: string;
}

interface CreateBookingPayload {
  technician_id: number;
  scheduled_at: string;
  barangay: string;
  street_address: string;
  issue_description: string;
  settlement_method: 'Cash on Completion' | 'GCash (External)' | 'Maya (External)';
  estimated_fee_php: number;
}

interface CreateReviewPayload {
  booking_id: number;
  rating: number;
  comment: string;
}

interface UpdateTechnicianProfilePayload {
  profile_id: number;
  category_id: number;
  barangay: string;
  hourly_rate_php: number;
  skills: string[];
  bio: string;
  years_experience: number;
}

interface UploadVerificationDocPayload {
  profile_id: number;
  document_type: string;
  reference_number: string;
  issuing_authority: string;
}

interface DatabaseContextType {
  users: User[];
  categories: ServiceCategory[];
  technicianProfiles: TechnicianProfile[];
  verificationDocuments: VerificationDocument[];
  bookings: Booking[];
  reviews: Review[];
  auditLog: BusinessRuleAuditEntry[];
  currentUser: User | null;
  login: (email: string, password?: string) => { ok: boolean; message: string };
  quickSwitchUser: (userId: number) => void;
  logout: () => void;
  register: (payload: RegisterPayload) => { ok: boolean; message: string };
  createBooking: (payload: CreateBookingPayload) => { ok: boolean; message: string; booking?: Booking };
  updateBookingStatus: (bookingId: number, status: BookingStatus) => { ok: boolean; message: string };
  submitReview: (payload: CreateReviewPayload) => { ok: boolean; message: string };
  reviewVerificationDocument: (docId: number, status: VerificationStatus) => { ok: boolean; message: string };
  setTechnicianVerified: (profileId: number, isVerified: boolean) => { ok: boolean; message: string };
  updateTechnicianProfile: (payload: UpdateTechnicianProfilePayload) => { ok: boolean; message: string };
  uploadVerificationDocument: (payload: UploadVerificationDocPayload) => { ok: boolean; message: string };
  resetDatabaseToSeed: () => void;
}

const STORAGE_KEY = 'toolup_webflow_relational_db_v2';
const SESSION_KEY = 'toolup_webflow_session_user_id_v2';

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).users || INITIAL_USERS;
    } catch {
      // ignore storage error
    }
    return INITIAL_USERS;
  });

  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).categories || INITIAL_SERVICE_CATEGORIES;
    } catch {
      // ignore
    }
    return INITIAL_SERVICE_CATEGORIES;
  });

  const [technicianProfiles, setTechnicianProfiles] = useState<TechnicianProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).technicianProfiles || INITIAL_TECHNICIAN_PROFILES;
    } catch {
      // ignore
    }
    return INITIAL_TECHNICIAN_PROFILES;
  });

  const [verificationDocuments, setVerificationDocuments] = useState<VerificationDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).verificationDocuments || INITIAL_VERIFICATION_DOCUMENTS;
    } catch {
      // ignore
    }
    return INITIAL_VERIFICATION_DOCUMENTS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).bookings || INITIAL_BOOKINGS;
    } catch {
      // ignore
    }
    return INITIAL_BOOKINGS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).reviews || INITIAL_REVIEWS;
    } catch {
      // ignore
    }
    return INITIAL_REVIEWS;
  });

  const [auditLog, setAuditLog] = useState<BusinessRuleAuditEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).auditLog || INITIAL_AUDIT_LOG;
    } catch {
      // ignore
    }
    return INITIAL_AUDIT_LOG;
  });

  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession !== null) {
        return savedSession === 'null' ? null : Number(savedSession);
      }
    } catch {
      // ignore
    }
    return 1; // Default signed in as Henry James Molde Godinez
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users,
          categories,
          technicianProfiles,
          verificationDocuments,
          bookings,
          reviews,
          auditLog,
        })
      );
    } catch {
      // ignore
    }
  }, [users, categories, technicianProfiles, verificationDocuments, bookings, reviews, auditLog]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSION_KEY, currentUserId === null ? 'null' : String(currentUserId));
    } catch {
      // ignore
    }
  }, [currentUserId]);

  const appendAudit = (
    rule_id: BusinessRuleAuditEntry['rule_id'],
    entity: string,
    outcome: BusinessRuleAuditEntry['outcome'],
    detail: string
  ) => {
    const newEntry: BusinessRuleAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      rule_id,
      entity,
      outcome,
      detail,
    };
    setAuditLog((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  const currentUser = users.find((u) => u.user_id === currentUserId) || null;

  const login = (email: string, _password?: string): { ok: boolean; message: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!found) {
      return {
        ok: false,
        message: `No registered account found for "${email}". Use a demo persona or register a new profile.`,
      };
    }
    setCurrentUserId(found.user_id);
    return {
      ok: true,
      message: `Authenticated as ${found.full_name} (${found.role}).`,
    };
  };

  const quickSwitchUser = (userId: number) => {
    const found = users.find((u) => u.user_id === userId);
    if (found) {
      setCurrentUserId(found.user_id);
    }
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const register = (payload: RegisterPayload): { ok: boolean; message: string } => {
    const cleanEmail = payload.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { ok: false, message: 'Please provide a valid email address.' };
    }

    // BR-01: Each user must register with a unique email address. UNIQUE (email)
    const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      appendAudit(
        'BR-01',
        'users',
        'BLOCKED_VIOLATION',
        `Rejected duplicate registration for email "${cleanEmail}" — violates UNIQUE(email) constraint.`
      );
      return {
        ok: false,
        message: 'BR-01 Constraint Violation: Email address is already registered (UNIQUE (email)).',
      };
    }

    // BR-02: A user's role must be CLIENT, TECHNICIAN, or ADMIN.
    const validRoles: UserRole[] = ['CLIENT', 'TECHNICIAN', 'ADMIN'];
    if (!validRoles.includes(payload.role)) {
      appendAudit(
        'BR-02',
        'users',
        'BLOCKED_VIOLATION',
        `Rejected invalid role "${payload.role}" — violates CHECK (role IN ('CLIENT', 'TECHNICIAN', 'ADMIN')).`
      );
      return {
        ok: false,
        message: "BR-02 Constraint Violation: Role must be 'CLIENT', 'TECHNICIAN', or 'ADMIN'.",
      };
    }

    const nextUserId = users.reduce((max, u) => Math.max(max, u.user_id), 0) + 1;
    const nowIso = new Date().toISOString();
    const newUser: User = {
      user_id: nextUserId,
      email: cleanEmail,
      password_hash: `pbkdf2_sha256$cebu2026$${btoa(payload.password || 'default').slice(0, 12)}`,
      full_name: payload.full_name.trim(),
      role: payload.role,
      phone: payload.phone.trim() || '+63 917 000 0000',
      created_at: nowIso,
    };

    setUsers((prev) => [...prev, newUser]);
    appendAudit(
      'BR-01',
      'users',
      'ENFORCED',
      `Inserted user_id=${nextUserId} (${cleanEmail}) with verified UNIQUE(email) and CHECK(role='${payload.role}').`
    );

    if (payload.role === 'TECHNICIAN') {
      const nextProfileId = technicianProfiles.reduce((max, p) => Math.max(max, p.profile_id), 100) + 1;
      const initials = payload.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const newProfile: TechnicianProfile = {
        profile_id: nextProfileId,
        user_id: nextUserId,
        category_id: payload.category_id || 1,
        barangay: payload.barangay || 'Lahug',
        is_verified: false, // BR-03: Gated until Admin approval
        hourly_rate_php: payload.hourly_rate_php || 550,
        skills: payload.skills && payload.skills.length > 0 ? payload.skills : ['General Residential Repair', 'Safety Inspection'],
        bio:
          payload.bio ||
          `Local Cebu City tradesman based in Brgy. ${payload.barangay || 'Lahug'}. Credentials submitted for administrative verification.`,
        years_experience: payload.years_experience ?? 3,
        avatar_initials: initials || 'TC',
        avatar_color: '#1E3A2F',
      };
      setTechnicianProfiles((prev) => [...prev, newProfile]);
      appendAudit(
        'BR-08',
        'technician_profiles',
        'ENFORCED',
        `Created technician_profile profile_id=${nextProfileId} linked 1:1 with user_id=${nextUserId} (is_verified=FALSE per BR-03).`
      );

      if (payload.initial_doc_type && payload.initial_doc_ref) {
        const nextDocId = verificationDocuments.reduce((max, d) => Math.max(max, d.doc_id), 500) + 1;
        const newDoc: VerificationDocument = {
          doc_id: nextDocId,
          profile_id: nextProfileId,
          document_type: payload.initial_doc_type,
          reference_number: payload.initial_doc_ref,
          issuing_authority: payload.initial_doc_authority || 'Cebu City / TESDA Region VII',
          submitted_at: nowIso,
          status: 'PENDING',
        };
        setVerificationDocuments((prev) => [...prev, newDoc]);
      }
    }

    setCurrentUserId(nextUserId);
    return {
      ok: true,
      message: `Account registered as ${payload.role}.`,
    };
  };

  const createBooking = (
    payload: CreateBookingPayload
  ): { ok: boolean; message: string; booking?: Booking } => {
    if (!currentUser) {
      return { ok: false, message: 'Please sign in as a Client to book a service visit.' };
    }

    const tech = technicianProfiles.find((t) => t.profile_id === payload.technician_id);
    if (!tech) {
      return { ok: false, message: 'Technician profile not found.' };
    }

    if (!tech.is_verified) {
      appendAudit(
        'BR-03',
        'technician_profiles, bookings',
        'BLOCKED_VIOLATION',
        `Blocked booking attempt for unverified technician profile_id=${tech.profile_id}.`
      );
      return {
        ok: false,
        message: 'BR-03 Constraint Violation: Cannot book an unverified technician profile.',
      };
    }

    const now = new Date();
    const scheduledDate = new Date(payload.scheduled_at);

    // BR-04: A booking time slot must be set for a future date and time. CHECK (scheduled_at > created_at)
    if (isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= now.getTime()) {
      appendAudit(
        'BR-04',
        'bookings',
        'BLOCKED_VIOLATION',
        `Rejected booking where scheduled_at (${payload.scheduled_at}) <= created_at (${now.toISOString()}).`
      );
      return {
        ok: false,
        message:
          'BR-04 Constraint Violation: Booking time slot must be set for a future date and time (CHECK scheduled_at > created_at).',
      };
    }

    const nextBookingId = bookings.reduce((max, b) => Math.max(max, b.booking_id), 1000) + 1;
    const newBooking: Booking = {
      booking_id: nextBookingId,
      client_id: currentUser.user_id,
      technician_id: payload.technician_id,
      scheduled_at: scheduledDate.toISOString(),
      created_at: now.toISOString(),
      status: 'PENDING',
      barangay: payload.barangay,
      street_address: payload.street_address.trim(),
      issue_description: payload.issue_description.trim(),
      settlement_method: payload.settlement_method,
      estimated_fee_php: payload.estimated_fee_php,
    };

    setBookings((prev) => [newBooking, ...prev]);
    appendAudit(
      'BR-04',
      'bookings',
      'ENFORCED',
      `Inserted booking_id=${nextBookingId} with scheduled_at > created_at and status='PENDING' (BR-05).`
    );

    return {
      ok: true,
      message: `Booking #${nextBookingId} requested for ${scheduledDate.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}.`,
      booking: newBooking,
    };
  };

  const updateBookingStatus = (bookingId: number, status: BookingStatus): { ok: boolean; message: string } => {
    const validStatuses: BookingStatus[] = ['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      appendAudit(
        'BR-05',
        'bookings',
        'BLOCKED_VIOLATION',
        `Rejected invalid booking status "${status}" on booking_id=${bookingId}.`
      );
      return {
        ok: false,
        message: 'BR-05 Constraint Violation: Invalid booking status.',
      };
    }

    setBookings((prev) =>
      prev.map((b) => (b.booking_id === bookingId ? { ...b, status } : b))
    );

    appendAudit(
      'BR-05',
      'bookings',
      'ENFORCED',
      `Updated booking_id=${bookingId} status to '${status}' per CHECK (status IN ('PENDING','ACCEPTED','COMPLETED','CANCELLED')).`
    );

    return {
      ok: true,
      message: `Booking #${bookingId} marked as ${status}.`,
    };
  };

  const submitReview = (payload: CreateReviewPayload): { ok: boolean; message: string } => {
    const targetBooking = bookings.find((b) => b.booking_id === payload.booking_id);
    if (!targetBooking) {
      return { ok: false, message: 'Referenced booking does not exist.' };
    }

    if (targetBooking.status !== 'COMPLETED') {
      appendAudit(
        'BR-06',
        'reviews, bookings',
        'BLOCKED_VIOLATION',
        `Blocked review submission for booking_id=${payload.booking_id} because status is '${targetBooking.status}' (requires 'COMPLETED').`
      );
      return {
        ok: false,
        message: `BR-06 Violation: Reviews can only be submitted for bookings marked as COMPLETED (current status: ${targetBooking.status}).`,
      };
    }

    const existingReview = reviews.find((r) => r.booking_id === payload.booking_id);
    if (existingReview) {
      appendAudit(
        'BR-06',
        'reviews',
        'BLOCKED_VIOLATION',
        `Blocked duplicate review for booking_id=${payload.booking_id} — violates UNIQUE(booking_id) 1:1 constraint.`
      );
      return {
        ok: false,
        message: 'Constraint Violation: A completed booking can have at most one review (UNIQUE (booking_id)).',
      };
    }

    if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
      appendAudit(
        'BR-07',
        'reviews',
        'BLOCKED_VIOLATION',
        `Rejected rating=${payload.rating} on booking_id=${payload.booking_id} — violates CHECK (rating BETWEEN 1 AND 5).`
      );
      return {
        ok: false,
        message: 'BR-07 Constraint Violation: Rating score must be an integer between 1 and 5.',
      };
    }

    const nextReviewId = reviews.reduce((max, r) => Math.max(max, r.review_id), 900) + 1;
    const newReview: Review = {
      review_id: nextReviewId,
      booking_id: payload.booking_id,
      rating: payload.rating,
      comment: payload.comment.trim(),
      created_at: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);
    appendAudit(
      'BR-07',
      'reviews',
      'ENFORCED',
      `Inserted review_id=${nextReviewId} for completed booking_id=${payload.booking_id} with integer rating=${payload.rating} (BR-06 & BR-07).`
    );

    return {
      ok: true,
      message: `Review #${nextReviewId} recorded for Booking #${payload.booking_id}.`,
    };
  };

  const reviewVerificationDocument = (
    docId: number,
    status: VerificationStatus
  ): { ok: boolean; message: string } => {
    const targetDoc = verificationDocuments.find((d) => d.doc_id === docId);
    if (!targetDoc) {
      return { ok: false, message: 'Verification document not found.' };
    }

    const updatedDocs = verificationDocuments.map((d) =>
      d.doc_id === docId ? { ...d, status } : d
    );
    setVerificationDocuments(updatedDocs);

    const profileDocs = updatedDocs.filter((d) => d.profile_id === targetDoc.profile_id);
    const allApproved = profileDocs.length > 0 && profileDocs.every((d) => d.status === 'APPROVED');
    const anyRejected = profileDocs.some((d) => d.status === 'REJECTED');

    if (allApproved) {
      setTechnicianProfiles((prev) =>
        prev.map((p) => (p.profile_id === targetDoc.profile_id ? { ...p, is_verified: true } : p))
      );
      appendAudit(
        'BR-03',
        'technician_profiles, verification_documents',
        'ENFORCED',
        `Approved doc_id=${docId}. All credentials for profile_id=${targetDoc.profile_id} are APPROVED — activated profile in public Cebu City directory (is_verified=TRUE).`
      );
      return {
        ok: true,
        message: `Document #${docId} marked ${status}. Technician Profile #${targetDoc.profile_id} is now Verified and live in the public directory (BR-03).`,
      };
    } else if (anyRejected) {
      setTechnicianProfiles((prev) =>
        prev.map((p) => (p.profile_id === targetDoc.profile_id ? { ...p, is_verified: false } : p))
      );
      appendAudit(
        'BR-03',
        'technician_profiles, verification_documents',
        'ENFORCED',
        `Rejected doc_id=${docId}. Set profile_id=${targetDoc.profile_id} is_verified=FALSE to hide from public directory (BR-03).`
      );
    }

    return {
      ok: true,
      message: `Document #${docId} status updated to ${status}.`,
    };
  };

  const setTechnicianVerified = (
    profileId: number,
    isVerified: boolean
  ): { ok: boolean; message: string } => {
    if (isVerified) {
      const profileDocs = verificationDocuments.filter((d) => d.profile_id === profileId);
      const hasApprovedDoc = profileDocs.some((d) => d.status === 'APPROVED');
      if (!hasApprovedDoc) {
        appendAudit(
          'BR-03',
          'technician_profiles, verification_documents',
          'BLOCKED_VIOLATION',
          `Blocked manual verification of profile_id=${profileId} because no verification_documents have status='APPROVED'.`
        );
        return {
          ok: false,
          message:
            'BR-03 Enforcement: Technician must have at least one APPROVED trade license or barangay clearance before activation.',
        };
      }
    }

    setTechnicianProfiles((prev) =>
      prev.map((p) => (p.profile_id === profileId ? { ...p, is_verified: isVerified } : p))
    );

    appendAudit(
      'BR-03',
      'technician_profiles',
      'ENFORCED',
      `Set technician profile_id=${profileId} is_verified=${isVerified ? 'TRUE' : 'FALSE'}.`
    );

    return {
      ok: true,
      message: `Technician Profile #${profileId} ${
        isVerified ? 'activated in public directory' : 'removed from public directory'
      }.`,
    };
  };

  const updateTechnicianProfile = (
    payload: UpdateTechnicianProfilePayload
  ): { ok: boolean; message: string } => {
    setTechnicianProfiles((prev) =>
      prev.map((p) =>
        p.profile_id === payload.profile_id
          ? {
              ...p,
              category_id: payload.category_id,
              barangay: payload.barangay,
              hourly_rate_php: payload.hourly_rate_php,
              skills: payload.skills,
              bio: payload.bio,
              years_experience: payload.years_experience,
            }
          : p
      )
    );
    appendAudit(
      'BR-08',
      'technician_profiles',
      'ENFORCED',
      `Updated profile_id=${payload.profile_id} preserving 1:1 UNIQUE(user_id) link.`
    );
    return {
      ok: true,
      message: 'Technician profile and Cebu City barangay coverage updated.',
    };
  };

  const uploadVerificationDocument = (
    payload: UploadVerificationDocPayload
  ): { ok: boolean; message: string } => {
    const nextDocId = verificationDocuments.reduce((max, d) => Math.max(max, d.doc_id), 500) + 1;
    const newDoc: VerificationDocument = {
      doc_id: nextDocId,
      profile_id: payload.profile_id,
      document_type: payload.document_type.trim(),
      reference_number: payload.reference_number.trim(),
      issuing_authority: payload.issuing_authority.trim(),
      submitted_at: new Date().toISOString(),
      status: 'PENDING',
    };
    setVerificationDocuments((prev) => [newDoc, ...prev]);
    appendAudit(
      'BR-03',
      'verification_documents',
      'ENFORCED',
      `Uploaded doc_id=${nextDocId} (${newDoc.document_type}) with DEFAULT status='PENDING' for profile_id=${payload.profile_id}.`
    );
    return {
      ok: true,
      message: `Credential "${newDoc.document_type}" submitted for Admin verification.`,
    };
  };

  const resetDatabaseToSeed = () => {
    setUsers(INITIAL_USERS);
    setCategories(INITIAL_SERVICE_CATEGORIES);
    setTechnicianProfiles(INITIAL_TECHNICIAN_PROFILES);
    setVerificationDocuments(INITIAL_VERIFICATION_DOCUMENTS);
    setBookings(INITIAL_BOOKINGS);
    setReviews(INITIAL_REVIEWS);
    setAuditLog(INITIAL_AUDIT_LOG);
    setCurrentUserId(1);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        users,
        categories,
        technicianProfiles,
        verificationDocuments,
        bookings,
        reviews,
        auditLog,
        currentUser,
        login,
        quickSwitchUser,
        logout,
        register,
        createBooking,
        updateBookingStatus,
        submitReview,
        reviewVerificationDocument,
        setTechnicianVerified,
        updateTechnicianProfile,
        uploadVerificationDocument,
        resetDatabaseToSeed,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
