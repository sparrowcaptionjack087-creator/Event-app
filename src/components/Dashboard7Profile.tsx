import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile, EventItem, DashboardId } from '../types';
import { INITIAL_STUDENT_PROFILE } from '../data/mockData';
import { ParulLogo } from './ParulLogo';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Building,
  Calendar,
  Ticket,
  Bookmark,
  ShieldCheck,
  BellRing,
  LogOut,
  Edit3,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  QrCode,
  Download,
  Camera,
  UploadCloud,
  Shuffle,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Check,
  RotateCcw,
  AlertCircle,
  FileUp,
} from 'lucide-react';

export const RANDOM_STUDENT_PHOTOS = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    label: 'Campus Scholar 1',
    gender: 'Female',
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    label: 'Tech Lead 1',
    gender: 'Male',
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    label: 'Engineering Student',
    gender: 'Male',
  },
  {
    id: 'p4',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    label: 'Campus Innovator',
    gender: 'Female',
  },
  {
    id: 'p5',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    label: 'Science Researcher',
    gender: 'Male',
  },
  {
    id: 'p6',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    label: 'Design & Arts Scholar',
    gender: 'Female',
  },
  {
    id: 'p7',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    label: 'Robotics Club Member',
    gender: 'Male',
  },
  {
    id: 'p8',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    label: 'Sports Captain',
    gender: 'Female',
  },
  {
    id: 'p9',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    label: 'Hackathon Finalist',
    gender: 'Male',
  },
  {
    id: 'p10',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    label: 'Cultural Representative',
    gender: 'Female',
  },
  {
    id: 'p11',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    label: 'Management Executive',
    gender: 'Male',
  },
  {
    id: 'p12',
    url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    label: 'AeroTech Specialist',
    gender: 'Male',
  },
];

interface Dashboard7ProfileProps {
  student: StudentProfile;
  events: EventItem[];
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onNavigate: (dashboardId: DashboardId) => void;
  onSelectEvent: (event: EventItem) => void;
  onViewPass: (event: EventItem) => void;
  onLogout: () => void;
}

