import React from 'react';
import { X, Calendar, MapPin, CheckCircle2, ShieldCheck, Download, Share2 } from 'lucide-react';
import { EventItem, StudentProfile } from '../types';

interface EventPassModalProps {
  event: EventItem | null;
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const EventPassModal: React.FC<EventPassModalProps> = ({
  event,
  student,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !event) return null;

  const passId = `PU-PASS-${event.id.toUpperCase()}-${student.ugNumber.slice(-5)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
        {/* Pass Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close pass modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 tracking-wider">
              OFFICIAL ENTRY PASS
            </span>
            <span className="text-xs text-rose-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> NAAC A++ Verified
            </span>
          </div>

          <h3 className="text-lg font-black leading-snug pr-8 text-white">
            {event.title}
          </h3>
          <p className="text-xs text-rose-200 mt-1">Parul University • Vadodara Campus</p>
        </div>

        {/* Ticket Notch effect */}
        <div className="relative h-4 bg-slate-100 flex items-center justify-between px-[-12px]">
          <div className="w-5 h-5 rounded-full bg-slate-900 -ml-2.5"></div>
          <div className="flex-1 border-b-2 border-dashed border-slate-300 mx-2"></div>
          <div className="w-5 h-5 rounded-full bg-slate-900 -mr-2.5"></div>
        </div>

        {/* Pass Body */}
        <div className="p-6 bg-white space-y-4">
          {/* Student Info Box */}
          <div className="flex items-center justify-between p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-3">
              {student.avatarUrl && (
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shadow-2xs shrink-0"
                />
              )}
              <div>
                <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                  Student Attendee
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900">{student.name}</div>
                <div className="text-xs font-mono font-medium text-rose-800 mt-0.5">
                  UG: <span className="font-bold">{student.ugNumber}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Department
              </div>
              <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{student.department || 'PIET - Parul University'}</div>
              <div className="text-[11px] text-slate-500">{student.semester || '6th Semester'}</div>
            </div>
          </div>

          {/* Event Schedule Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 text-rose-600" /> Date & Time
              </div>
              <div className="font-bold text-slate-900">{event.date}</div>
              <div className="text-slate-600">{event.time}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" /> Venue
              </div>
              <div className="font-bold text-slate-900 line-clamp-1">{event.venue}</div>
              <div className="text-slate-600 line-clamp-1">{event.campusZone}</div>
            </div>
          </div>

          {/* QR Code & Barcode Section */}
          <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Scan at Entrance Gate
            </div>
            {/* SVG QR Code Simulation */}
            <div className="inline-block p-3 bg-white rounded-xl shadow-xs border border-slate-200">
              <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100" fill="none">
                {/* QR Finder Corners */}
                <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="13" y="13" width="10" height="10" rx="1" fill="#0f172a" />

                <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="77" y="13" width="10" height="10" rx="1" fill="#0f172a" />

                <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
                <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="13" y="77" width="10" height="10" rx="1" fill="#0f172a" />

                {/* Data modules */}
                <rect x="36" y="10" width="6" height="6" fill="#800020" />
                <rect x="46" y="10" width="6" height="12" fill="#0f172a" />
                <rect x="56" y="8" width="6" height="6" fill="#0f172a" />
                <rect x="36" y="24" width="12" height="6" fill="#0f172a" />
                <rect x="54" y="20" width="8" height="8" fill="#800020" />

                <rect x="10" y="38" width="8" height="8" fill="#0f172a" />
                <rect x="22" y="44" width="8" height="6" fill="#800020" />
                <rect x="36" y="36" width="28" height="28" rx="4" fill="#e11d48" fillOpacity="0.1" stroke="#e11d48" strokeWidth="2" />
                <circle cx="50" cy="50" r="8" fill="#800020" />

                <rect x="70" y="38" width="6" height="12" fill="#0f172a" />
                <rect x="82" y="42" width="8" height="6" fill="#800020" />

                <rect x="36" y="70" width="8" height="8" fill="#0f172a" />
                <rect x="48" y="76" width="6" height="14" fill="#0f172a" />
                <rect x="58" y="70" width="14" height="6" fill="#800020" />
                <rect x="76" y="70" width="14" height="14" fill="#0f172a" />
              </svg>
            </div>

            <div className="mt-2 text-xs font-mono font-bold text-slate-700 tracking-wider">
              {passId}
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Scanner Validation
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                alert(`Pass ${passId} saved to your device gallery! Show this QR at Parul University gate.`);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" /> Download Pass
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText?.(window.location.href);
                alert('Event pass link copied to clipboard!');
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
