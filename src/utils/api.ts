import { EventItem, NotificationItem, RegisteredAccount, EventAttendee, AdminStats, AdminSession, AdminStudentAccount } from '../types';
import * as XLSX from 'xlsx';

const ADMIN_TOKEN_KEY = 'pu_admin_session_token';
const ADMIN_PROFILE_KEY = 'pu_admin_session_profile';

export const api = {
  // --- ADMIN TOKEN UTILS ---
  getAdminToken(): string | null {
    try {
      const profile = this.getAdminProfile();
      if (!profile) return null;
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getAdminProfile(): AdminSession | null {
    try {
      const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Strictly verify that the administrative session belongs to 26UG030984
      if (parsed && (parsed.adminId?.toUpperCase() === '26UG030984' || parsed.username?.toUpperCase() === '26UG030984')) {
        return parsed;
      }
      // Any other or stale session must be purged immediately
      this.clearAdminSession();
      return null;
    } catch {
      return null;
    }
  },

  saveAdminSession(session: AdminSession): void {
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, session.token);
      localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(session));
    } catch {}
  },

  clearAdminSession(): void {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_PROFILE_KEY);
    } catch {}
  },

  // --- EVENTS ---
  async fetchEvents(): Promise<EventItem[]> {
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.events || [];
    } catch (err) {
      console.error('[API] Failed to fetch events from backend:', err);
      throw err;
    }
  },

  async fetchEvent(id: string): Promise<EventItem | null> {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.event || null;
    } catch (err) {
      console.error(`[API] Failed to fetch event ${id}:`, err);
      return null;
    }
  },

  async uploadEvent(eventData: Partial<EventItem> & { broadcastNotification?: boolean }): Promise<{ success: boolean; event?: EventItem; message?: string; error?: string }> {
    const token = this.getAdminToken();
    if (!token) {
      return { success: false, error: 'Administrative authentication token is missing. Please sign in as Admin.' };
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(eventData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || data.message || 'Failed to publish event.' };
      }
      return { success: true, event: data.event, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error while publishing event to backend.' };
    }
  },

  async updateEvent(id: string, eventData: Partial<EventItem>): Promise<{ success: boolean; event?: EventItem; message?: string; error?: string }> {
    const token = this.getAdminToken();
    if (!token) {
      return { success: false, error: 'Administrative credentials required.' };
    }

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(eventData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update event in backend.' };
      }
      return { success: true, event: data.event, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteEvent(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const token = this.getAdminToken();
    if (!token) {
      return { success: false, error: 'Administrative credentials required.' };
    }

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': token,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete event from backend.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async clearAllEvents(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const token = this.getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers['x-admin-token'] = token;
      const res = await fetch('/api/events/clear-all', {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to clear events.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async clearAllNotifications(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/notifications/clear-all', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to clear alerts.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async fetchAttendees(eventId: string): Promise<EventAttendee[]> {
    const token = this.getAdminToken();
    if (!token) return [];

    try {
      const res = await fetch(`/api/events/${eventId}/attendees`, {
        headers: {
          'x-admin-token': token,
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.attendees || [];
    } catch {
      return [];
    }
  },

  // --- REGISTRATION ---
  async registerForEvent(
    eventId: string,
    student: { ugNumber: string; name: string; email: string; department: string }
  ): Promise<{ success: boolean; message: string; ticketId?: string; event?: EventItem }> {
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Server connection error during registration.' };
    }
  },

  async cancelRegistration(
    eventId: string,
    ugNumber: string
  ): Promise<{ success: boolean; message: string; event?: EventItem }> {
    try {
      const res = await fetch(`/api/events/${eventId}/cancel-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ugNumber }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Server connection error.' };
    }
  },

  async fetchStudentRegistrations(ugNumber: string): Promise<string[]> {
    try {
      const res = await fetch(`/api/student/${ugNumber}/registrations`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.registrations || [];
    } catch {
      return [];
    }
  },

  // --- NOTIFICATIONS ---
  async fetchNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.notifications || [];
    } catch (err) {
      console.error('[API] Failed to fetch notifications:', err);
      return [];
    }
  },

  async broadcastNotification(notifData: {
    title: string;
    message: string;
    type?: string;
    relatedEventId?: string;
  }): Promise<{ success: boolean; notification?: NotificationItem; error?: string }> {
    const token = this.getAdminToken();
    if (!token) return { success: false, error: 'Admin authentication required.' };

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(notifData),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, notification: data.notification };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch {}
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    } catch {}
  },

  async clearReadNotifications(): Promise<void> {
    try {
      await fetch('/api/notifications/clear-read', { method: 'POST' });
    } catch {}
  },

  // --- AUTHENTICATION ---
  async studentLogin(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; message: string; account?: RegisteredAccount }> {
    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Server error during login.' };
    }
  },

  async studentRegister(
    account: RegisteredAccount
  ): Promise<{ success: boolean; message: string; account?: RegisteredAccount }> {
    try {
      const res = await fetch('/api/auth/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Server error during student registration.' };
    }
  },

  // --- ADMIN AUTH & CONTROL ---
  async adminLogin(
    adminId: string,
    password: string
  ): Promise<{ success: boolean; message: string; session?: AdminSession }> {
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        this.saveAdminSession(data.session);
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error connecting to backend administrative gateway.' };
    }
  },

  async verifyAdminSession(): Promise<boolean> {
    const token = this.getAdminToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/auth/admin/verify', {
        headers: { 'x-admin-token': token },
      });
      if (res.ok) {
        const data = await res.json();
        return data.success === true;
      }
      this.clearAdminSession();
      return false;
    } catch {
      return false;
    }
  },

  async adminLogout(): Promise<void> {
    const token = this.getAdminToken();
    if (token) {
      try {
        await fetch('/api/auth/admin/logout', {
          method: 'POST',
          headers: { 'x-admin-token': token },
        });
      } catch {}
    }
    this.clearAdminSession();
  },

  async fetchAdminStats(): Promise<AdminStats | null> {
    const token = this.getAdminToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-token': token },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.stats || null;
    } catch {
      return null;
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      return res.ok;
    } catch {
      return false;
    }
  },

  // --- ADMIN STUDENT DIRECTORY & EXCEL SERVICES ---
  async fetchAdminStudents(): Promise<AdminStudentAccount[]> {
    const token = this.getAdminToken();
    if (!token) return [];

    try {
      const res = await fetch('/api/admin/students', {
        headers: { 'x-admin-token': token },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.students || [];
    } catch (err) {
      console.error('[API] Failed to fetch admin students:', err);
      return [];
    }
  },

  async deleteAdminStudent(ugNumber: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const token = this.getAdminToken();
    if (!token) {
      return { success: false, error: 'Admin session required.' };
    }

    try {
      const res = await fetch(`/api/admin/students/${encodeURIComponent(ugNumber)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete student account.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  exportStudentsToExcel(students: AdminStudentAccount[], filenamePrefix = 'Parul_University_Students_Directory'): void {
    try {
      const sheetData = students.map((s, idx) => ({
        'S.No.': idx + 1,
        'UG Number (Enrollment ID)': s.ugNumber,
        'Full Student Name': s.name,
        'Student Email': s.email,
        'Contact Phone': s.phone || 'N/A',
        'Institute': s.institute || 'Parul University',
        'Department / Faculty': s.department,
        'Semester': s.semester || 'Current Semester',
        'Batch': s.batch || 'Current Batch',
        'Registration Date': s.registeredAt || 'N/A',
        'Events Registered Count': s.registeredEventsCount || 0,
        'Registered Event Passes': s.registeredEventsList?.map((e) => `${e.title} [Ticket: ${e.ticketId || 'CONFIRMED'}]`).join('; ') || 'No registered events',
        'Account Verification Status': s.status || 'Verified Active',
      }));

      const worksheet = XLSX.utils.json_to_sheet(sheetData);

      // Customize column widths for professional Excel appearance
      worksheet['!cols'] = [
        { wch: 8 },  // S.No.
        { wch: 22 }, // UG Number
        { wch: 26 }, // Full Name
        { wch: 32 }, // Email
        { wch: 18 }, // Phone
        { wch: 36 }, // Institute
        { wch: 38 }, // Department
        { wch: 16 }, // Semester
        { wch: 16 }, // Batch
        { wch: 18 }, // Registered Date
        { wch: 24 }, // Events Registered Count
        { wch: 50 }, // Registered Event Passes
        { wch: 22 }, // Verification Status
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registered Students');

      const dateStamp = new Date().toISOString().split('T')[0];
      const filename = `${filenamePrefix}_${dateStamp}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (err) {
      console.error('[Excel Export] Failed to generate .xlsx file:', err);
      // Fallback to CSV if xlsx throws
      this.exportStudentsToCsv(students, filenamePrefix);
    }
  },

  exportStudentsToCsv(students: AdminStudentAccount[], filenamePrefix = 'Parul_University_Students_Directory'): void {
    try {
      const headers = [
        'S.No.',
        'UG Number (Enrollment ID)',
        'Full Name',
        'Student Email',
        'Contact Phone',
        'Institute',
        'Department / Faculty',
        'Semester',
        'Batch',
        'Registration Date',
        'Events Registered Count',
        'Registered Event Passes',
        'Account Status',
      ];

      const rows: string[] = [headers.join(',')];

      students.forEach((s, idx) => {
        const eventsNames = (s.registeredEventsList || [])
          .map((e) => `${e.title} [Ticket: ${e.ticketId || 'CONFIRMED'}]`)
          .join('; ');

        const row = [
          idx + 1,
          `"${(s.ugNumber || '').replace(/"/g, '""')}"`,
          `"${(s.name || '').replace(/"/g, '""')}"`,
          `"${(s.email || '').replace(/"/g, '""')}"`,
          `"${(s.phone || '').replace(/"/g, '""')}"`,
          `"${(s.institute || 'Parul University').replace(/"/g, '""')}"`,
          `"${(s.department || '').replace(/"/g, '""')}"`,
          `"${(s.semester || 'Current Semester').replace(/"/g, '""')}"`,
          `"${(s.batch || 'Current Batch').replace(/"/g, '""')}"`,
          `"${(s.registeredAt || 'N/A').replace(/"/g, '""')}"`,
          s.registeredEventsCount || 0,
          `"${eventsNames.replace(/"/g, '""')}"`,
          `"Verified Active"`,
        ];
        rows.push(row.join(','));
      });

      // UTF-8 Byte Order Mark for Excel
      const csvContent = '\uFEFF' + rows.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[CSV Export] Failed to generate CSV:', err);
    }
  },

  async copyStudentsForExcel(students: AdminStudentAccount[]): Promise<boolean> {
    try {
      const headers = [
        'S.No.',
        'UG Number',
        'Full Name',
        'Student Email',
        'Contact Phone',
        'Institute',
        'Department',
        'Semester',
        'Batch',
        'Registration Date',
        'Events Registered',
        'Status',
      ].join('\t');

      const rows = students.map((s, idx) =>
        [
          idx + 1,
          s.ugNumber,
          s.name,
          s.email,
          s.phone || 'N/A',
          s.institute || 'Parul University',
          s.department,
          s.semester || 'Current',
          s.batch || 'Current',
          s.registeredAt || 'N/A',
          s.registeredEventsCount || 0,
          s.status || 'Verified Active',
        ].join('\t')
      );

      const tsv = [headers, ...rows].join('\n');
      await navigator.clipboard.writeText(tsv);
      return true;
    } catch (err) {
      console.error('[Clipboard] Failed to copy TSV:', err);
      return false;
    }
  },
};
