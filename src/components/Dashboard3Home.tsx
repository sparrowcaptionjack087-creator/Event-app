import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { EventCategory, EventItem, DashboardId, StudentProfile } from '../types';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Flame,
  Clock,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Ticket,
  ChevronRight,
  Filter,
  Layers,
  Megaphone,
} from 'lucide-react';

interface Dashboard3HomeProps {
  events: EventItem[];
  student: StudentProfile;
  onSelectEvent: (event: EventItem) => void;
  onNavigate: (dashboardId: DashboardId) => void;
  onToggleRegister: (eventId: string) => void;
  onToggleBookmark: (eventId: string) => void;
  onViewPass: (event: EventItem) => void;
}

export const Dashboard3Home: React.FC<Dashboard3HomeProps> = ({
  events,
  student,
  onSelectEvent,
  onNavigate,
  onToggleRegister,
  onToggleBookmark,
  onViewPass,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Featured flagship event for hero banner (app-holder verified)
  const featuredEvent = useMemo(() => {
    if (events.length === 0) return null;
    return events.find((e) => e.isFeatured) || events[0];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return (events || []).filter((ev) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (ev.title || '').toLowerCase().includes(q) ||
        (ev.venue || '').toLowerCase().includes(q) ||
        (ev.tags || []).some((t) => (t || '').toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'All' || ev.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [events, searchQuery, selectedCategory]);

  const registeredCount = (student?.registeredEventIds || []).length;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* CAMPUS ANNOUNCEMENT TICKER */}
      <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 border border-amber-300/40 rounded-2xl p-3 sm:px-4 flex items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-rose-900 font-bold shrink-0">
          <span className="p-1 rounded-md bg-rose-600 text-white">
            <Megaphone className="w-3.5 h-3.5" />
          </span>
          <span className="uppercase tracking-wider">PU Flash Alert:</span>
        </div>
        <p className="truncate text-slate-800 font-medium">
          {events.length > 0
            ? `Latest Official Event: ${events[0].title} • ${events[0].date} at ${events[0].venue}. Entry pass generation active!`
            : 'Official Parul University Event Board • Explore campus festivals, tech meets, and workshops. Digital passes available.'}
        </p>
        <button
          onClick={() => onNavigate('dashboard-4-notifications')}
          className="shrink-0 text-rose-700 hover:text-rose-900 font-bold underline flex items-center gap-0.5"
        >
          <span>All Alerts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* HERO BANNER: SPOTLIGHT UPCOMING FLAGSHIP EVENT */}
      {featuredEvent ? (
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-950 text-white min-h-[380px] sm:min-h-[420px] flex flex-col justify-end p-6 sm:p-10">
          <div className="absolute inset-0 z-0">
            <img
              src={featuredEvent.bannerUrl}
              alt={featuredEvent.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
            <div className="absolute inset-0 bg-rose-950/30 mix-blend-multiply" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                ★ SPOTLIGHT FLAGSHIP EVENT
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" /> App Holder Verified
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" /> Registration Open
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {featuredEvent.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-200 line-clamp-2 max-w-2xl leading-relaxed">
              {featuredEvent.shortDesc}
            </p>

            <div className="flex items-center flex-wrap gap-4 text-xs sm:text-sm text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-rose-400" /> {featuredEvent.date}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-rose-400" /> {featuredEvent.venue}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                <Ticket className="w-4 h-4" /> {featuredEvent.registrationFee}
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-3 pt-3">
              <button
                onClick={() => {
                  onSelectEvent(featuredEvent);
                  onNavigate('dashboard-6-details');
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <span>View Event Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {student.registeredEventIds.includes(featuredEvent.id) ? (
                <button
                  onClick={() => onViewPass(featuredEvent)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Entry Pass Ready (Show QR)</span>
                </button>
              ) : (
                <button
                  onClick={() => onToggleRegister(featuredEvent.id)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/20 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Quick Register (UG {student.ugNumber})</span>
                </button>
              )}

              <button
                onClick={() => onToggleBookmark(featuredEvent.id)}
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md transition-colors"
                aria-label="Bookmark spotlight event"
              >
                {student.bookmarkedEventIds.includes(featuredEvent.id) ? (
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white p-8 sm:p-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/30 border border-rose-400/40 text-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Parul University Events Portal</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Welcome to Parul University Events
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore event categories or check your alert notifications for official announcements regarding upcoming fests, competitions, hackathons, and cultural evenings across the campus.
            </p>
            <div className="pt-3 flex items-center flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('dashboard-5-categories')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Explore Categories</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('dashboard-4-notifications')}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors"
              >
                <span>View Alert Center</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK STATS & STUDENT PULSE BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Total Events</span>
            <Calendar className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{events.length} Active</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Across Campus Categories</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>My Registered</span>
            <Ticket className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{registeredCount} Events</div>
          <div className="text-[11px] text-slate-500 mt-0.5">UG: {student.ugNumber}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>University NAAC</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">Grade A++</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Parul University Vadodara</div>
        </div>
      </div>

      {/* SEARCH AND QUICK CATEGORY TABS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by title, venue, robotics, garba, hackathon..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent text-slate-900 placeholder:text-slate-400 shadow-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('dashboard-5-categories')}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1.5 border border-rose-200 transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>Explore Categories Dashboard</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            'All',
            'Cultural',
            'Technical',
            'Sports',
            'Workshops',
            'Placements',
            'Clubs',
            'Celebrity Nights',
            'Abroad Study',
            'Competitive Exams',
          ].map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-300'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* EVENT CARDS FEED GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {selectedCategory === 'All' ? 'Upcoming Campus Events' : `${selectedCategory} Events`}
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredEvents.length} events • Register to receive real-time notifications
            </p>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-100">
              <Calendar className="w-7 h-7 text-rose-700" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">
              {events.length === 0 ? 'No Campus Events Scheduled Yet' : 'No matching events found'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {events.length === 0
                ? 'Check back soon for new event schedules, cultural fests, and technical symposiums from Parul University.'
                : 'Try adjusting your search keywords or clear the category filter.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              {events.length === 0 ? (
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard-5-categories')}
                  className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Explore Categories →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-semibold"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const isRegistered = Boolean(student?.registeredEventIds?.includes(ev.id));
              const isBookmarked = Boolean(student?.bookmarkedEventIds?.includes(ev.id));

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Card Banner */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={ev.bannerUrl}
                      alt={ev.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    {/* Top tags on banner */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-rose-800 shadow-xs backdrop-blur-xs">
                          {ev.category}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(ev.id);
                        }}
                        className="p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
                        aria-label="Toggle bookmark"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Bottom strip on banner */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>{ev.date}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold text-[10px]">
                        {ev.registrationFee}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4
                        onClick={() => {
                          onSelectEvent(ev);
                          onNavigate('dashboard-6-details');
                        }}
                        className="text-base font-bold text-slate-900 hover:text-rose-700 cursor-pointer line-clamp-1 transition-colors"
                      >
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {ev.shortDesc}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Capacity booked:</span>
                        <span className="font-bold text-slate-800">
                          {ev.seatsBooked} / {ev.seatsTotal}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (ev.seatsBooked / ev.seatsTotal) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          onSelectEvent(ev);
                          onNavigate('dashboard-6-details');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {isRegistered ? (
                        <button
                          onClick={() => onViewPass(ev)}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Pass QR</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleRegister(ev.id)}
                          className="py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors shadow-xs"
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CAMPUS VENUES GUIDE */}
      <div className="bg-gradient-to-br from-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              Campus Navigator
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">Parul University Event Venues</h3>
            <p className="text-xs text-slate-300">
              Waghodia Campus, Vadodara • 150+ Acres High-Tech Educational Campus
            </p>
          </div>
          <button
            onClick={() => onNavigate('dashboard-5-categories')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors"
          >
            Browse by Category →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-amber-300 text-sm">Open Air Theatre (OAT)</h4>
            <p className="text-xs text-slate-300 mt-1">
              Central cultural hub with 15,000 capacity, dynamic sound & lighting for DHOOM nights.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-rose-300 text-sm">Central Convention Centre</h4>
            <p className="text-xs text-slate-300 mt-1">
              State-of-the-art multi-purpose arena hosting international conclaves, career expos & tech symposia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
