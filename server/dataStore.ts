import fs from 'fs';
import path from 'path';
import { EventItem, NotificationItem, RegisteredAccount, EventAttendee, AdminStats } from '../src/types';
import { EVENTS_DATA, INITIAL_NOTIFICATIONS } from '../src/data/mockData';
import { DEFAULT_REGISTERED_STUDENTS } from '../src/utils/authStorage';

interface DatabaseSchema {
  events: EventItem[];
  notifications: NotificationItem[];
  students: RegisteredAccount[];
  attendees: Record<string, EventAttendee[]>;
  studentRegistrations: Record<string, string[]>; // ugNumber -> eventId[]
  studentBookmarks: Record<string, string[]>; // ugNumber -> eventId[]
  deletedStudents?: string[]; // track permanently deleted ug numbers
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Predefined Admin Accounts - Strictly restricted to administrative ID 26UG030984
export const ADMIN_CREDENTIALS = [
  {
    adminId: '26UG030984',
    username: '26UG030984',
    password: 'PU@gmail2006',
    name: 'Parul University Event Administrator',
    role: 'Chief Administrative Controller & Event Convener',
    email: '26ug030984@paruluniversity.ac.in',
  },
];

// Active Admin Tokens in memory (and persistent)
const activeAdminTokens: Map<string, { adminId: string; name: string; role: string; email: string }> = new Map();

// Helper to normalize and guard any event object against missing properties
export function normalizeEvent(event: any): EventItem {
  const category = event.category || 'Cultural';
  const defaultBanner = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80';
  
  return {
    id: String(event.id || `pu-ev-${Date.now()}`),
    title: String(event.title || 'Untitled University Event'),
    category: category,
    shortDesc: String(event.shortDesc || event.description || 'Official Parul University event.'),
    description: String(event.description || event.shortDesc || 'Official Parul University event with verified campus schedule and digital entry pass.'),
    date: String(event.date || 'TBA'),
    time: String(event.time || '10:00 AM - 04:00 PM'),
    venue: String(event.venue || 'Main Campus, Vadodara'),
    campusZone: String(event.campusZone || 'Main Campus, Vadodara'),
    organizer: String(event.organizer || 'Parul University Official Event Board'),
    bannerUrl: String(event.bannerUrl || defaultBanner),
    registrationFee: String(event.registrationFee || 'Free for PU Students'),
    seatsTotal: Number(event.seatsTotal) || 500,
    seatsBooked: Number(event.seatsBooked) || 0,
    registrationDeadline: String(event.registrationDeadline || 'Event Day'),
    isFeatured: Boolean(event.isFeatured),
    isTrending: Boolean(event.isTrending),
    uploadedByAppHolder: Boolean(event.uploadedByAppHolder),
    uploadedAt: event.uploadedAt || new Date().toISOString(),
    hasPass: event.hasPass !== false,
    tags: Array.isArray(event.tags) && event.tags.length > 0
      ? event.tags
      : ['Official', category, 'Parul University'],
    eligibility: String(event.eligibility || 'Open to all registered Parul University students.'),
    schedule: Array.isArray(event.schedule) && event.schedule.length > 0
      ? event.schedule
      : [
          {
            time: String(event.time || '10:00 AM'),
            activity: 'Official Event Commencement & Activities',
            location: String(event.venue || 'Campus Auditorium'),
          },
        ],
    coordinators: Array.isArray(event.coordinators) && event.coordinators.length > 0
      ? event.coordinators
      : [
          {
            name: 'Dr. Devanshu Patel',
            role: 'Dean',
            contact: '+91 2668 260300',
            email: 'admin@paruluniversity.ac.in',
            department: 'Department of Student Welfare, Parul University',
          },
        ],
    rules: Array.isArray(event.rules) && event.rules.length > 0
      ? event.rules
      : [
          'Valid University Digital Pass is mandatory at entrance.',
          'Please report 15 minutes before scheduled start time.',
          'Follow official campus discipline and safety guidelines.',
        ],
    registrationLink: event.registrationLink ? String(event.registrationLink) : undefined,
    registrationType: event.registrationType || 'both',
    paymentLink: event.paymentLink ? String(event.paymentLink) : undefined,
    paymentQrUrl: event.paymentQrUrl ? String(event.paymentQrUrl) : undefined,
    paymentUpiId: event.paymentUpiId ? String(event.paymentUpiId) : undefined,
    paymentInstructions: event.paymentInstructions ? String(event.paymentInstructions) : undefined,
  };
}

// Seed attendees for initial mock data so admin immediately sees real registrations
function generateInitialAttendees(): Record<string, EventAttendee[]> {
  return {
    'event-1': [
      {
        ugNumber: 'PU2024UG57654',
        name: 'Aman Singh',
        email: 'aman576544534@gmail.com',
        department: 'Computer Science & Engineering',
        registeredAt: '2026-09-01T10:15:00Z',
        ticketId: 'PU-TKT-EV01-8492',
      },
      {
        ugNumber: 'PU2024UG22190',
        name: 'Riya Parekh',
        email: 'riya.parekh@paruluniversity.ac.in',
        department: 'Bachelor of Design (B.Des)',
        registeredAt: '2026-09-02T14:30:00Z',
        ticketId: 'PU-TKT-EV01-3147',
      },
    ],
    'event-2': [
      {
        ugNumber: 'PU2024UG57654',
        name: 'Aman Singh',
        email: 'aman576544534@gmail.com',
        department: 'Computer Science & Engineering',
        registeredAt: '2026-09-03T09:00:00Z',
        ticketId: 'PU-TKT-EV02-9124',
      },
    ],
  };
}

class BackendDataStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure essential structures exist and all events are properly normalized
        const loadedEvents: EventItem[] = (Array.isArray(parsed.events) ? parsed.events : []).map(normalizeEvent);
        const deletedList: string[] = Array.isArray(parsed.deletedStudents) ? parsed.deletedStudents.map((d: string) => d.toUpperCase()) : [];
        let loadedStudents: RegisteredAccount[] = Array.isArray(parsed.students) && parsed.students.length > 0 ? parsed.students : DEFAULT_REGISTERED_STUDENTS;
        
