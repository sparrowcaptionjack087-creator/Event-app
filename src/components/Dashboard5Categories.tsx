import React, { useState, useMemo } from 'react';
import { CategoryInfo, EventCategory, EventItem, DashboardId, StudentProfile } from '../types';
import { CATEGORIES_DATA } from '../data/mockData';
import {
  Sparkles,
  Cpu,
  Trophy,
  BookOpen,
  Briefcase,
  Users,
  Mic2,
  Calendar,
  MapPin,
  ArrowRight,
  Ticket,
  Search,
  CheckCircle2,
  Layers,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Clock,
  Globe,
  GraduationCap,
} from 'lucide-react';

interface Dashboard5CategoriesProps {
  events: EventItem[];
  student: StudentProfile;
  onSelectEvent: (event: EventItem) => void;
  onNavigate: (dashboardId: DashboardId) => void;
  onToggleRegister: (eventId: string) => void;
  onViewPass: (event: EventItem) => void;
  onToggleBookmark?: (eventId: string) => void;
  onAddEvent?: (event: EventItem) => void;
  onUpdateEvent?: (event: EventItem) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const Dashboard5Categories: React.FC<Dashboard5CategoriesProps> = ({
  events = [],
  student,
  onSelectEvent,
  onNavigate,
  onToggleRegister,
  onViewPass,
  onToggleBookmark,
}) => {
  const [activeCategory, setActiveCategory] = useState<EventCategory>('Cultural');
  const [searchTerm, setSearchTerm] = useState('');

  // Map category icon name to Lucide icon component
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return Sparkles;
      case 'Cpu':
        return Cpu;
      case 'Trophy':
        return Trophy;
      case 'BookOpen':
        return BookOpen;
      case 'Briefcase':
        return Briefcase;
      case 'Users':
        return Users;
      case 'Globe':
        return Globe;
      case 'GraduationCap':
        return GraduationCap;
      case 'Mic2':
      default:
        return Mic2;
    }
  };

  const matchingEvents = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    return (events || []).filter((e) => {
      const matchesCat = e.category === activeCategory;
      const matchesSearch =
        s === '' ||
        (e.title || '').toLowerCase().includes(s) ||
        (e.venue || '').toLowerCase().includes(s) ||
        (e.shortDesc || '').toLowerCase().includes(s) ||
        (e.tags || []).some((t) => (t || '').toLowerCase().includes(s));
      return matchesCat && matchesSearch;
    });
  }, [events, activeCategory, searchTerm]);

  const selectedCategoryObj = CATEGORIES_DATA.find((c) => c.id === activeCategory) || CATEGORIES_DATA[0];
  const IconComponent = getCategoryIcon(selectedCategoryObj.iconName);

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Dashboard 5
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold flex items-center gap-1 border border-rose-200">
                <Layers className="w-3 h-3 text-rose-700" />
                {CATEGORIES_DATA.length} Official Categories
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Event Categories Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Browse official campus events by category, explore schedules, and register with your student credentials to generate instant digital entry passes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('dashboard-3-home')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Home Feed</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* OFFICIAL CAMPUS CATEGORIES GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Select Category
          </h3>
          <span className="text-xs text-slate-500">
            {events.length} Total Active Campus Events
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CATEGORIES_DATA.map((cat) => {
            const CatIcon = getCategoryIcon(cat.iconName);
            const isSelected = activeCategory === cat.id;
            const categoryEventsCount = (events || []).filter((e) => e.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-white border-rose-600 shadow-md ring-2 ring-rose-500/30 -translate-y-1'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between w-full mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                    }}
                  >
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      categoryEventsCount > 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {categoryEventsCount} {categoryEventsCount === 1 ? 'Event' : 'Events'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{cat.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {isSelected && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED CATEGORY SHOWCASE & MATCHING EVENTS */}
      <div className="space-y-4">
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-rose-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: selectedCategoryObj.color }}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Browsing Category</span>
                <span className="text-slate-400">•</span>
                <span>{matchingEvents.length} {matchingEvents.length === 1 ? 'Event Available' : 'Events Available'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {selectedCategoryObj.title}
              </h3>
            </div>
          </div>

          {/* Search inside this category */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search in ${selectedCategoryObj.title}...`}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="px-2.5 py-2 rounded-xl bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Event List in this Category */}
        {matchingEvents.length === 0 ? (
          <div className="text-center p-10 sm:p-14 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-800 mx-auto flex items-center justify-center border border-rose-100 shadow-2xs">
              <Calendar className="w-8 h-8 text-rose-700" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-lg font-black text-slate-900">
                No Events Found in {selectedCategoryObj.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {searchTerm
                  ? `No events in ${selectedCategoryObj.title} matched "${searchTerm}". Try resetting your search.`
                  : `There are currently no scheduled events in ${selectedCategoryObj.title}. Check other categories or check back soon for university announcements.`}
              </p>
            </div>
            {searchTerm && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Clear Search Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchingEvents.map((ev) => {
              const isRegistered = Boolean(student?.registeredEventIds?.includes(ev.id));
              const isBookmarked = Boolean(student?.bookmarkedEventIds?.includes(ev.id));

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row relative"
                >
                  {/* Event Image */}
                  <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0">
                    <img
                      src={ev.bannerUrl}
                      alt={ev.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-rose-800 shadow-xs">
                        {ev.registrationFee}
                      </span>
                    </div>

                    {onToggleBookmark && (
                      <button
                        type="button"
                        onClick={() => onToggleBookmark(ev.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
                        aria-label="Bookmark event"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Event Meta */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                          {ev.category}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {ev.time}
                        </span>
                      </div>
                      <h4
                        onClick={() => {
                          onSelectEvent(ev);
                          onNavigate('dashboard-6-details');
                        }}
                        className="text-base font-bold text-slate-900 hover:text-rose-700 cursor-pointer transition-colors leading-snug line-clamp-2"
                      >
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {ev.shortDesc}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="font-semibold">{ev.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500">Capacity booked:</span>
                        <span className="font-bold text-slate-800">
                          {ev.seatsBooked} / {ev.seatsTotal}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                          style={{
                            width: `${Math.min(100, ((ev.seatsBooked || 0) / (ev.seatsTotal || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectEvent(ev);
                          onNavigate('dashboard-6-details');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Full Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {isRegistered ? (
                        <button
                          type="button"
                          onClick={() => onViewPass(ev)}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Show Pass</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleRegister(ev.id)}
                          className="py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors cursor-pointer"
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
    </div>
  );
};
