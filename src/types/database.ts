export type UserRole = 'CLIENT' | 'TECHNICIAN' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  phone: string;
  created_at: string;
}

export interface ServiceCategory {
  category_id: number;
  name: string;
  description: string;
  standard_rate_range: string;
}

export interface TechnicianProfile {
  profile_id: number;
  user_id: number; // UNIQUE FK -> users(user_id) (BR-08)
  category_id: number; // FK -> service_categories(category_id)
  barangay: string; // Cebu City barangay
  is_verified: boolean; // Enforces BR-03
  hourly_rate_php: number;
  skills: string[];
  bio: string;
  years_experience: number;
  avatar_initials: string;
  avatar_color: string;
}

export interface VerificationDocument {
  doc_id: number;
  profile_id: number; // FK -> technician_profiles(profile_id)
  document_type: string; // e.g. 'Trade License (TESDA NC II)', 'Barangay Clearance'
  reference_number: string;
  issuing_authority: string;
  submitted_at: string;
  status: VerificationStatus; // 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface Booking {
  booking_id: number;
  client_id: number; // FK -> users(user_id)
  technician_id: number; // FK -> technician_profiles(profile_id)
  scheduled_at: string; // Must be > created_at (BR-04)
  created_at: string;
  status: BookingStatus; // 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' (BR-05)
  barangay: string;
  street_address: string;
  issue_description: string;
  settlement_method: 'Cash on Completion' | 'GCash (External)' | 'Maya (External)';
  estimated_fee_php: number;
}

export interface Review {
  review_id: number;
  booking_id: number; // UNIQUE FK -> bookings(booking_id) (BR-06)
  rating: number; // INTEGER BETWEEN 1 AND 5 (BR-07)
  comment: string;
  created_at: string;
}

export interface BusinessRuleAuditEntry {
  id: string;
  timestamp: string;
  rule_id: 'BR-01' | 'BR-02' | 'BR-03' | 'BR-04' | 'BR-05' | 'BR-06' | 'BR-07' | 'BR-08';
  entity: string;
  outcome: 'ENFORCED' | 'BLOCKED_VIOLATION';
  detail: string;
}