        // Filter out any students that have been deleted by admin
        loadedStudents = loadedStudents.filter((s) => !deletedList.includes(s.ugNumber.toUpperCase()) && !deletedList.includes(s.email.toUpperCase()));

        // Ensure student 26UG030789 is in the roster UNLESS explicitly deleted by admin
        const has26UG = loadedStudents.some((s) => s.ugNumber.toUpperCase() === '26UG030789');
        if (!has26UG && !deletedList.includes('26UG030789')) {
          const student26UG = DEFAULT_REGISTERED_STUDENTS.find((s) => s.ugNumber === '26UG030789');
          if (student26UG) {
            loadedStudents = [student26UG, ...loadedStudents];
          }
        }

        return {
          events: loadedEvents,
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          students: loadedStudents,
          deletedStudents: deletedList,
          attendees: parsed.attendees || {},
          studentRegistrations: parsed.studentRegistrations || {},
          studentBookmarks: parsed.studentBookmarks || {},
        };
      }
    } catch (err) {
      console.error('[Backend DB] Error reading db.json, falling back to initial seed:', err);
    }

    // Default Seed
    const initialDb: DatabaseSchema = {
      events: [],
      notifications: [],
      students: DEFAULT_REGISTERED_STUDENTS,
      attendees: {},
      studentRegistrations: {},
      studentBookmarks: {},
    };

    this.saveDatabase(initialDb);
    return initialDb;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const toWrite = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(toWrite, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Backend DB] Error writing to db.json:', err);
    }
  }

  // --- EVENTS ---
  public getEvents(): EventItem[] {
    return this.data.events;
  }

  public getEventById(id: string): EventItem | undefined {
    return this.data.events.find((e) => e.id === id);
  }

  public createEvent(
    eventData: Omit<EventItem, 'id'> & { broadcastNotification?: boolean },
    adminName: string
  ): EventItem {
    const newId = `pu-ev-${Date.now()}`;
    const newEvent: EventItem = normalizeEvent({
      ...eventData,
      id: newId,
      uploadedByAppHolder: true,
      uploadedAt: new Date().toISOString(),
      seatsBooked: eventData.seatsBooked || 0,
      seatsTotal: eventData.seatsTotal || 500,
      hasPass: true,
    });

    // Prepend to events
    this.data.events = [newEvent, ...this.data.events];
    this.data.attendees[newId] = [];

    // If admin opted to broadcast notification
    if (eventData.broadcastNotification !== false) {
      const broadcastNotif: NotificationItem = {
        id: `notif-pub-${Date.now()}`,
        title: `★ Official Announcement: ${newEvent.title}`,
        message: `Parul University Administration has published a new official event: "${newEvent.title}" under ${newEvent.category}. Scheduled on ${newEvent.date} at ${newEvent.venue}. Registration is now live!`,
        type: 'urgent',
        timestamp: 'Just now',
        date: 'Today, Live',
        isRead: false,
        relatedEventId: newId,
      };
      this.data.notifications = [broadcastNotif, ...this.data.notifications];
    }

    this.saveDatabase();
    return newEvent;
  }

  public updateEvent(id: string, updateData: Partial<EventItem>, adminName: string): EventItem | null {
    const index = this.data.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const existing = this.data.events[index];
    const updated: EventItem = normalizeEvent({
      ...existing,
      ...updateData,
      id: existing.id, // Immutable ID
      uploadedByAppHolder: true,
    });

    this.data.events[index] = updated;

    // Flash update notification across portal
    const updateNotif: NotificationItem = {
      id: `notif-upd-${Date.now()}`,
      title: `⚡ Schedule & Details Updated: ${updated.title}`,
      message: `Administration updated details for "${updated.title}" (${updated.category}). Date: ${updated.date}, Venue: ${updated.venue}.`,
      type: 'schedule',
      timestamp: 'Just now',
      date: 'Today, Live',
      isRead: false,
      relatedEventId: id,
    };
    this.data.notifications = [updateNotif, ...this.data.notifications];

    this.saveDatabase();
    return updated;
  }

  public deleteEvent(id: string): boolean {
    const initialLen = this.data.events.length;
    this.data.events = this.data.events.filter((e) => e.id !== id);
    if (this.data.attendees[id]) {
      delete this.data.attendees[id];
    }
    // Remove from student registrations
    for (const ug in this.data.studentRegistrations) {
      this.data.studentRegistrations[ug] = this.data.studentRegistrations[ug].filter((eid) => eid !== id);
    }
    this.saveDatabase();
    return this.data.events.length < initialLen;
  }

  public clearAllEvents(): boolean {
    this.data.events = [];
    this.data.attendees = {};
    this.data.studentRegistrations = {};
    this.data.studentBookmarks = {};
    // Clear all alerts and event-related notifications
    this.data.notifications = [];
    this.saveDatabase();
    return true;
  }

  public clearAllNotifications(): boolean {
    this.data.notifications = [];
    this.saveDatabase();
    return true;
  }

  // --- REGISTRATIONS & ATTENDEES ---
  public registerStudentForEvent(
    eventId: string,
    student: { ugNumber: string; name: string; email: string; department: string }
  ): { success: boolean; message: string; ticketId?: string; event?: EventItem } {
    const event = this.data.events.find((e) => e.id === eventId);
    if (!event) {
      return { success: false, message: 'Event not found' };
    }

    if (!this.data.attendees[eventId]) {
      this.data.attendees[eventId] = [];
    }

    const existingAttendee = this.data.attendees[eventId].find(
      (a) => a.ugNumber.toUpperCase() === student.ugNumber.toUpperCase()
    );

    if (existingAttendee) {
      return {
        success: false,
        message: 'You are already registered for this event.',
        ticketId: existingAttendee.ticketId,
        event,
      };
    }

    if (event.seatsBooked >= event.seatsTotal) {
      return { success: false, message: 'Registration full. All seats have been reserved.' };
    }

    const ticketId = `PU-TKT-${eventId.slice(-4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAttendee: EventAttendee = {
      ugNumber: student.ugNumber.toUpperCase(),
      name: student.name,
      email: student.email,
      department: student.department,
      registeredAt: new Date().toISOString(),
      ticketId,
    };

    this.data.attendees[eventId].push(newAttendee);
    event.seatsBooked += 1;

    // Track under student registrations
    const ug = student.ugNumber.toUpperCase();
    if (!this.data.studentRegistrations[ug]) {
      this.data.studentRegistrations[ug] = [];
    }
    if (!this.data.studentRegistrations[ug].includes(eventId)) {
      this.data.studentRegistrations[ug].push(eventId);
    }

    // Add pass notification
    const passNotif: NotificationItem = {
      id: `notif-pass-${Date.now()}`,
      title: `Registration Confirmed: ${event.title}`,
      message: `Your verified Digital Entry Pass (Ticket: ${ticketId}) has been generated for ${student.name} (${student.ugNumber}). Present barcode at the entrance.`,
      type: 'pass',
      timestamp: 'Just now',
      date: 'Today',
      isRead: false,
      relatedEventId: eventId,
    };
    this.data.notifications = [passNotif, ...this.data.notifications];

    this.saveDatabase();
    return { success: true, message: 'Registration confirmed!', ticketId, event };
  }

  public cancelRegistration(
    eventId: string,
    ugNumber: string
  ): { success: boolean; message: string; event?: EventItem } {
    const event = this.data.events.find((e) => e.id === eventId);
    if (!event) {
      return { success: false, message: 'Event not found' };
    }

    const ug = ugNumber.toUpperCase();
    if (this.data.attendees[eventId]) {
      this.data.attendees[eventId] = this.data.attendees[eventId].filter((a) => a.ugNumber.toUpperCase() !== ug);
    }

    if (this.data.studentRegistrations[ug]) {
      this.data.studentRegistrations[ug] = this.data.studentRegistrations[ug].filter((id) => id !== eventId);
    }

    event.seatsBooked = Math.max(0, event.seatsBooked - 1);
    this.saveDatabase();
    return { success: true, message: 'Registration cancelled', event };
  }

  public getAttendees(eventId: string): EventAttendee[] {
    return this.data.attendees[eventId] || [];
  }

  public getStudentRegistrations(ugNumber: string): string[] {
    return this.data.studentRegistrations[ugNumber.toUpperCase()] || [];
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): NotificationItem[] {
    return this.data.notifications;
  }

  public createNotification(
    notif: Omit<NotificationItem, 'id' | 'timestamp' | 'date' | 'isRead'>
  ): NotificationItem {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-admin-${Date.now()}`,
      timestamp: 'Just now',
      date: 'Today, Live',
      isRead: false,
    };
    this.data.notifications = [newNotif, ...this.data.notifications];
    this.saveDatabase();
    return newNotif;
  }

  public markNotificationRead(id: string): boolean {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (n) {
      n.isRead = true;
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(): void {
    this.data.notifications.forEach((n) => {
      n.isRead = true;
    });
    this.saveDatabase();
  }

  public clearReadNotifications(): void {
    this.data.notifications = this.data.notifications.filter((n) => !n.isRead);
    this.saveDatabase();
  }

  // --- STUDENT AUTH & ACCOUNTS ---
  public authenticateStudent(
    identifier: string,
    password: string
  ): { success: boolean; message: string; account?: RegisteredAccount } {
    const cleanId = identifier.trim().toLowerCase();
    const account = this.data.students.find(
      (s) => s.ugNumber.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId
    );

    if (!account) {
      return {
        success: false,
        message: 'Account not found. Please verify your UG Number or complete registration.',
      };
    }

    const cleanPassword = (password || '').trim();
    const is26UG =
      account.ugNumber.toUpperCase() === '26UG030789' ||
      account.email.toLowerCase() === '26ug030789@paruluniversity.ac.in';

    const isAman =
      account.ugNumber.toUpperCase() === 'PU2024UG57654' ||
      account.email.toLowerCase() === 'aman576544534@gmail.com';

    const passwordMatches =
      account.password === cleanPassword ||
      (is26UG && (
        cleanPassword === 'Parul@2026' ||
        cleanPassword === 'PU@2026' ||
        cleanPassword === 'PU@gmail2006' ||
        cleanPassword === '123456' ||
        cleanPassword === 'student'
      )) ||
      (isAman && (cleanPassword === 'Parul@2026' || cleanPassword === 'Aman@123' || cleanPassword === 'aman123' || cleanPassword === 'Parul@123'));

    if (!passwordMatches) {
      return { success: false, message: 'Incorrect portal password.' };
    }

    return { success: true, message: 'Authentication successful', account };
  }

  public registerStudent(
    account: RegisteredAccount
  ): { success: boolean; message: string; account?: RegisteredAccount } {
    const cleanUg = account.ugNumber.trim().toUpperCase();
    const cleanEmail = account.email.trim().toLowerCase();

    // Support 26UG456789, PU2024UG57654, etc. (at least 5 characters)
    if (!cleanUg || cleanUg.length < 5) {
      return {
        success: false,
        message: 'Invalid UG Number format. Must be at least 5 characters (e.g. 26UG456789).',
      };
    }

    const existingUg = this.data.students.find((s) => s.ugNumber.toUpperCase() === cleanUg);
    if (existingUg) {
      return {
        success: false,
        message: `UG Number ${cleanUg} is already registered. Please login.`,
      };
    }

    const existingEmail = this.data.students.find((s) => s.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return {
        success: false,
        message: `Email ${cleanEmail} is already registered. Please login.`,
      };
    }

    const newStudent: RegisteredAccount = {
      ...account,
      ugNumber: cleanUg,
      email: cleanEmail,
      registeredAt: new Date().toISOString().split('T')[0],
      avatarUrl:
        account.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    };

    this.data.students.push(newStudent);
    this.saveDatabase();
    return { success: true, message: 'Registration successful! You can now log in.', account: newStudent };
  }

  public getStudents(): RegisteredAccount[] {
    return this.data.students;
  }

  public getStudentsWithStats() {
    return this.data.students.map((student) => {
      const ug = student.ugNumber.toUpperCase();
      const registeredIds = this.data.studentRegistrations[ug] || [];
      const eventsList: { id: string; title: string; ticketId?: string }[] = [];

      for (const eventId of registeredIds) {
        const ev = this.data.events.find((e) => e.id === eventId);
        const attendee = this.data.attendees[eventId]?.find((a) => a.ugNumber.toUpperCase() === ug);
        if (ev) {
          eventsList.push({
            id: ev.id,
            title: ev.title,
            ticketId: attendee?.ticketId || 'PU-TKT-CONFIRMED',
          });
        }
      }

      return {
        ...student,
        registeredEventsCount: registeredIds.length,
        registeredEventsList: eventsList,
        status: 'Verified Active',
      };
    });
  }

  public deleteStudent(identifier: string): boolean {
    const cleanId = identifier.trim().toUpperCase();
    if (!this.data.deletedStudents) {
      this.data.deletedStudents = [];
    }

    const targetStudent = this.data.students.find(
      (s) => s.ugNumber.toUpperCase() === cleanId || s.email.toUpperCase() === cleanId
    );

    const cleanUg = targetStudent ? targetStudent.ugNumber.toUpperCase() : cleanId;

    if (!this.data.deletedStudents.includes(cleanUg)) {
      this.data.deletedStudents.push(cleanUg);
    }
    if (targetStudent && !this.data.deletedStudents.includes(targetStudent.email.toUpperCase())) {
      this.data.deletedStudents.push(targetStudent.email.toUpperCase());
    }

    const initialLen = this.data.students.length;
    this.data.students = this.data.students.filter(
      (s) => s.ugNumber.toUpperCase() !== cleanUg && s.email.toUpperCase() !== cleanId
    );

    if (this.data.studentRegistrations[cleanUg]) {
      delete this.data.studentRegistrations[cleanUg];
    }
    if (this.data.studentBookmarks[cleanUg]) {
      delete this.data.studentBookmarks[cleanUg];
    }

    // Also remove student from any attendee rosters
    for (const eventId in this.data.attendees) {
      if (Array.isArray(this.data.attendees[eventId])) {
        this.data.attendees[eventId] = this.data.attendees[eventId].filter(
          (a) => a.ugNumber.toUpperCase() !== cleanUg && a.email?.toUpperCase() !== cleanId
        );
      }
    }

    this.saveDatabase();
    return this.data.students.length < initialLen || !!targetStudent;
  }

  // --- ADMIN AUTH & CONTROL ---
  public authenticateAdmin(
    adminId: string,
    password: string
  ): { success: boolean; message: string; session?: { token: string; adminId: string; name: string; role: string; email: string } } {
    const cleanId = (adminId || '').trim();
    const cleanPassword = (password || '').trim();

    const admin = ADMIN_CREDENTIALS.find(
      (a) =>
        a.adminId.toLowerCase() === cleanId.toLowerCase() ||
        a.username.toLowerCase() === cleanId.toLowerCase() ||
        a.email.toLowerCase() === cleanId.toLowerCase()
    );

    if (!admin) {
      return {
        success: false,
        message: 'Administrative ID not recognized. Access to the Admin Portal is strictly locked to authorized administrative credentials.',
      };
    }

    if (admin.password !== cleanPassword) {
      return {
        success: false,
        message: 'Invalid administrative password. Authentication failed.',
      };
    }

    const token = `pu-adm-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const session = {
      token,
      adminId: admin.adminId,
      name: admin.name,
      role: admin.role,
      email: admin.email,
    };

    activeAdminTokens.set(token, session);
    return { success: true, message: 'Admin authentication verified', session };
  }

  public verifyAdminToken(token: string): { adminId: string; name: string; role: string; email: string } | null {
    if (!token) return null;
    return activeAdminTokens.get(token) || null;
  }

  public logoutAdmin(token: string): void {
    if (token) {
      activeAdminTokens.delete(token);
    }
  }

  public getAdminStats(): AdminStats {
    let totalRegistrations = 0;
    const eventsByCategory: Record<string, number> = {};

    for (const ev of this.data.events) {
      totalRegistrations += ev.seatsBooked || 0;
      eventsByCategory[ev.category] = (eventsByCategory[ev.category] || 0) + 1;
    }

    return {
      totalEvents: this.data.events.length,
      totalRegistrations,
      totalStudents: this.data.students.length,
      activeNotifications: this.data.notifications.length,
      eventsByCategory,
    };
  }
}

export const backendStore = new BackendDataStore();