export const Dashboard7Profile: React.FC<Dashboard7ProfileProps> = ({
  student,
  events,
  onUpdateProfile,
  onNavigate,
  onSelectEvent,
  onViewPass,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'registered' | 'passes' | 'photo' | 'bookmarks' | 'settings'
  >('registered');

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student.name);
  const [editPhone, setEditPhone] = useState(student.phone);
  const [editDept, setEditDept] = useState(student.department);

  // Photo Section States
  const [isShuffling, setIsShuffling] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const registeredEvents = (events || []).filter((e) => (student?.registeredEventIds || []).includes(e.id));
  const bookmarkedEvents = (events || []).filter((e) => (student?.bookmarkedEventIds || []).includes(e.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: editName,
      phone: editPhone,
      department: editDept,
    });
    setIsEditing(false);
  };

  const togglePref = (key: keyof StudentProfile['notificationPreferences']) => {
    onUpdateProfile({
      notificationPreferences: {
        ...student.notificationPreferences,
        [key]: !student.notificationPreferences[key],
      },
    });
  };

  // RANDOM PHOTO GENERATOR: Selects a fresh random student photo from the pool
  const handlePickRandomPhoto = () => {
    setIsShuffling(true);
    setPhotoError(null);

    // Filter out current avatar so it always changes
    const candidates = RANDOM_STUDENT_PHOTOS.filter((p) => p.url !== student.avatarUrl);
    const pool = candidates.length > 0 ? candidates : RANDOM_STUDENT_PHOTOS;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];

    setTimeout(() => {
      onUpdateProfile({ avatarUrl: randomPick.url });
      setIsShuffling(false);
      setPhotoFeedback(`🎲 Applied random photo: "${randomPick.label}"`);
      setTimeout(() => setPhotoFeedback(null), 3500);
    }, 250);
  };

  // UPLOAD FILE FROM USER DEVICE
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (PNG, JPG, JPEG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }
    setPhotoError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onUpdateProfile({ avatarUrl: dataUrl });
      setPhotoFeedback('✓ Profile photo successfully uploaded from your device!');
      setTimeout(() => setPhotoFeedback(null), 3500);
    };
    reader.onerror = () => {
      setPhotoError('Could not read image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input value so user can upload the same file again if desired
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // APPLY DIRECT URL
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      onUpdateProfile({ avatarUrl: trimmed });
      setCustomUrlInput('');
      setShowUrlInput(false);
      setPhotoFeedback('✓ Custom photo link applied to your student profile!');
      setTimeout(() => setPhotoFeedback(null), 3500);
    } catch {
      setPhotoError('Please enter a valid image URL starting with http:// or https://');
    }
  };

  // RESET TO DEFAULT AVATAR
  const handleResetPhoto = () => {
    onUpdateProfile({ avatarUrl: INITIAL_STUDENT_PROFILE.avatarUrl });
    setPhotoFeedback('✓ Reset photo to Parul University default student avatar');
    setTimeout(() => setPhotoFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 pb-14 animate-fade-in max-w-5xl mx-auto">
      {/* HIDDEN FILE INPUT FOR USER PHOTO UPLOAD */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* HEADER WITH STUDENT ID CARD */}
      <div className="bg-gradient-to-br from-[#800020] via-[#940026] to-[#4a0012] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background watermark graphics */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Student Photo with Camera / Randomize Overlay */}
            <div className="relative group shrink-0">
              <img
                src={student.avatarUrl}
                alt={student.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-3 border-amber-400/80 shadow-lg transition-transform group-hover:scale-[1.02]"
              />
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>

              {/* Quick Camera Overlay on hover or click */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('photo');
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer backdrop-blur-[2px]"
                title="Change or upload student photo"
              >
                <Camera className="w-5 h-5 text-amber-300 mb-0.5" />
                <span>Photo Studio</span>
              </button>
            </div>

            {/* Student Credentials */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 tracking-wider uppercase">
                  Verified Student ID
                </span>
                <span className="text-xs text-rose-200 font-medium">Dashboard 7 • Profile</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {student.name}
              </h2>

              <div className="flex items-center gap-2 flex-wrap text-xs text-rose-100 font-medium">
                <span className="bg-black/30 px-2.5 py-1 rounded-lg font-mono font-bold text-amber-300 border border-white/10">
                  UG: {student.ugNumber}
                </span>
                <span>•</span>
                <span>{student.institute}</span>
              </div>

              <div className="text-xs text-rose-200">
                {student.department} • {student.semester} ({student.batch})
              </div>
            </div>
          </div>

          {/* Quick Profile Actions with Random Photo Button */}
          <div className="flex items-center flex-wrap gap-2.5 self-stretch md:self-auto justify-end">
            <button
              type="button"
              onClick={handlePickRandomPhoto}
              disabled={isShuffling}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Instantly roll and apply a random verified student portrait"
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? 'Rolling...' : 'Random Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('photo');
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Photo Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Info'}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-400/30 text-rose-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Edit Modal / Expandable Box */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div>
              <label className="text-[11px] font-bold text-rose-200 block mb-1">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-rose-200 block mb-1">Phone Number</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-rose-200 block mb-1">Department</label>
              <input
                type="text"
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* QUICK METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            Registered
          </div>
          <div className="text-2xl font-black text-rose-700">{registeredEvents.length} Events</div>
          <div className="text-[11px] text-slate-500">Active participation</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            Digital Passes
          </div>
          <div className="text-2xl font-black text-amber-600">{registeredEvents.length} Valid</div>
          <div className="text-[11px] text-slate-500">Gate barcode ready</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            Bookmarked
          </div>
          <div className="text-2xl font-black text-slate-900">{bookmarkedEvents.length} Events</div>
          <div className="text-[11px] text-slate-500">Interested in attending</div>
        </div>
      </div>

      {/* PROFILE TABS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none">
          {[
            { id: 'registered', label: `Registered Events (${registeredEvents.length})`, icon: Ticket },
            { id: 'passes', label: 'Digital Passes & Barcodes', icon: QrCode },
            { id: 'photo', label: 'Student Photo & ID Card', icon: Camera },
            { id: 'bookmarks', label: `Saved (${bookmarkedEvents.length})`, icon: Bookmark },
            { id: 'settings', label: 'Notification Settings', icon: BellRing },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
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
          {/* PHOTO NOTIFICATION BANNERS */}
          {photoFeedback && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-xs animate-fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{photoFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setPhotoFeedback(null)}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {photoError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-xs animate-fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{photoError}</span>
              </div>
              <button
                type="button"
                onClick={() => setPhotoError(null)}
                className="text-xs text-rose-700 hover:text-rose-900 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB: STUDENT PHOTO & ID CARD STUDIO (NEW REQUESTED FEATURE) */}
          {activeTab === 'photo' && (
            <div className="space-y-8">
              {/* Photo Section Intro Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Official ID Photo Section</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Student ID Photo & Digital Badge
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                    Upload your custom passport photo from your device, or roll a random verified university student portrait. Your photo appears across digital passes, event registrations, and the Parul University campus gate system.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Restore default student avatar"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset Default</span>
                  </button>
                </div>
              </div>

              {/* TWO COLUMN STUDIO: Left = Live ID Card Mockup | Right = Random & Upload Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT: Live Parul University Student ID Card Preview */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-200 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <ParulLogo size="sm" variant="dark" showTagline={false} />
                      <div className="leading-tight">
                        <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                          Parul University
                        </div>
                        <div className="text-[9px] text-slate-300">Official Student Identity</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400 text-slate-950">
                      ACTIVE
                    </span>
                  </div>

                  {/* ID Card Body */}
                  <div className="flex gap-4 items-center mb-4">
                    <div className="relative shrink-0">
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        referrerPolicy="no-referrer"
                        className="w-24 h-28 rounded-xl object-cover border-2 border-amber-400 shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h4 className="text-base font-bold text-white truncate leading-snug">
                        {student.name}
                      </h4>
                      <div className="text-xs font-mono font-bold text-amber-300">
                        {student.ugNumber}
                      </div>
                      <div className="text-[11px] text-slate-300 truncate">
                        {student.institute}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {student.department}
                      </div>
                      <div className="text-[10px] text-rose-300 font-medium">
                        {student.semester} • Batch {student.batch}
                      </div>
                    </div>
                  </div>

                  {/* Mock Barcode */}
                  <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                    <div className="h-7 flex items-center justify-center gap-1.5 opacity-80">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-full bg-white"
                          style={{ width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '1px' }}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] font-mono text-slate-300 tracking-widest mt-1">
                      {student.ugNumber}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10">
                    <span>Gate Scanner Ready</span>
                    <span>Vadodara, Gujarat</span>
                  </div>
                </div>

                {/* RIGHT: Photo Selection, Upload, and Random Generator Options */}
                <div className="lg:col-span-7 space-y-6">
                  {/* OPTION A: RANDOM PHOTO GENERATOR BUTTON */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-2 border-amber-300/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                          <Shuffle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            Random Photo Generator
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            Shuffle through 12+ verified student portraits with 1 click
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Instant
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handlePickRandomPhoto}
                      disabled={isShuffling}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
                      <span>{isShuffling ? 'Rolling Random Photo...' : 'Roll Random Student Photo Now 🎲'}</span>
                    </button>
                  </div>

                  {/* OPTION B: UPLOAD FROM DEVICE */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
                          <UploadCloud className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            Upload Photo From Device
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Upload PNG, JPG, or WEBP image file (max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Drag and Drop Box */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
                        isDragging
                          ? 'border-rose-600 bg-rose-50/70 scale-[1.01]'
                          : 'border-slate-300 hover:border-rose-400 bg-slate-50/60 hover:bg-rose-50/30'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white text-rose-700 mx-auto flex items-center justify-center shadow-2xs border border-slate-200 mb-2">
                        <FileUp className="w-6 h-6 text-rose-600" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Drag and drop your photo here, or{' '}
                        <span className="text-rose-700 underline">browse files</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        High resolution passport photos look best on student passes
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Select Photo File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        {showUrlInput ? 'Hide URL link' : 'Or paste image link'}
                      </button>
                    </div>

                    {showUrlInput && (
                      <form onSubmit={handleApplyCustomUrl} className="pt-2 flex items-center gap-2">
                        <input
                          type="url"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          placeholder="https://example.com/my-photo.jpg"
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* CURATED RANDOM PHOTOS GALLERY GRID */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-rose-700" />
                      <span>Choose From Random Student Portraits</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click any photo below to instantly apply it to your Parul University Student ID
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePickRandomPhoto}
                    disabled={isShuffling}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Shuffle Random Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                  {RANDOM_STUDENT_PHOTOS.map((item) => {
                    const isCurrent = student.avatarUrl === item.url;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onUpdateProfile({ avatarUrl: item.url });
                          setPhotoFeedback(`✓ Applied photo: "${item.label}"`);
                          setTimeout(() => setPhotoFeedback(null), 3000);
                        }}
                        className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer text-left ${
                          isCurrent
                            ? 'border-amber-400 ring-3 ring-amber-400/40 scale-[1.03] shadow-md'
                            : 'border-slate-200 hover:border-rose-400 hover:shadow-md'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />

                        {isCurrent ? (
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md mb-1">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
                            <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md truncate w-full">
                              {item.label}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: REGISTERED EVENTS */}
          {activeTab === 'registered' && (
            <div className="space-y-4">
              {registeredEvents.length === 0 ? (
                <div className="text-center py-10">
                  <Ticket className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No events registered yet</p>
                  <button
                    onClick={() => onNavigate('dashboard-3-home')}
                    className="mt-3 px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Browse Events on Home
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {registeredEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={ev.bannerUrl}
                          alt={ev.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            {ev.category}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 mt-0.5">
                            {ev.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {ev.date} • {ev.venue}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => onViewPass(ev)}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Show Pass QR</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectEvent(ev);
                            onNavigate('dashboard-6-details');
                          }}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIGITAL PASSES & QR BADGES */}
          {activeTab === 'passes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                <QrCode className="w-5 h-5 text-amber-700 shrink-0" />
                <span>
                  Present these digital passes at the Parul University security gates for direct entry scan using your UG Number ({student.ugNumber}).
                </span>
              </div>

              {registeredEvents.length === 0 ? (
                <div className="text-center py-10">
                  <QrCode className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No active digital passes</p>
                  <p className="text-xs text-slate-500 mt-1">Register for an event to generate your official pass.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {registeredEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            VALID ENTRY PASS
                          </span>
                          <h5 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                            {ev.title}
                          </h5>
                          <p className="text-xs text-slate-500 font-mono">
                            Pass ID: PU-{ev.id.toUpperCase()}-{student.ugNumber.slice(-4)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 font-bold border border-slate-200">
                          <QrCode className="w-6 h-6 text-rose-700" />
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-0.5 pt-2 border-t border-slate-100">
                        <div><strong>Venue:</strong> {ev.venue}</div>
                        <div><strong>Date:</strong> {ev.date} ({ev.time})</div>
                      </div>

                      <button
                        onClick={() => onViewPass(ev)}
                        className="w-full py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Open Full Pass with Barcode</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BOOKMARKED */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              {bookmarkedEvents.length === 0 ? (
                <div className="text-center py-10">
                  <Bookmark className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No events bookmarked</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookmarkedEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          {ev.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-1">
                          {ev.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{ev.date} • {ev.venue}</p>
                      </div>

                      <button
                        onClick={() => {
                          onSelectEvent(ev);
                          onNavigate('dashboard-6-details');
                        }}
                        className="py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        View Event Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTIFICATION SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-xl">
              <h4 className="text-base font-bold text-slate-900">
                Student Notification Preferences
              </h4>
              <p className="text-xs text-slate-500">
                Configure how Parul University events committee alerts you regarding gate passes, venue changes, and results.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  {
                    key: 'whatsappAlerts' as const,
                    title: 'WhatsApp Event Alerts',
                    desc: 'Instant QR passes and gate entry alerts on WhatsApp',
                  },
                  {
                    key: 'urgentPush' as const,
                    title: 'Urgent Campus Broadcast Notifications',
                    desc: 'Emergency announcements, gate closing times, and rain contingency venue shifts',
                  },
                  {
                    key: 'smsAlerts' as const,
                    title: 'SMS Alerts',
                    desc: `Dispatch critical OTP and entry codes to ${student.phone}`,
                  },
                  {
                    key: 'emailAlerts' as const,
                    title: 'Student Webmail Digest',
                    desc: `Weekly festival digests and event updates sent to ${student.email}`,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePref(item.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        student.notificationPreferences[item.key] ? 'bg-rose-700' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          student.notificationPreferences[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
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
