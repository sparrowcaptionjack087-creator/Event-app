import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardId, EventItem, NotificationItem, StudentProfile, RegisteredAccount } from './types';
import { EVENTS_DATA, INITIAL_NOTIFICATIONS, INITIAL_STUDENT_PROFILE } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Dashboard2Login } from './components/Dashboard2Login';
import { Dashboard3Home } from './components/Dashboard3Home';
import { Dashboard4Notifications } from './components/Dashboard4Notifications';
import { Dashboard5Categories } from './components/Dashboard5Categories';
import { Dashboard6EventDetails } from './components/Dashboard6EventDetails';
import { Dashboard7Profile } from './components/Dashboard7Profile';
import { DashboardAdmin } from './components/DashboardAdmin';
import { EventPassModal } from './components/EventPassModal';
import { ParulLogo } from './components/ParulLogo';
import { api } from './utils/api';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Lock,
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pu_student_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [currentDashboard, setCurrentDashboard] = useState<DashboardId>(() => {
    try {
      const savedAuth = localStorage.getItem('pu_student_logged_in') === 'true';
      return savedAuth ? 'dashboard-3-home' : 'dashboard-2-login';
    } catch {
      return 'dashboard-2-login';
    }
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      localStorage.removeItem('pu_app_holder_events');
    } catch {}
    return [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      localStorage.removeItem('pu_app_notifications');
    } catch {}
    return [];
  });
  const [student, setStudent] = useState<StudentProfile>(() => {
    try {
      const savedProfile = localStorage.getItem('pu_current_student_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        return {
          ...INITIAL_STUDENT_PROFILE,
          ...parsed,
          registeredEventIds: [],
          bookmarkedEventIds: [],
        };
      }
      const savedUg = localStorage.getItem('pu_student_ug');
      if (savedUg) {
        return {
          ...INITIAL_STUDENT_PROFILE,
          ugNumber: savedUg,
          registeredEventIds: [],
          bookmarkedEventIds: [],
        };
      }
    } catch {}
    return {
      ...INITIAL_STUDENT_PROFILE,
      name: 'Aman Singh',
      ugNumber: 'PU2024UG57654',
      email: 'aman576544534@gmail.com',
      phone: '+91 98765 43210',
      institute: 'PIET (Parul Institute of Engineering & Technology)',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      batch: '2023 - 2027',
      registeredEventIds: [],
      bookmarkedEventIds: [],
    };
  });

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [viewPassEvent, setViewPassEvent] = useState<EventItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Sync initial events and notifications from Express backend repository
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const backendEvents = await api.fetchEvents();
        if (Array.isArray(backendEvents)) {
          setEvents(backendEvents);
          setSelectedEvent(backendEvents[0] || null);
        }
      } catch (e) {
        console.warn('Backend events fetch fallback:', e);
      }

      try {
        const backendNotifs = await api.fetchNotifications();
        if (Array.isArray(backendNotifs)) {
          setNotifications(backendNotifs);
        }
      } catch (e) {
        console.warn('Backend notifications fetch fallback:', e);
      }
    };

    fetchInitialData();
  }, []);

  // Sync student registrations with backend
  useEffect(() => {
    if (isLoggedIn && student.ugNumber) {
      api.fetchStudentRegistrations(student.ugNumber).then((regIds) => {
        if (Array.isArray(regIds) && regIds.length > 0) {
          setStudent((prev) => ({
            ...prev,
            registeredEventIds: Array.from(new Set([...prev.registeredEventIds, ...regIds])),
          }));
        }
      });
    }
  }, [isLoggedIn, student.ugNumber]);

  const handleNavigate = (dashboardId: DashboardId) => {
    // Admin dashboard is protected by its own administrative security gate
    if (dashboardId === 'dashboard-admin') {
      setCurrentDashboard('dashboard-admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Strict student authentication guard: Without login, student interface cannot be opened
    if (!isLoggedIn && dashboardId !== 'dashboard-2-login') {
      showToast('🔒 Access Restricted: Please sign in with your registered student credentials to open the app.');
      setCurrentDashboard('dashboard-2-login');
      return;
    }
    setCurrentDashboard(dashboardId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (ugNumber: string, studentName?: string, account?: RegisteredAccount) => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('pu_student_logged_in', 'true');
      localStorage.setItem('pu_student_ug', ugNumber);
      if (account) {
        localStorage.setItem(
          'pu_current_student_profile',
          JSON.stringify({
            name: account.name,
            ugNumber: account.ugNumber,
            email: account.email,
            phone: account.phone,
            department: account.department,
            institute: account.institute,
            semester: account.semester || '6th Semester',
            batch: account.batch || '2023 - 2027',
          })
        );
      }
    } catch {}

    const resolvedName = studentName || account?.name || 'Aman Singh';

    setStudent((prev) => ({
      ...prev,
      name: resolvedName,
      ugNumber,
      email: account?.email || (ugNumber === 'PU2024UG57654' ? 'aman576544534@gmail.com' : prev.email),
      phone: account?.phone || prev.phone,
      department: account?.department || prev.department,
      institute: account?.institute || prev.institute,
      semester: account?.semester || prev.semester,
      batch: account?.batch || prev.batch,
    }));

    showToast(`✓ Authentication Verified! Welcome, ${resolvedName} (${ugNumber})`);
    setCurrentDashboard('dashboard-3-home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('pu_student_logged_in');
      localStorage.removeItem('pu_student_ug');
      localStorage.removeItem('pu_current_student_profile');
    } catch {}
    showToast('🔒 Signed out. Application interface locked until student sign-in.');
    setCurrentDashboard('dashboard-2-login');
  };

  const handleToggleRegister = async (eventId: string) => {
    const isAlready = student.registeredEventIds.includes(eventId);
    const eventObj = events.find((e) => e.id === eventId);
    if (!eventObj) return;

    if (isAlready) {
      setStudent((prev) => ({
        ...prev,
        registeredEventIds: prev.registeredEventIds.filter((id) => id !== eventId),
      }));
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, seatsBooked: Math.max(0, (e.seatsBooked || 1) - 1) } : e
        )
      );
      showToast(`Registration cancelled for: ${eventObj.title}`);

      // Sync cancellation to backend
      try {
        await api.cancelRegistration(eventId, student.ugNumber);
      } catch (err) {
        console.warn('Backend cancel sync error:', err);
      }
    } else {
      setStudent((prev) => ({
        ...prev,
        registeredEventIds: [...prev.registeredEventIds, eventId],
      }));
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, seatsBooked: (e.seatsBooked || 0) + 1 } : e))
      );

      // Auto-generate pass notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Registration Confirmed: ${eventObj.title}`,
        message: `Your entry pass with barcode for ${eventObj.title} has been generated. Show your UG ${student.ugNumber} at the entrance.`,
        type: 'pass',
        timestamp: 'Just now',
        date: 'Today',
        isRead: false,
        relatedEventId: eventId,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      showToast(`🎉 Successfully Registered! Digital Entry Pass generated for UG: ${student.ugNumber}`);

      // Persist registration to backend
      try {
        const res = await api.registerForEvent(eventId, {
          ugNumber: student.ugNumber,
          name: student.name,
          email: student.email,
          department: student.department,
        });
        if (res.event) {
          setEvents((prev) => prev.map((e) => (e.id === eventId ? res.event! : e)));
        }
      } catch (err) {
        console.warn('Backend register sync error:', err);
      }
    }
  };

  const handleToggleBookmark = (eventId: string) => {
    const isBookmarked = student.bookmarkedEventIds.includes(eventId);
    const eventObj = events.find((e) => e.id === eventId);
    if (!eventObj) return;

    if (isBookmarked) {
      setStudent((prev) => ({
        ...prev,
        bookmarkedEventIds: prev.bookmarkedEventIds.filter((id) => id !== eventId),
      }));
      showToast(`Removed from saved events: ${eventObj.title}`);
    } else {
      setStudent((prev) => ({
        ...prev,
        bookmarkedEventIds: [...prev.bookmarkedEventIds, eventId],
      }));
      showToast(`★ Saved to your bookmarks: ${eventObj.title}`);
    }
  };

  const handleMarkAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
    api.markNotificationRead(notifId).catch(() => {});
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    api.markAllNotificationsRead().catch(() => {});
    showToast('✓ All notifications marked as read');
  };

  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    api.clearReadNotifications().catch(() => {});
    showToast('Cleared read notifications');
  };

  const handleAddAppHolderEvent = (newEvent: EventItem) => {
    const updated = [newEvent, ...events];
    setEvents(updated);
    setSelectedEvent(newEvent);
    try {
      const appHolderEvents = updated.filter((e) => e.uploadedByAppHolder);
      localStorage.setItem('pu_app_holder_events', JSON.stringify(appHolderEvents));
    } catch {}

    // Synchronize alert across all sections immediately
    const newNotif: NotificationItem = {
      id: `notif-add-${Date.now()}`,
      title: `★ Official Event Published: ${newEvent.title}`,
      message: `Official event announced by app holder in ${newEvent.category}! Scheduled for ${newEvent.date} (${newEvent.time}) at ${newEvent.venue}. Registration is now open across all sections.`,
      type: 'urgent',
      timestamp: 'Just now',
      date: 'Today, Live',
      isRead: false,
      relatedEventId: newEvent.id,
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    try {
      localStorage.setItem('pu_app_notifications', JSON.stringify(updatedNotifs));
    } catch {}

    showToast(`✓ Official Event "${newEvent.title}" published! Synced to Home, Alerts, and Categories.`);
  };

  const handleUpdateAppHolderEvent = (updatedEvent: EventItem) => {
    const updated = events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
    setEvents(updated);
    if (selectedEvent?.id === updatedEvent.id) {
      setSelectedEvent(updatedEvent);
    }
    try {
      const appHolderEvents = updated.filter((e) => e.uploadedByAppHolder);
      localStorage.setItem('pu_app_holder_events', JSON.stringify(appHolderEvents));
    } catch {}

    // Synchronize live flash update alert across all sections!
    const updateNotif: NotificationItem = {
      id: `notif-update-${Date.now()}`,
      title: `⚡ Live Flash: Event Updated - ${updatedEvent.title}`,
      message: `The app holder updated details for "${updatedEvent.title}" (${updatedEvent.category}). Venue: ${updatedEvent.venue}, Date: ${updatedEvent.date} (${updatedEvent.time}). Details & passes refreshed across all dashboards.`,
      type: 'schedule',
      timestamp: 'Just now',
      date: 'Today, Live',
      isRead: false,
      relatedEventId: updatedEvent.id,
    };
    const updatedNotifs = [updateNotif, ...notifications];
    setNotifications(updatedNotifs);
    try {
      localStorage.setItem('pu_app_notifications', JSON.stringify(updatedNotifs));
    } catch {}

    showToast(`⚡ Event "${updatedEvent.title}" updated! All sections refreshed.`);
  };

  const handleDeleteAppHolderEvent = (eventId: string) => {
    const updated = events.filter((e) => e.id !== eventId);
    setEvents(updated);
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(updated[0] || null);
    }
    try {
      const appHolderEvents = updated.filter((e) => e.uploadedByAppHolder);
      localStorage.setItem('pu_app_holder_events', JSON.stringify(appHolderEvents));
    } catch {}
    showToast('✓ Event removed successfully.');
  };

  const handleAddSimulatedNotification = (notif: NotificationItem) => {
    setNotifications((prev) => [notif, ...prev]);
    showToast(`🔔 New Live Notification: ${notif.title}`);
  };

  const handleUpdateProfile = (updated: Partial<StudentProfile>) => {
    setStudent((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('pu_current_student_profile', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('✓ Student Profile updated successfully');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-rose-600 selection:text-white pb-14 lg:pb-0">
      {/* PERSISTENT APP NAVBAR */}
      <Navbar
        currentDashboard={currentDashboard}
        onNavigate={handleNavigate}
        unreadCount={unreadCount}
        isLoggedIn={isLoggedIn}
        ugNumber={student.ugNumber}
        avatarUrl={student.avatarUrl}
      />

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 max-w-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT CANVAS */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        {currentDashboard === 'dashboard-admin' ? (
          <DashboardAdmin
            events={events}
            onEventCreated={(newEvent) => {
              setEvents((prev) => [newEvent, ...prev]);
              setSelectedEvent(newEvent);
            }}
            onEventUpdated={(updatedEvent) => {
              setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
              if (selectedEvent?.id === updatedEvent.id) {
                setSelectedEvent(updatedEvent);
              }
            }}
            onEventDeleted={(deletedId) => {
              setEvents((prev) => prev.filter((e) => e.id !== deletedId));
              if (selectedEvent?.id === deletedId) {
                setSelectedEvent(events.find((e) => e.id !== deletedId) || null);
              }
            }}
            onAllEventsCleared={() => {
              setEvents([]);
              setSelectedEvent(null);
              setNotifications([]);
              try {
                localStorage.removeItem('pu_app_holder_events');
                localStorage.removeItem('pu_app_notifications');
              } catch {}
            }}
            onNotificationBroadcast={() => {
              api.fetchNotifications().then((list) => {
                if (list.length > 0) setNotifications(list);
              });
            }}
            onBackToStudentPortal={() => {
              setCurrentDashboard(isLoggedIn ? 'dashboard-3-home' : 'dashboard-2-login');
            }}
            showToast={showToast}
          />
        ) : !isLoggedIn ? (
          /* When NOT logged in, ONLY the login interface is rendered as the front section. The internal app is locked. */
          <Dashboard2Login
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
            currentUgNumber=""
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        ) : (
          /* When logged in, the user can access the full app interface */
          <>
            {currentDashboard === 'dashboard-2-login' && (
              <Dashboard2Login
                onLoginSuccess={handleLoginSuccess}
                onNavigate={handleNavigate}
                currentUgNumber={student.ugNumber}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
              />
            )}

            {currentDashboard === 'dashboard-3-home' && (
              <Dashboard3Home
                events={events}
                student={student}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                onNavigate={handleNavigate}
                onToggleRegister={handleToggleRegister}
                onToggleBookmark={handleToggleBookmark}
                onViewPass={(ev) => setViewPassEvent(ev)}
              />
            )}

            {currentDashboard === 'dashboard-4-notifications' && (
              <Dashboard4Notifications
                notifications={notifications}
                events={events}
                student={student}
                onNavigate={handleNavigate}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearRead={handleClearRead}
                onAddSimulatedNotification={handleAddSimulatedNotification}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                onViewPass={(ev) => setViewPassEvent(ev)}
              />
            )}

            {currentDashboard === 'dashboard-5-categories' && (
              <Dashboard5Categories
                events={events}
                student={student}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                onNavigate={handleNavigate}
                onToggleRegister={handleToggleRegister}
                onViewPass={(ev) => setViewPassEvent(ev)}
                onToggleBookmark={handleToggleBookmark}
              />
            )}

            {currentDashboard === 'dashboard-6-details' && (
              <Dashboard6EventDetails
                events={events}
                selectedEvent={selectedEvent}
                student={student}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                onToggleRegister={handleToggleRegister}
                onToggleBookmark={handleToggleBookmark}
                onViewPass={(ev) => setViewPassEvent(ev)}
                onNavigate={handleNavigate}
              />
            )}

            {currentDashboard === 'dashboard-7-profile' && (
              <Dashboard7Profile
                student={student}
                events={events}
                onUpdateProfile={handleUpdateProfile}
                onNavigate={handleNavigate}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                onViewPass={(ev) => setViewPassEvent(ev)}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </div>

      {/* DIGITAL ENTRY PASS QR MODAL */}
      <EventPassModal
        event={viewPassEvent}
        student={student}
        isOpen={!!viewPassEvent}
        onClose={() => setViewPassEvent(null)}
      />

      {/* UNIVERSITY FOOTER */}
      <footer className="mt-12 bg-slate-900 text-slate-400 border-t border-slate-800 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <ParulLogo size="md" variant="dark" showTagline={true} />

            <div className="flex items-center flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> NAAC A++ Accredited
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400" /> Vadodara, Gujarat 391760
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400" /> Helpline: 02668-260300
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="text-slate-400 text-center sm:text-left">
              © {new Date().getFullYear()} Parul University. All Rights Reserved. Student Events Notification System.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <button
                onClick={() => handleNavigate('dashboard-2-login')}
                className="hover:text-white"
              >
                Login
              </button>
              {isLoggedIn && (
                <>
                  <button
                    onClick={() => handleNavigate('dashboard-3-home')}
                    className="hover:text-white"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => handleNavigate('dashboard-4-notifications')}
                    className="hover:text-white"
                  >
                    Alerts
                  </button>
                  <button
                    onClick={() => handleNavigate('dashboard-5-categories')}
                    className="hover:text-white"
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => handleNavigate('dashboard-6-details')}
                    className="hover:text-white"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleNavigate('dashboard-7-profile')}
                    className="hover:text-white"
                  >
                    Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
