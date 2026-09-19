import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { NotificationItem, DashboardId, EventItem, StudentProfile } from '../types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ticket,
  Award,
  Sparkles,
  Calendar,
  Filter,
  Check,
  Trash2,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Send,
} from 'lucide-react';

interface Dashboard4NotificationsProps {
  notifications: NotificationItem[];
  events: EventItem[];
  student: StudentProfile;
  onNavigate: (dashboardId: DashboardId) => void;
  onMarkAsRead: (notifId: string) => void;
  onMarkAllAsRead: () => void;
  onClearRead: () => void;
  onAddSimulatedNotification: (notif: NotificationItem) => void;
  onSelectEvent: (event: EventItem) => void;
  onViewPass: (event: EventItem) => void;
}

export const Dashboard4Notifications: React.FC<Dashboard4NotificationsProps> = ({
  notifications,
  events,
  student,
  onNavigate,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearRead,
  onAddSimulatedNotification,
  onSelectEvent,
  onViewPass,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const unreadCount = useMemo(() => {
    return (notifications || []).filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const list = notifications || [];
    if (filterType === 'all') return list;
    if (filterType === 'unread') return list.filter((n) => !n.isRead);
    return list.filter((n) => n.type === filterType);
  }, [notifications, filterType]);

  const handleSimulateAlert = () => {
    const sampleEvent = events[0];
    const newAlert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: sampleEvent
        ? `Live Update: Gates Open in 1 Hour for ${sampleEvent.title.slice(0, 22)}...`
        : 'Official Broadcast: Campus Event Hub Synchronized',
      message: sampleEvent
        ? `Security gates at ${sampleEvent.venue} will commence digital barcode scanning at 03:30 PM. Keep your UG ID (${student.ugNumber}) ready.`
        : `All unverified event updates were removed. As the app holder updates events in Categories, alerts flash here automatically.`,
      type: 'urgent',
      timestamp: 'Just now',
      date: 'Today, Live',
      isRead: false,
      relatedEventId: sampleEvent?.id,
    };
    onAddSimulatedNotification(newAlert);
  };

  const getTypeBadge = (type: NotificationItem['type']) => {
    switch (type) {
      case 'urgent':
        return {
          label: 'Urgent Alert',
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: AlertTriangle,
          iconColor: 'text-rose-600',
        };
      case 'pass':
        return {
          label: 'Entry Pass',
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: Ticket,
          iconColor: 'text-amber-600',
        };
      case 'registration':
        return {
          label: 'Registration',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Sparkles,
          iconColor: 'text-blue-600',
        };
      case 'certificate':
        return {
          label: 'Certificate',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: Award,
          iconColor: 'text-emerald-600',
        };
      case 'schedule':
      default:
        return {
          label: 'Schedule',
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: Clock,
          iconColor: 'text-slate-600',
        };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-md relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Dashboard 4
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
                {unreadCount} New Unread
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Events Notification Center</h2>
            <p className="text-xs text-slate-500">
              Official real-time updates for Parul University student body • UG: {student.ugNumber}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleSimulateAlert}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Alert</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            onClick={onClearRead}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-red-600 transition-colors"
            title="Clear read notifications"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={soundEnabled ? 'Alert chimes enabled' : 'Alert chimes muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* VERIFICATION & APP HOLDER SYNC BANNER */}
      <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-rose-700 text-white shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
              Official Live Alerts Feed • Real-Time Synchronized
            </h4>
            <p className="text-xs text-slate-700 mt-0.5">
              Unverified event updates were removed. As the app holder publishes or updates events in the Categories section, flash alerts and entry passes update here instantly.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('dashboard-5-categories')}
          className="shrink-0 px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition-colors"
        >
          Categories Manager →
        </button>
      </div>

      {/* FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'urgent', label: 'Urgent & Venue Changes' },
          { id: 'pass', label: 'Digital Passes' },
          { id: 'registration', label: 'Registration Deadlines' },
          { id: 'certificate', label: 'Certificates Released' },
        ].map((tab) => {
          const isSelected = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-200'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* NOTIFICATION FEED LIST */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-bold text-slate-800">
              {notifications.length === 0 ? 'All Event Alerts Have Been Cleared' : 'No notifications in this filter'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              {notifications.length === 0
                ? 'All previous campus events, preliminary notices, and alerts have been wiped clean. When new official announcements are broadcast, alerts will appear here in real-time.'
                : 'You are completely caught up! New schedule updates or event changes will appear here.'}
            </p>
            <button
              onClick={handleSimulateAlert}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-semibold"
            >
              Trigger Test University Notification
            </button>
          </div>
        ) : (
          (filteredNotifications || []).map((notif) => {
            const badge = getTypeBadge(notif.type);
            const BadgeIcon = badge.icon;
            const relatedEvent = notif.relatedEventId
              ? events.find((e) => e.id === notif.relatedEventId)
              : null;

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  notif.isRead
                    ? 'bg-white border-slate-200/80 shadow-2xs'
                    : 'bg-rose-50/40 border-rose-200 shadow-xs ring-1 ring-rose-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Notification Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badge.bg}`}
                    >
                      <BadgeIcon className={`w-5 h-5 ${badge.iconColor}`} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {notif.timestamp} • {notif.date}
                        </span>
                        {!notif.isRead && (
                          <span className="inline-block w-2 h-2 rounded-full bg-rose-600"></span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {notif.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                        {notif.message}
                      </p>

                      {/* Associated Event pill if available */}
                      {relatedEvent && (
                        <div className="pt-2 flex items-center flex-wrap gap-2">
                          <button
                            onClick={() => {
                              onSelectEvent(relatedEvent);
                              onNavigate('dashboard-6-details');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-800 hover:text-rose-800 text-xs font-semibold transition-colors border border-slate-200"
                          >
                            <Calendar className="w-3.5 h-3.5 text-rose-600" />
                            <span>View {relatedEvent.title.slice(0, 30)}...</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {notif.type === 'pass' && (
                            <button
                              onClick={() => onViewPass(relatedEvent)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              <span>Show Entry Pass QR</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mark as read tick */}
                  {!notif.isRead && (
                    <button
                      onClick={() => onMarkAsRead(notif.id)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-100 text-slate-400 hover:text-rose-700 border border-slate-200 transition-colors shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* STUDENT SMS & NOTIFICATION PREFERENCES FOOTER */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Direct Push & WhatsApp Notifications</h4>
          </div>
          <p className="text-xs text-slate-400">
            Emergency alerts & pass scans are mirrored to your registered contact ({student.phone})
          </p>
        </div>
        <button
          onClick={() => onNavigate('dashboard-7-profile')}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors"
        >
          Manage Alerts in Profile →
        </button>
      </div>
    </div>
  );
};
