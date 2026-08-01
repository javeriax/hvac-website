export type Role = 'customer' | 'technician' | 'dispatcher' | 'admin';

export type ServiceType =
  | 'installation'
  | 'repair'
  | 'maintenance'
  | 'inspection'
  | 'duct-cleaning'
  | 'thermostat'
  | 'emergency';

export type Priority = 'low' | 'normal' | 'high' | 'emergency';

export type RequestStatus =
  | 'submitted'
  | 'reviewing'
  | 'quoted'
  | 'approved'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type JobStatus =
  | 'unassigned'
  | 'assigned'
  | 'en_route'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'void';
export type ContractStatus = 'pending' | 'active' | 'expiring' | 'expired' | 'cancelled';
export type TechStatus = 'available' | 'on_job' | 'off_duty' | 'on_leave';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  customer?: {
    address: Address;
    propertyType: 'residential' | 'commercial';
    companyName?: string;
    customerSince: string;
    preferredContact: 'phone' | 'email' | 'sms';
  };
  technician?: {
    employeeId?: string;
    skills: string[];
    certifications: string[];
    serviceAreas: string[];
    status: TechStatus;
    rating: number;
    jobsCompleted: number;
    hourlyRate: number;
    shiftStart: string;
    shiftEnd: string;
  };
  jobsToday?: number;
}

export interface TimelineEntry {
  status: string;
  note?: string;
  at: string;
}

export interface Photo {
  url: string;
  caption?: string;
  phase?: 'before' | 'after';
  uploadedAt?: string;
}

export interface ServiceRequest {
  _id: string;
  trackingCode: string;
  customer?: User | string;
  contact: { name: string; email: string; phone: string };
  serviceType: ServiceType;
  propertyType: 'residential' | 'commercial';
  title: string;
  description: string;
  priority: Priority;
  status: RequestStatus;
  preferredDate?: string;
  preferredWindow?: string;
  address: Address;
  photos: Photo[];
  systemAge?: string;
  systemBrand?: string;
  timeline: TimelineEntry[];
  quotation?: Quotation | string;
  job?: Job | string;
  createdAt: string;
}

export interface LineItem {
  kind: 'labor' | 'equipment' | 'part' | 'fee';
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quotation {
  _id: string;
  quoteNumber: string;
  serviceRequest: ServiceRequest | string;
  customer: User | string;
  lineItems: LineItem[];
  laborTotal: number;
  equipmentTotal: number;
  subtotal: number;
  discountType: 'none' | 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: QuoteStatus;
  validUntil: string;
  notes?: string;
  terms?: string;
  rejectionReason?: string;
  sentAt?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface Job {
  _id: string;
  jobNumber: string;
  serviceRequest: ServiceRequest | string;
  quotation?: Quotation | string;
  customer: User | string;
  technician?: User | string;
  title: string;
  serviceType: ServiceType;
  priority: Priority;
  status: JobStatus;
  address: Address;
  scheduledStart: string;
  scheduledEnd: string;
  startedAt?: string;
  completedAt?: string;
  checklist: { label: string; done: boolean }[];
  photos: Photo[];
  report?: {
    summary: string;
    workPerformed: string;
    partsUsed: { name: string; quantity: number }[];
    recommendations?: string;
    laborHours: number;
    submittedAt: string;
  };
  signature?: { url: string; signedBy: string; signedAt: string };
  notes: { text: string; at: string }[];
  timeline: TimelineEntry[];
  invoice?: Invoice | string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: User | string;
  job?: Job | string;
  quotation?: Quotation | string;
  lineItems: LineItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  paymentNumber: string;
  invoice: Invoice | string;
  customer: User | string;
  amount: number;
  method: 'card' | 'cash' | 'check' | 'bank_transfer' | 'online';
  status: string;
  reference?: string;
  paidAt: string;
}

export interface MaintenancePlan {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  visitsPerYear: number;
  responseHours: number;
  repairDiscountPercent: number;
  features: string[];
  isPopular: boolean;
  sortOrder: number;
}

export interface MaintenanceContract {
  _id: string;
  contractNumber: string;
  customer: User | string;
  plan: MaintenancePlan | string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  autoRenew: boolean;
  visitsTotal: number;
  visitsUsed: number;
  visits: {
    scheduledDate: string;
    status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
    completedAt?: string;
  }[];
  daysRemaining: number;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Equipment {
  _id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  modelNumber?: string;
  unitPrice: number;
  unit: string;
  stock: number;
  reorderLevel: number;
  specs: { label: string; value: string }[];
}

export interface Testimonial {
  _id: string;
  author: string;
  role: string;
  city: string;
  rating: number;
  quote: string;
  serviceType: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  createdAt: string;
}

export interface AnalyticsOverview {
  revenue: {
    today: number;
    todayPayments: number;
    month: number;
    lastMonth: number;
    growthPercent: number;
    lifetime: number;
    outstanding: number;
    outstandingCount: number;
  };
  jobs: {
    completed: number;
    pending: number;
    inProgress: number;
    unassigned: number;
    cancelled: number;
    total: number;
    byStatus: Record<string, number>;
  };
  requests: { open: number; total: number; byStatus: Record<string, number> };
  contracts: { active: number; expiring: number; expired: number; recurringValue: number };
  people: { customers: number; technicians: number };
  charts: {
    revenueByMonth: { label: string; value: number }[];
    customersByMonth: { label: string; value: number }[];
    serviceMix: { label: string; value: number }[];
    technicianPerformance: {
      _id: string;
      name: string;
      avatarUrl?: string;
      completed: number;
      hours: number;
      rating: number;
      skills: string[];
    }[];
  };
  recentJobs: Job[];
}

export interface CustomerSummary {
  openRequests: number;
  completedJobs: number;
  upcomingJob: Job | null;
  balanceDue: number;
  dueInvoiceCount: number;
  contract: MaintenanceContract | null;
}

export interface TechnicianSummary {
  todayJobs: number;
  completedToday: number;
  completedWeek: number;
  open: number;
  hoursThisWeek: number;
  rating: number;
  lifetimeJobs: number;
}

export interface DispatchSummary {
  todayJobs: number;
  unassigned: number;
  emergencies: number;
  technicianStatus: Record<string, number>;
}
