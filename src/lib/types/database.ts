// ============================================================
// This Is Us — TypeScript Types (mirrors database schema)
// ============================================================

export type MemberRole = 'bride' | 'groom' | 'planner' | 'family';

export type EventType =
  | 'white_wedding'
  | 'lobola'
  | 'traditional'
  | 'kitchen_party'
  | 'umembeso'
  | 'umabo'
  | 'kurova_guva'
  | 'engagement'
  | 'other';

export type SupplierStatus =
  | 'researching'
  | 'contacted'
  | 'quoted'
  | 'negotiating'
  | 'booked'
  | 'rejected';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'mobile_money'
  | 'card'
  | 'other';

export type Currency = 'ZAR' | 'USD' | 'BWP' | 'ZMW' | 'GBP' | 'EUR';

// ============================================================
// Table types
// ============================================================

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Couple {
  id: string;
  name: string;
  primary_currency: Currency;
  invite_code?: string; // Optional because old records might have it null before migration completion or if we select partial columns
  created_at: string;
  updated_at: string;
}

export interface CoupleMember {
  id: string;
  couple_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export interface Event {
  id: string;
  couple_id: string;
  name: string;
  type: EventType;
  date: string | null;
  location: string | null;
  currency: Currency;
  budget: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  event_id: string;
  name: string;
  category: string | null;
  contact_name: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  social_media: string | null;
  email: string | null;
  notes: string | null;
  status: SupplierStatus;
  quoted_amount: number;
  paid_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  supplier_id: string;
  amount: number;
  currency: Currency;
  deposit_required: number;
  deposit_paid: number;
  outstanding_balance: number;
  due_date: string | null;
  quote_file_url: string | null;
  notes: string | null;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  quote_id: string;
  amount: number;
  currency: Currency;
  paid_at: string;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Joined / enriched types
// ============================================================

export interface SupplierWithQuotes extends Supplier {
  quotes: Quote[];
}

export interface QuoteWithPayments extends Quote {
  payments: Payment[];
}

export interface EventWithSuppliers extends Event {
  suppliers: Supplier[];
}

// ============================================================
// Form data types (for server actions)
// ============================================================

export interface CreateEventData {
  name: string;
  type: EventType;
  date?: string;
  location?: string;
  currency: Currency;
  notes?: string;
}

export interface CreateSupplierData {
  event_id: string;
  name: string;
  category?: string;
  contact_name?: string;
  phone?: string;
  whatsapp_number?: string;
  social_media?: string;
  email?: string;
  notes?: string;
  status?: SupplierStatus;
  quoted_amount?: number;
  paid_amount?: number;
}

export interface CreateQuoteData {
  supplier_id: string;
  amount: number;
  currency: Currency;
  deposit_required?: number;
  deposit_paid?: number;
  due_date?: string;
  quote_file_url?: string;
  notes?: string;
}

export interface CreatePaymentData {
  quote_id: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface CreateTaskData {
  event_id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
}

// ============================================================
// Budget calculation types
// ============================================================

export interface BudgetSummary {
  total_quoted: number;
  total_deposits_required: number;
  total_deposits_paid: number;
  total_outstanding: number;
  total_payments: number;
  currency: Currency;
  supplier_count: number;
  booked_count: number;
}

export interface EventBudgetSummary extends BudgetSummary {
  event_id: string;
  event_name: string;
}

// ============================================================
// Display helpers
// ============================================================

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  white_wedding: 'White Wedding',
  lobola: 'Lobola Ceremony',
  traditional: 'Traditional Wedding',
  kitchen_party: 'Kitchen Party',
  umembeso: 'Umembeso',
  umabo: 'Umabo',
  kurova_guva: 'Kurova Guva',
  engagement: 'Engagement',
  other: 'Other',
};

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  researching: 'Researching',
  contacted: 'Contacted',
  quoted: 'Quoted',
  negotiating: 'Negotiating',
  booked: 'Booked',
  rejected: 'Rejected',
};

export const SUPPLIER_CATEGORIES = [
  'Venue',
  'Catering',
  'Photography',
  'Videography',
  'Flowers & Decor',
  'Traditional Attire',
  'Wedding Dress',
  'Suits',
  'Music & DJ',
  'Traditional Brewer',
  'Tent & Furniture Hire',
  'Transport',
  'Hair & Makeup',
  'Wedding Cake',
  'Stationery',
  'MC / Host',
  'Sound & Lighting',
  'Security',
  'Other',
] as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  card: 'Card',
  other: 'Other',
};

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'ZAR', label: 'ZAR — South African Rand' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'BWP', label: 'BWP — Botswana Pula' },
  { value: 'ZMW', label: 'ZMW — Zambian Kwacha' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'EUR', label: 'EUR — Euro' },
];
