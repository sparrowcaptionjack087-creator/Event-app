import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { backendStore } from './server/dataStore';

interface AuthenticatedAdminRequest extends Request {
  admin?: {
    adminId: string;
    name: string;
    role: string;
    email: string;
  };
}

// Admin Authorization Guard Middleware
function requireAdmin(req: AuthenticatedAdminRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];

  let token = '';
  if (typeof customHeader === 'string' && customHeader) {
    token = customHeader;
  } else if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  const admin = backendStore.verifyAdminToken(token);
  if (!admin) {
    res.status(403).json({
      success: false,
      error: 'Access Denied: Parul University Administrator Authorization Required.',
      message: 'Backend administrative access and event uploading are restricted to authorized administrators. Regular student accounts do not have access.',
    });
    return;
  }

  req.admin = admin;
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Parul University Events Backend Engine',
      port: PORT,
      timestamp: new Date().toISOString(),
      adminGateActive: true,
    });
  });

  // --- EVENTS API ---
  // Public (Students & Admin): List all events
  app.get('/api/events', (req: Request, res: Response) => {
    try {
      const events = backendStore.getEvents();
      res.json({ success: true, events });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Public (Students & Admin): Single event details
  app.get('/api/events/:id', (req: Request, res: Response) => {
    try {
      const event = backendStore.getEventById(req.params.id);
      if (!event) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      res.json({ success: true, event });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN ONLY: Upload / Create Event
  app.post('/api/events', requireAdmin, (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const eventData = req.body;
      if (!eventData.title || !eventData.category || !eventData.date || !eventData.venue) {
        res.status(400).json({
          success: false,
          error: 'Missing required event fields (title, category, date, venue).',
        });
        return;
      }

      const created = backendStore.createEvent(eventData, req.admin?.name || 'Administrator');
      res.status(201).json({
        success: true,
        message: 'Event published successfully to Parul University events repository.',
        event: created,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN ONLY: Update Event
  app.put('/api/events/:id', requireAdmin, (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const updated = backendStore.updateEvent(req.params.id, req.body, req.admin?.name || 'Administrator');
      if (!updated) {
        res.status(404).json({ success: false, error: 'Event not found to update.' });
        return;
      }
      res.json({
        success: true,
        message: 'Event updated and broadcast notifications synced.',
        event: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN ONLY: Delete Event
  app.delete('/api/events/:id', requireAdmin, (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const success = backendStore.deleteEvent(req.params.id);
      if (!success) {
        res.status(404).json({ success: false, error: 'Event not found.' });
        return;
      }
      res.json({ success: true, message: 'Event successfully removed from campus records.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Clear all events across Home, Alerts, and Categories
  app.post('/api/events/clear-all', (req: Request, res: Response) => {
    try {
      backendStore.clearAllEvents();
      res.json({ success: true, message: 'All campus events, attendee registrations, and event alerts have been cleared.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Clear all notifications / alerts
  app.post('/api/notifications/clear-all', (req: Request, res: Response) => {
    try {
      backendStore.clearAllNotifications();
      res.json({ success: true, message: 'All campus alerts and notifications have been cleared.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN ONLY: View Attendees / Registered Students for an event
  app.get('/api/events/:id/attendees', requireAdmin, (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const attendees = backendStore.getAttendees(req.params.id);
      res.json({ success: true, attendees, count: attendees.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // STUDENT & ADMIN: Register student for event
  app.post('/api/events/:id/register', (req: Request, res: Response) => {
    try {
      const { ugNumber, name, email, department } = req.body;
      if (!ugNumber || !name) {
        res.status(400).json({ success: false, error: 'Missing student enrollment details.' });
        return;
      }

      const result = backendStore.registerStudentForEvent(req.params.id, {
        ugNumber,
        name,
        email: email || `${ugNumber.toLowerCase()}@paruluniversity.ac.in`,
        department: department || 'Parul University',
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // STUDENT & ADMIN: Cancel registration
  app.post('/api/events/:id/cancel-registration', (req: Request, res: Response) => {
    try {
      const { ugNumber } = req.body;
      if (!ugNumber) {
        res.status(400).json({ success: false, error: 'Missing student UG Number.' });
        return;
      }

      const result = backendStore.cancelRegistration(req.params.id, ugNumber);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- NOTIFICATIONS API ---
  // Public: Fetch all alerts
  app.get('/api/notifications', (req: Request, res: Response) => {
    try {
      const notifications = backendStore.getNotifications();
      res.json({ success: true, notifications });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN ONLY: Broadcast announcement / alert
  app.post('/api/notifications', requireAdmin, (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { title, message, type, relatedEventId } = req.body;
      if (!title || !message) {
        res.status(400).json({ success: false, error: 'Title and message are required.' });
        return;
      }

      const created = backendStore.createNotification({
        title,
        message,
        type: type || 'urgent',
        relatedEventId,
      });

      res.status(201).json({
        success: true,
        message: 'Campus broadcast notification sent to all student feeds.',
        notification: created,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mark notification read
  app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
    try {
      const success = backendStore.markNotificationRead(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mark all notifications read
  app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
    try {
      backendStore.markAllNotificationsRead();
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Clear read notifications
  app.post('/api/notifications/clear-read', (req: Request, res: Response) => {
    try {
      backendStore.clearReadNotifications();
      res.json({ success: true, message: 'Read notifications cleared.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- AUTHENTICATION & STUDENT APIS ---
  // Student Login
  app.post('/api/auth/student/login', (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        res.status(400).json({ success: false, message: 'UG Number / Email and Password are required.' });
        return;
      }

      const result = backendStore.authenticateStudent(identifier, password);
      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Student Registration
  app.post('/api/auth/student/register', (req: Request, res: Response) => {
    try {
      const account = req.body;
      const result = backendStore.registerStudent(account);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get student's registered event IDs
  app.get('/api/student/:ug/registrations', (req: Request, res: Response) => {
    try {
      const registrations = backendStore.getStudentRegistrations(req.params.ug);
      res.json({ success: true, registrations });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- ADMIN AUTHENTICATION & SYSTEM METRICS ---
  // Admin Login
  app.post('/api/auth/admin/login', (req: Request, res: Response) => {
    try {
      const { adminId, password } = req.body;
      if (!adminId || !password) {
        res.status(400).json({
          success: false,
          message: 'Admin ID and Password are required for administrative login.',
        });
        return;
      }

      const result = backendStore.authenticateAdmin(adminId, password);
      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Token Verification
  app.get('/api/auth/admin/verify', (req: Request, res: Response) => {
    try {
      const token = (req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '')) as string;
      const admin = backendStore.verifyAdminToken(token);
      if (!admin) {
        res.status(401).json({ success: false, message: 'Invalid or expired administrative token.' });
        return;
      }
      res.json({ success: true, admin });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Logout
  app.post('/api/auth/admin/logout', (req: Request, res: Response) => {
    try {
      const token = (req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '')) as string;
      backendStore.logoutAdmin(token);
      res.json({ success: true, message: 'Admin session terminated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Stats (Requires Admin Auth)
  app.get('/api/admin/stats', requireAdmin, (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const stats = backendStore.getAdminStats();
      res.json({ success: true, stats, currentAdmin: req.admin });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN ONLY: Get all registered student accounts with their statistics
  app.get('/api/admin/students', requireAdmin, (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const students = backendStore.getStudentsWithStats();
      res.json({ success: true, students, count: students.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN ONLY: Export students directly in Excel CSV format with UTF-8 BOM
  app.get('/api/admin/students/export-csv', requireAdmin, (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const students = backendStore.getStudentsWithStats();
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
        'Registered Events Count',
        'Registered Events & Tickets',
        'Account Status',
      ];

      const csvRows: string[] = [headers.join(',')];

      students.forEach((s, index) => {
        const eventsNames = s.registeredEventsList
          .map((e) => `${e.title} [Ticket: ${e.ticketId || 'CONFIRMED'}]`)
          .join('; ');

        const row = [
          index + 1,
          `"${(s.ugNumber || '').replace(/"/g, '""')}"`,
          `"${(s.name || '').replace(/"/g, '""')}"`,
          `"${(s.email || '').replace(/"/g, '""')}"`,
          `"${(s.phone || '').replace(/"/g, '""')}"`,
          `"${(s.institute || 'Parul University').replace(/"/g, '""')}"`,
          `"${(s.department || '').replace(/"/g, '""')}"`,
          `"${(s.semester || 'Current Semester').replace(/"/g, '""')}"`,
          `"${(s.batch || 'Current Batch').replace(/"/g, '""')}"`,
          `"${(s.registeredAt || 'N/A').replace(/"/g, '""')}"`,
          s.registeredEventsCount,
          `"${eventsNames.replace(/"/g, '""')}"`,
          `"Verified Active"`,
        ];
        csvRows.push(row.join(','));
      });

      // Include UTF-8 Byte Order Mark (\uFEFF) for immediate native Microsoft Excel compatibility
      const csvContent = '\uFEFF' + csvRows.join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Parul_University_Registered_Students_Directory_${Date.now()}.csv"`
      );
      res.send(csvContent);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN ONLY: Delete a student account
  app.delete('/api/admin/students/:ugNumber', requireAdmin, (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const success = backendStore.deleteStudent(req.params.ugNumber);
      if (!success) {
        res.status(404).json({ success: false, error: 'Student account not found in repository.' });
        return;
      }
      res.json({ success: true, message: `Student account ${req.params.ugNumber} has been removed from university records.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Parul University Events Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
