export type DashboardId =
  | 'dashboard-2-login'
  | 'dashboard-3-home'
  | 'dashboard-4-notifications'
  | 'dashboard-5-categories'
  | 'dashboard-6-details'
  | 'dashboard-7-profile'
  | 'dashboard-admin';

export type EventCategory =
  | 'Cultural'
  | 'Technical'
  | 'Sports'
  | 'Workshops'
  | 'Placements'
  | 'Clubs'
  | 'Celebrity Nights'
  | 'Abroad Study'
  | 'Competitive Exams';

export interface EventScheduleItem {
  time: string;
  activity: string;
  location: string;
}

export interface Coordinator {
  name: string;
  role: 'Faculty Coordinator' | 'Student Coordinator' | 'Dean';
  contact: string;
  email: string;
  department: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  shortDesc: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  campusZone: string;
  organizer: string;
  bannerUrl: string;
  registrationFee: string;
  seatsTotal: number;
  seatsBooked: number;
  registrationDeadline: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  uploadedByAppHolder?: boolean;
  uploadedAt?: string;
  schedule: EventScheduleItem[];
  coordinators: Coordinator[];
  rules: string[];
  eligibility: string;
  tags: string[];
  hasPass: boolean;
  registrationLink?: string;
  registrationType?: 'internal' | 'external' | 'both';
  paymentLink?: string;
  paymentQrUrl?: string;
  paymentUpiId?: string;
  paymentInstructions?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'registration' | 'schedule' | 'pass' | 'certificate';
  timestamp: string;
  date: string;
  isRead: boolean;
  relatedEventId?: string;
  actionUrl?: string;
}

export interface CategoryInfo {
  id: EventCategory;
  title: string;
  description: string;
  iconName: string;
  color: string;
  bgGradient: string;
  count: number;
}

export interface StudentProfile {
  name: string;
  ugNumber: string;
  email: string;
  phone: string;
  institute: string;
  department: string;
  semester: string;
  batch: string;
  avatarUrl: string;
  registeredEventIds: string[];
  bookmarkedEventIds: string[];
  certificates: {
    id: string;
    eventTitle: string;
    date: string;
    certificateNumber: string;
  }[];
  notificationPreferences: {
    smsAlerts: boolean;
    whatsappAlerts: boolean;
    emailAlerts: boolean;
    urgentPush: boolean;
  };
}

export interface RegisteredAccount {
  name: string;
  ugNumber: string;
  email: string;
  password: string;
  phone: string;
  institute: string;
  department: string;
  semester?: string;
  batch?: string;
  avatarUrl?: string;
  registeredAt?: string;
}

export interface AdminSession {
  token: string;
  adminId: string;
  name: string;
  role: string;
  email: string;
}

export interface EventAttendee {
  ugNumber: string;
  name: string;
  email: string;
  department: string;
  registeredAt: string;
  ticketId: string;
}

export interface AdminStudentAccount extends RegisteredAccount {
  registeredEventsCount: number;
  registeredEventsList: { id: string; title: string; ticketId?: string }[];
  status?: string;
}

export interface AdminStats {
  totalEvents: number;
  totalRegistrations: number;
  totalStudents: number;
  activeNotifications: number;
  eventsByCategory: Record<string, number>;
}
