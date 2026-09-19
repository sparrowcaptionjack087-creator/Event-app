import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { EventItem, StudentProfile, DashboardId } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Ticket,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  Building,
  UserCheck,
  Sparkles,
  ExternalLink,
  Link as LinkIcon,
  CreditCard,
  QrCode,
  Wallet,
  Copy,
  Check,
} from 'lucide-react';

interface Dashboard6EventDetailsProps {
  events: EventItem[];
  selectedEvent: EventItem | null;
  student: StudentProfile;
  onSelectEvent: (event: EventItem) => void;
  onToggleRegister: (eventId: string) => void;
  onToggleBookmark: (eventId: string) => void;
  onViewPass: (event: EventItem) => void;
  onNavigate: (dashboardId: DashboardId) => void;
}

export const Dashboard6EventDetails: React.FC<Dashboard6EventDetailsProps> = ({
  events,
  selectedEvent,
  student,
  onSelectEvent,
  onToggleRegister,
  onToggleBookmark,
  onViewPass,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'coordinators' | 'rules'>('overview');
  const [showShareToast, setShowShareToast] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleCopyUpi = (upiId: string) => {
    navigator.clipboard?.writeText?.(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  if (!selectedEvent) {
    return (
      <div className="max-w-3xl mx-auto py-14 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-800 mx-auto flex items-center justify-center border border-rose-100">
          <Calendar className="w-8 h-8 text-rose-700" />
        </div>
        <h3 className="text-xl font-black text-slate-900">No Official Event Selected</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          All preliminary unverified event updates were removed. When the app holder publishes or updates an event from the Categories section, complete schedules, coordinators, and registrations will display here.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard-5-categories')}
            className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition-colors"
          >
            Go to Categories Section
          </button>
        </div>
      </div>
    );
  }

  const isRegistered = Boolean(student?.registeredEventIds?.includes(selectedEvent.id));
  const isBookmarked = Boolean(student?.bookmarkedEventIds?.includes(selectedEvent.id));

  const handleRegisterWithConfetti = () => {
    onToggleRegister(selectedEvent.id);
    if (!isRegistered) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#800020', '#e11d48', '#f59e0b', '#10b981'],
        });
      } catch (err) {
        // Safe fallback if confetti blocked
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <div className="space-y-6 pb-14 animate-fade-in max-w-5xl mx-auto">
      {/* TOP NAVIGATION & EVENT SWITCHER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('dashboard-3-home')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Back to home"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
              Dashboard 6 • Event Details
            </span>
            <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
              {selectedEvent.title}
            </h3>
          </div>
        </div>

        {/* Quick event selector dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 hidden md:inline">Switch Event:</span>
          <select
            value={selectedEvent.id}
            onChange={(e) => {
              const ev = events.find((item) => item.id === e.target.value);
              if (ev) onSelectEvent(ev);
            }}
            className="w-full sm:w-64 py-1.5 px-3 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-600 focus:outline-none"
          >
            {(events || []).map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-950 text-white min-h-[340px] sm:min-h-[400px] flex flex-col justify-end p-6 sm:p-10">
        <div className="absolute inset-0 z-0">
          <img
            src={selectedEvent.bannerUrl}
            alt={selectedEvent.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
          <div className="absolute inset-0 bg-rose-950/25 mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white">
              {selectedEvent.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md flex items-center gap-1 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> NAAC A++ Verified Event
            </span>
            <span className="text-xs text-amber-300 font-medium">
              Registration closes: {selectedEvent.registrationDeadline}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            {selectedEvent.title}
          </h1>

          <div className="flex items-center flex-wrap gap-4 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-rose-400" /> {selectedEvent.date}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-amber-400" /> {selectedEvent.time}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-rose-400" /> {selectedEvent.venue}
            </span>
          </div>

          {/* Registration & Action Bar */}
          <div className="flex items-center flex-wrap gap-3 pt-3">
            <button
              onClick={handleRegisterWithConfetti}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-lg transition-all ${
                isRegistered
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                  : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white hover:scale-105 active:scale-95'
              }`}
            >
              {isRegistered ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You Are Registered! (Click to Cancel)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Register Now (UG: {student.ugNumber})</span>
                </>
              )}
            </button>

            {isRegistered && (
              <button
                onClick={() => onViewPass(selectedEvent)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
              >
                <Ticket className="w-4 h-4" />
                <span>Show Digital Pass QR</span>
              </button>
            )}

            {selectedEvent.registrationLink && (
              <a
                href={selectedEvent.registrationLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 border border-white/25 backdrop-blur-md"
              >
                <LinkIcon className="w-4 h-4 text-rose-300" />
                <span>Registration Form</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}

            {selectedEvent.paymentLink && (
              <a
                href={selectedEvent.paymentLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Fee Online</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}

            <button
              onClick={() => onToggleBookmark(selectedEvent.id)}
              className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md transition-colors"
              title="Bookmark Event"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-amber-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleShare}
              className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md transition-colors"
              title="Share Event"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {showShareToast && (
            <div className="text-xs text-amber-300 font-semibold bg-slate-900/90 px-3 py-1.5 rounded-xl inline-block">
              ✓ Event link copied to clipboard!
            </div>
          )}
        </div>
      </div>

      {/* QUICK FACTS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-xs">
        <div>
          <span className="text-slate-400 font-medium block">Registration Fee</span>
          <span className="font-bold text-rose-700 text-sm">{selectedEvent.registrationFee}</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Capacity</span>
          <span className="font-bold text-slate-800 text-sm">
            {selectedEvent.seatsBooked} / {selectedEvent.seatsTotal} Booked
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Campus Zone</span>
          <span className="font-bold text-slate-800 text-sm truncate block">
            {selectedEvent.campusZone}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Organizer</span>
          <span className="font-bold text-slate-800 text-sm truncate block">
            {selectedEvent.organizer}
          </span>
        </div>
      </div>

      {/* DETAIL TABS (Overview, Schedule, Coordinators, Rules) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Event Overview', icon: FileText },
            { id: 'schedule', label: 'Timeline & Schedule', icon: Clock },
            { id: 'coordinators', label: 'Faculty & Student Coordinators', icon: Users },
            { id: 'rules', label: 'Rules & Guidelines', icon: ShieldCheck },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                  isTabActive
                    ? 'border-rose-700 text-rose-700 bg-rose-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-2">About This Event</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Registration & Payment Details Card */}
              {(selectedEvent.registrationLink || selectedEvent.paymentLink || selectedEvent.paymentQrUrl || selectedEvent.paymentUpiId || selectedEvent.paymentInstructions) && (
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-50/70 via-slate-50 to-amber-50/60 border border-rose-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/70 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Official Registration & Payment Details
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Verified Parul University enrollment & online transaction portal
                        </p>
                      </div>
                    </div>
                    {selectedEvent.registrationType && (
                      <span className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        {selectedEvent.registrationType === 'both'
                          ? 'Hybrid: Digital Pass + External Portal'
                          : selectedEvent.registrationType === 'external'
                          ? 'External Registration Form'
                          : 'Direct In-App Pass'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Registration Link Box */}
                    {selectedEvent.registrationLink && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <LinkIcon className="w-4 h-4 text-rose-600" />
                            <span>External Registration Link</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 break-all">
                            {selectedEvent.registrationLink}
                          </p>
                        </div>
                        <a
                          href={selectedEvent.registrationLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 py-2 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <span>Open Registration Form</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Payment Gateway Link Box */}
                    {selectedEvent.paymentLink && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <CreditCard className="w-4 h-4 text-amber-600" />
                            <span>Online Payment Gateway</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 break-all">
                            {selectedEvent.paymentLink}
                          </p>
                        </div>
                        <a
                          href={selectedEvent.paymentLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <span>Pay Fee Online via Gateway</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* UPI QR & UPI ID section */}
                  {(selectedEvent.paymentQrUrl || selectedEvent.paymentUpiId) && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {selectedEvent.paymentQrUrl && (
                        <div className="sm:col-span-4 flex flex-col items-center text-center">
                          <img
                            src={selectedEvent.paymentQrUrl}
                            alt="Payment QR Code"
                            referrerPolicy="no-referrer"
                            className="w-28 h-28 object-contain rounded-xl border border-slate-200 p-1 bg-white shadow-2xs"
                          />
                          <span className="text-[10px] font-bold text-slate-500 mt-1">
                            Scan with GPay / PhonePe / Paytm
                          </span>
                        </div>
                      )}

                      <div className={selectedEvent.paymentQrUrl ? 'sm:col-span-8 space-y-2.5' : 'sm:col-span-12 space-y-2.5'}>
                        {selectedEvent.paymentUpiId && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Official University UPI ID
                            </span>
                            <div className="flex items-center gap-2">
                              <code className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 font-mono select-all">
                                {selectedEvent.paymentUpiId}
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopyUpi(selectedEvent.paymentUpiId!)}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedUpi ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy UPI ID</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedEvent.paymentInstructions && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                            <strong>Note for students:</strong> {selectedEvent.paymentInstructions}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-base font-bold text-slate-900 mb-2">Eligibility Criteria</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {selectedEvent.eligibility}
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 mb-2">Key Event Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedEvent.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900 mb-2">Detailed Timeline</h4>
              <div className="relative pl-6 border-l-2 border-rose-200 space-y-6">
                {(selectedEvent.schedule || []).map((item, index) => (
                  <div key={index} className="relative">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-rose-600 ring-4 ring-rose-100" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                        {item.time}
                      </span>
                      <h5 className="text-sm font-bold text-slate-900">{item.activity}</h5>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COORDINATORS */}
          {activeTab === 'coordinators' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900 mb-2">Organizing Committee</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(selectedEvent.coordinators || []).map((coord, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                        {coord.role}
                      </span>
                      <span className="text-[11px] text-slate-500">{coord.department}</span>
                    </div>
                    <h5 className="text-base font-bold text-slate-900">{coord.name}</h5>
                    <div className="flex flex-col gap-1 text-xs text-slate-600 pt-1">
                      <a
                        href={`tel:${coord.contact}`}
                        className="flex items-center gap-2 hover:text-rose-700"
                      >
                        <Phone className="w-3.5 h-3.5 text-rose-600" />
                        <span>{coord.contact}</span>
                      </a>
                      <a
                        href={`mailto:${coord.email}`}
                        className="flex items-center gap-2 hover:text-rose-700"
                      >
                        <Mail className="w-3.5 h-3.5 text-rose-600" />
                        <span>{coord.email}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Mandatory University Event Rules
              </h4>
              <div className="space-y-2.5">
                {(selectedEvent.rules || []).map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
