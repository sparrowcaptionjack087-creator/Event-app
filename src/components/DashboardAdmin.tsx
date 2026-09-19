import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EventCategory, EventItem, EventAttendee, AdminStats, AdminSession, AdminStudentAccount } from '../types';
import { CATEGORIES_DATA } from '../data/mockData';
import { api } from '../utils/api';
import {
  ShieldCheck,
  Lock,
  UploadCloud,
  Layers,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit3,
  Search,
  PlusCircle,
  Eye,
  LogOut,
  Bell,
  RefreshCw,
  Ticket,
  ExternalLink,
  Sparkles,
  Server,
  Activity,
  UserCheck,
  ChevronRight,
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Filter,
  ArrowUpDown,
  Table,
  GraduationCap,
  Phone,
  Mail,
  Building,
  Loader2,
  QrCode,
  Link as LinkIcon,
  CreditCard,
  Wallet,
  FileUp,
} from 'lucide-react';
import { deleteStudentAccount } from '../utils/authStorage';

interface DashboardAdminProps {
  events: EventItem[];
  onEventCreated: (newEvent: EventItem) => void;
  onEventUpdated: (updatedEvent: EventItem) => void;
  onEventDeleted: (eventId: string) => void;
  onAllEventsCleared?: () => void;
  onNotificationBroadcast: (title: string, message: string) => void;
  onBackToStudentPortal: () => void;
  showToast: (msg: string) => void;
}

const SAMPLE_BANNER_PRESETS = [
  {
    name: 'Cultural Festival Arena',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
    category: 'Cultural',
  },
  {
    name: 'Hackathon & Tech Lab',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    category: 'Technical',
  },
  {
    name: 'Robotics & Tech Arena',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    category: 'Technical',
  },
  {
    name: 'Sports Stadium & Track',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
    category: 'Sports',
  },
  {
    name: 'Executive Auditorium & Seminar',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80',
    category: 'Workshops',
  },
  {
    name: 'Celebrity Concert Night',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    category: 'Celebrity Nights',
  },
  {
    name: 'Global University & Abroad Study Fair',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    category: 'Abroad Study',
  },
  {
    name: 'Competitive Exam & Civil Services Seminar',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
    category: 'Competitive Exams',
  },
];

const SAMPLE_PAYMENT_QR_PRESETS = [
  {
    name: 'PU Student Welfare UPI QR',
    upiId: 'paruluniversity.dsw@icici',
    url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=paruluniversity.dsw@icici%26pn=Parul%20University%20Events%26cu=INR',
  },
  {
    name: 'PU TechFest & Cultural UPI QR',
    upiId: 'events.paruluniv@sbi',
    url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=events.paruluniv@sbi%26pn=Parul%20University%20Cultural%26cu=INR',
  },
];

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({
  events,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
  onAllEventsCleared,
  onNotificationBroadcast,
  onBackToStudentPortal,
  showToast,
}) => {
  // Admin Session State - strictly verified for administrative ID 26UG030984
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const profile = api.getAdminProfile();
    const token = api.getAdminToken();
    return !!(token && profile && profile.adminId?.toUpperCase() === '26UG030984');
  });
  const [adminProfile, setAdminProfile] = useState<AdminSession | null>(() => {
    const profile = api.getAdminProfile();
    return profile && profile.adminId?.toUpperCase() === '26UG030984' ? profile : null;
  });

  // Login Gate State
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Active Tab
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'students-excel' | 'broadcast' | 'stats'>('upload');

  // Student Accounts & Excel Directory State
  const [adminStudents, setAdminStudents] = useState<AdminStudentAccount[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [studentDeptFilter, setStudentDeptFilter] = useState<string>('All');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<AdminStudentAccount | null>(null);
  const [copiedTsv, setCopiedTsv] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'registeredAt' | 'name' | 'ugNumber' | 'registeredEventsCount'>('registeredAt');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [deletingUg, setDeletingUg] = useState<string | null>(null);

  // In-App Deletion Confirmation Modals (Reliably works across all browsers and sandboxed iframes)
  const [studentToDelete, setStudentToDelete] = useState<{
    ugNumber: string;
    name: string;
    email: string;
    eventsCount: number;
  } | null>(null);
  const [deletingStudentLoading, setDeletingStudentLoading] = useState<boolean>(false);

  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [deletingEventLoading, setDeletingEventLoading] = useState<boolean>(false);
  const [showClearAllEventsModal, setShowClearAllEventsModal] = useState<boolean>(false);
  const [isClearingAllEvents, setIsClearingAllEvents] = useState<boolean>(false);

  // Event Upload / Edit Form State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Cultural');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [campusZone, setCampusZone] = useState('Main Campus, Vadodara');
  const [seatsTotal, setSeatsTotal] = useState<number>(500);
  const [registrationFee, setRegistrationFee] = useState('Free for PU Students');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [organizer, setOrganizer] = useState('Dean of Student Welfare & Cultural Affairs, Parul University');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState(SAMPLE_BANNER_PRESETS[0].url);
  const [eligibility, setEligibility] = useState('Open to all registered Parul University students.');
  const [rulesInput, setRulesInput] = useState('Valid University Digital Pass is mandatory at entrance.\nReport 15 minutes before event schedule.');
  const [broadcastNotification, setBroadcastNotification] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Registration Link & Online Payment Integration Form State
  const [registrationLink, setRegistrationLink] = useState('');
  const [registrationType, setRegistrationType] = useState<'both' | 'internal' | 'external'>('both');
  const [paymentLink, setPaymentLink] = useState('');
  const [paymentQrUrl, setPaymentQrUrl] = useState('');
  const [paymentUpiId, setPaymentUpiId] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const paymentQrFileRef = useRef<HTMLInputElement | null>(null);

  const handlePaymentQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file for the Payment QR Code (PNG, JPG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit. Please upload a smaller QR Code image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPaymentQrUrl(dataUrl);
      showToast('✓ Payment QR Code attached!');
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  // Event Management & Attendees Modal State
  const [searchManageTerm, setSearchManageTerm] = useState('');
  const [manageCategory, setManageCategory] = useState<string>('All');
  const [attendeeModalEvent, setAttendeeModalEvent] = useState<EventItem | null>(null);
  const [attendeesList, setAttendeesList] = useState<EventAttendee[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Broadcast Alert Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'urgent' | 'schedule' | 'registration'>('urgent');
  const [selectedBroadcastEventId, setSelectedBroadcastEventId] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Admin Stats State
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // Verify Admin Session on mount
  useEffect(() => {
    if (isAdminAuthenticated) {
      api.verifyAdminSession().then((isValid) => {
        if (!isValid) {
          setIsAdminAuthenticated(false);
          setAdminProfile(null);
        } else {
          loadStats();
        }
      });
    }
  }, [isAdminAuthenticated]);

  const loadStats = async () => {
    const stats = await api.fetchAdminStats();
    if (stats) setAdminStats(stats);
  };

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const list = await api.fetchAdminStudents();
      setAdminStudents(list);
    } catch (err) {
      console.error('Failed to load registered student accounts:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadStudents();
    }
  }, [isAdminAuthenticated]);

  // Derived filtered & sorted students for Excel directory
  const uniqueStudentDepartments = Array.from(
    new Set(adminStudents.map((s) => s.department).filter(Boolean))
  );

  const filteredStudents = adminStudents
    .filter((s) => {
      const term = studentSearchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.ugNumber.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.phone && s.phone.toLowerCase().includes(term)) ||
        (s.department && s.department.toLowerCase().includes(term)) ||
        (s.institute && s.institute.toLowerCase().includes(term));

      const matchesDept =
        studentDeptFilter === 'All' || s.department === studentDeptFilter;

      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortField === 'ugNumber') {
        return sortAsc ? a.ugNumber.localeCompare(b.ugNumber) : b.ugNumber.localeCompare(a.ugNumber);
      }
      if (sortField === 'registeredEventsCount') {
        return sortAsc
          ? (a.registeredEventsCount || 0) - (b.registeredEventsCount || 0)
          : (b.registeredEventsCount || 0) - (a.registeredEventsCount || 0);
      }
      const dateA = a.registeredAt || '';
      const dateB = b.registeredAt || '';
      return sortAsc ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
    });

  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      showToast('⚠️ No student records match to export.');
      return;
    }
    api.exportStudentsToExcel(filteredStudents, 'Parul_University_Student_Accounts');
    showToast(`✓ Excel file generated: ${filteredStudents.length} student account(s) exported (.xlsx)`);
  };

  const handleExportCsv = () => {
    if (filteredStudents.length === 0) {
      showToast('⚠️ No student records match to export.');
      return;
    }
    api.exportStudentsToCsv(filteredStudents, 'Parul_University_Student_Accounts');
    showToast(`✓ Excel CSV downloaded: ${filteredStudents.length} student account(s) (.csv)`);
  };

  const handleCopyTsv = async () => {
    if (filteredStudents.length === 0) return;
    const ok = await api.copyStudentsForExcel(filteredStudents);
    if (ok) {
      setCopiedTsv(true);
      setTimeout(() => setCopiedTsv(false), 3000);
      showToast('📋 Copied formatted spreadsheet data! You can paste (Ctrl+V) directly into Excel or Google Sheets.');
    }
  };

  const handleDeleteStudent = (ugNumber: string, name: string, email = '', eventsCount = 0) => {
    setStudentToDelete({ ugNumber, name, email, eventsCount });
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    const { ugNumber, name } = studentToDelete;
    setDeletingStudentLoading(true);

    try {
      // 1. Delete from backend DB
      const res = await api.deleteAdminStudent(ugNumber);

      // 2. Also delete from local storage and blacklist so client never re-adds it
      deleteStudentAccount(ugNumber);

      if (res.success || !res.error) {
        setAdminStudents((prev) => prev.filter((s) => s.ugNumber.toUpperCase() !== ugNumber.toUpperCase()));
        if (selectedStudentForModal && selectedStudentForModal.ugNumber.toUpperCase() === ugNumber.toUpperCase()) {
          setSelectedStudentForModal(null);
        }
        showToast(`✓ Student account ${ugNumber} (${name}) has been permanently deleted.`);
        loadStats();
      } else {
        showToast(`❌ Error: ${res.error || 'Failed to delete student account.'}`);
      }
    } catch (err: any) {
      deleteStudentAccount(ugNumber);
      setAdminStudents((prev) => prev.filter((s) => s.ugNumber.toUpperCase() !== ugNumber.toUpperCase()));
      showToast(`✓ Removed student ${ugNumber} from active records.`);
    } finally {
      setDeletingStudentLoading(false);
      setStudentToDelete(null);
    }
  };

  // Handle Admin Login submission
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!adminIdInput.trim()) {
      setLoginError('Please enter the authorized Administrative ID (26UG030984).');
      return;
    }
    if (!adminPasswordInput.trim()) {
      setLoginError('Please enter the administrative security password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await api.adminLogin(adminIdInput, adminPasswordInput);
      if (!res.success || !res.session) {
        setLoginError(res.message || 'Access Denied: Invalid administrator credentials.');
      } else {
        setIsAdminAuthenticated(true);
        setAdminProfile(res.session);
        showToast(`✓ Admin Verified: Welcome, ${res.session.name}`);
        loadStats();
      }
    } catch (err: any) {
      setLoginError(err.message || 'Network error connecting to administrative gateway.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    await api.adminLogout();
    setIsAdminAuthenticated(false);
    setAdminProfile(null);
    showToast('🔒 Administrator session terminated. Backend access locked.');
  };

  // Quick fill sample event for Admin
  const handleQuickFillEvent = () => {
    setTitle('PARUL TECHNOVATION 2026 - National Innovation Summit');
    setCategory('Technical');
    setDate('Nov 20 - 22, 2026');
    setTime('09:30 AM - 06:00 PM');
    setVenue('PIET Auditorium Complex & Advanced AI Innovation Hub');
    setCampusZone('Engineering Block - North Campus, Vadodara');
    setSeatsTotal(1500);
    setRegistrationFee('Free for PU Students (Pass Required)');
    setRegistrationDeadline('Nov 15, 2026');
    setOrganizer('Faculty of Engineering & Technology, Parul University');
    setShortDesc('Flagship inter-collegiate technical summit featuring robotics, generative AI challenges, startup pitch rings, and ₹7,50,000 in cash awards.');
    setDescription('Parul Technovation 2026 brings together the brightest undergraduate minds in engineering, design, and applied sciences. Featuring live AI model showcases, autonomous robotics trials, patent drafting masterclasses, and keynote addresses by Silicon Valley and Indian tech leaders.');
    setBannerUrl('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80');
    setEligibility('Open to all registered B.Tech, BCA, MCA, and M.Tech students of Parul University and partner institutes.');
    setRulesInput('1. Valid Parul University student ID and generated Digital Barcode Pass required at entrance.\n2. Team sizes: 2 to 4 members for hackathon tracks.\n3. Hardware kits provided for robotics arena participants.\n4. Strict adherence to campus academic and event codes.');
    setBroadcastNotification(true);
    setFormError('');
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingEventId(null);
    setTitle('');
    setCategory('Cultural');
    setDate('');
    setTime('');
    setVenue('');
    setCampusZone('Main Campus, Vadodara');
    setSeatsTotal(500);
    setRegistrationFee('Free for PU Students');
    setRegistrationDeadline('');
    setOrganizer('Dean of Student Welfare & Cultural Affairs, Parul University');
    setShortDesc('');
    setDescription('');
    setBannerUrl(SAMPLE_BANNER_PRESETS[0].url);
    setEligibility('Open to all registered Parul University students.');
    setRulesInput('Valid University Digital Pass is mandatory at entrance.\nReport 15 minutes before event schedule.');
    setBroadcastNotification(true);
    setRegistrationLink('');
    setRegistrationType('both');
    setPaymentLink('');
    setPaymentQrUrl('');
    setPaymentUpiId('');
    setPaymentInstructions('');
    setFormError('');
  };

  // Upload or Update Event to Backend
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Event Title is required.');
      return;
    }
    if (!date.trim() || !time.trim()) {
      setFormError('Date and Time are required.');
      return;
    }
    if (!venue.trim()) {
      setFormError('Venue location is required.');
      return;
    }
    if (!shortDesc.trim()) {
      setFormError('Please enter a short description for the event card.');
      return;
    }

    const rulesArray = rulesInput
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const eventPayload = {
      title: title.trim(),
      category,
      date: date.trim(),
      time: time.trim(),
      venue: venue.trim(),
      campusZone: campusZone.trim(),
      seatsTotal: Number(seatsTotal) || 500,
      seatsBooked: 0,
      registrationFee: registrationFee.trim() || 'Free',
      registrationDeadline: registrationDeadline.trim() || 'Open until start',
      organizer: organizer.trim() || 'Parul University Official',
      shortDesc: shortDesc.trim(),
      description: description.trim() || shortDesc.trim(),
      bannerUrl: bannerUrl.trim(),
      eligibility: eligibility.trim(),
      rules: rulesArray.length > 0 ? rulesArray : ['Standard Parul University event guidelines apply.'],
      tags: ['Official', category, 'Parul University'],
      hasPass: true,
      isFeatured: true,
      isTrending: true,
      uploadedByAppHolder: true,
      registrationLink: registrationLink.trim() || undefined,
      registrationType,
      paymentLink: paymentLink.trim() || undefined,
      paymentQrUrl: paymentQrUrl.trim() || undefined,
      paymentUpiId: paymentUpiId.trim() || undefined,
      paymentInstructions: paymentInstructions.trim() || undefined,
      schedule: [
        { time: `${date} - ${time}`, activity: 'Official Event Commencement', location: venue.trim() },
      ],
      coordinators: [
        {
          name: adminProfile?.name || 'Dean of Student Welfare',
          role: 'Dean' as const,
          contact: '+91 2668 260300',
          email: adminProfile?.email || '26ug030984@paruluniversity.ac.in',
          department: 'Department of Student Welfare, Parul University',
        },
      ],
      broadcastNotification,
    };

    setIsSubmitting(true);
    try {
      if (isEditing && editingEventId) {
        const res = await api.updateEvent(editingEventId, eventPayload);
        if (!res.success || !res.event) {
          setFormError(res.error || 'Failed to update event in backend.');
        } else {
          onEventUpdated(res.event);
          showToast(`⚡ Event "${res.event.title}" updated in backend!`);
          resetForm();
          setActiveTab('manage');
        }
      } else {
        const res = await api.uploadEvent(eventPayload);
        if (!res.success || !res.event) {
          setFormError(res.error || 'Failed to publish event to backend.');
        } else {
          onEventCreated(res.event);
          showToast(`✓ Official Event "${res.event.title}" successfully uploaded to backend!`);
          resetForm();
          setActiveTab('manage');
        }
      }
      loadStats();
    } catch (err: any) {
      setFormError(err.message || 'Error communicating with backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (event: EventItem) => {
    setIsEditing(true);
    setEditingEventId(event.id);
    setTitle(event.title);
    setCategory(event.category);
    setDate(event.date);
    setTime(event.time);
    setVenue(event.venue);
    setCampusZone(event.campusZone || 'Main Campus, Vadodara');
    setSeatsTotal(event.seatsTotal);
    setRegistrationFee(event.registrationFee);
    setRegistrationDeadline(event.registrationDeadline);
    setOrganizer(event.organizer);
    setShortDesc(event.shortDesc);
    setDescription(event.description);
    setBannerUrl(event.bannerUrl);
    setEligibility(event.eligibility);
    setRulesInput(event.rules.join('\n'));
    setBroadcastNotification(false);
    setRegistrationLink(event.registrationLink || '');
    setRegistrationType(event.registrationType || 'both');
    setPaymentLink(event.paymentLink || '');
    setPaymentQrUrl(event.paymentQrUrl || '');
    setPaymentUpiId(event.paymentUpiId || '');
    setPaymentInstructions(event.paymentInstructions || '');
    setActiveTab('upload');
  };

  const handleDeleteClick = (event: EventItem) => {
    setEventToDelete(event);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    const event = eventToDelete;
    setDeletingEventLoading(true);
    try {
      const res = await api.deleteEvent(event.id);
      if (!res.success) {
        showToast(res.error || 'Failed to delete event.');
      } else {
        onEventDeleted(event.id);
        showToast(`✓ Event "${event.title}" deleted from backend.`);
        loadStats();
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting event.');
    } finally {
      setDeletingEventLoading(false);
      setEventToDelete(null);
    }
  };

  const handleConfirmClearAllEvents = async () => {
    setIsClearingAllEvents(true);
    try {
      const res = await api.clearAllEvents();
      if (res.success) {
        onAllEventsCleared?.();
        showToast('✓ All campus events and alerts have been cleared from backend.');
        setShowClearAllEventsModal(false);
        loadStats();
      } else {
        showToast(res.error || 'Failed to clear events.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error communicating with backend.');
    } finally {
      setIsClearingAllEvents(false);
    }
  };

  // Open Attendees Modal for Admin
  const handleOpenAttendees = async (event: EventItem) => {
    setAttendeeModalEvent(event);
    setLoadingAttendees(true);
    try {
      const list = await api.fetchAttendees(event.id);
      setAttendeesList(list);
    } catch {
      setAttendeesList([]);
    } finally {
      setLoadingAttendees(false);
    }
  };

  // Broadcast Alert to All Students
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('Please enter both broadcast title and alert message.');
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await api.broadcastNotification({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        type: broadcastType,
        relatedEventId: selectedBroadcastEventId || undefined,
      });

      if (!res.success) {
        showToast(res.error || 'Failed to broadcast alert.');
      } else {
        onNotificationBroadcast(broadcastTitle, broadcastMessage);
        showToast('📢 Official campus alert broadcasted to all student accounts!');
        setBroadcastTitle('');
        setBroadcastMessage('');
        loadStats();
      }
    } catch (err: any) {
      showToast(err.message || 'Error broadcasting alert.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Filtered Events for Management Table
  const filteredManageEvents = (events || []).filter((ev) => {
    const matchesCat = manageCategory === 'All' || ev.category === manageCategory;
    const term = searchManageTerm.toLowerCase();
    const matchesSearch =
      searchManageTerm === '' ||
      (ev.title || '').toLowerCase().includes(term) ||
      (ev.venue || '').toLowerCase().includes(term) ||
      (ev.category || '').toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  // --------------------------------------------------------------------------
  // RENDER: IF NOT AUTHENTICATED AS ADMIN -> SHOW SECURITY LOGIN GATE
  // --------------------------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-14 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Security Gate Header */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.2),transparent_60%)]" />
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300 shadow-lg">
                <Lock className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-xs font-bold text-rose-300 tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Restricted Access • Admin Only</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Parul University Backend Administrative Gateway
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                Event uploading, backend database controls, and campus broadcasts are restricted to authorized university administrators. Regular students cannot access this section.
              </p>
            </div>
          </div>

          {/* Admin Login Form */}
          <form onSubmit={handleAdminLoginSubmit} className="p-6 sm:p-8 space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Administrative ID
              </label>
              <input
                type="text"
                value={adminIdInput}
                onChange={(e) => setAdminIdInput(e.target.value)}
                placeholder="Enter Administrative ID (26UG030984)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:bg-white font-mono uppercase"
                required
                autoComplete="off"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Authorized Parul University administrative personnel ID
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Administrative Password
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Enter Administrator Password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:bg-white"
                required
                autoComplete="current-password"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Strict security protection: Access to the admin portal is completely locked without valid ID & password.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Administrator Token...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authenticate & Open Admin Portal</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToStudentPortal}
                className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                Back to Student Portal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: AUTHENTICATED ADMIN DASHBOARD & EVENT UPLOAD PORTAL
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-rose-600/30 border border-rose-500/50 text-[11px] font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Administration
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Backend Live (Express Port 3000)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Event Management & Upload Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Logged in as <strong className="text-white">{adminProfile?.name}</strong> ({adminProfile?.role}).
              Changes made here are permanently committed to the backend database and broadcast to all student applications in real time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm border border-emerald-400/40"
              title="Export all student accounts to Excel file (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={onBackToStudentPortal}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Student View</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Admin Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('upload');
            if (isEditing) resetForm();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'upload'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>{isEditing ? 'Edit Selected Event' : 'Upload New Event'}</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'manage'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Manage Events & Registrations ({events.length})</span>
        </button>

        {/* NEW: Student Accounts (Excel Directory) Tab */}
        <button
          onClick={() => {
            setActiveTab('students-excel');
            loadStudents();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'students-excel'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
          <span>Student Accounts (Excel Directory)</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'students-excel' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'
          }`}>
            {adminStudents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'broadcast'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Broadcast Campus Alert</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('stats');
            loadStats();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'stats'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Metrics</span>
        </button>
      </div>

      {/* ---------------------------------------------------------------------
          TAB 1: EVENT UPLOAD FORM (ADMIN ONLY)
          --------------------------------------------------------------------- */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold uppercase mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Authority</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {isEditing ? 'Modify University Event in Backend' : 'Upload Official University Event'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Submit event details to save directly into the backend storage. Students will immediately receive passes and notifications.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleQuickFillEvent}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Auto-Fill Sample Event</span>
                </button>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmitEvent} className="mt-6 space-y-6">
            {formError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Vadodara Hackathon 5.0 or DHOOM 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-rose-600 focus:outline-none bg-white"
                >
                  <option value="Cultural">Cultural & Fests</option>
                  <option value="Technical">Technical & Hackathons</option>
                  <option value="Sports">Sports & Athletics</option>
                  <option value="Workshops">Workshops & Seminars</option>
                  <option value="Placements">Placements & Careers</option>
                  <option value="Clubs">Clubs & Student Chapters</option>
                  <option value="Celebrity Nights">Celebrity Nights & Conclaves</option>
                  <option value="Abroad Study">Abroad Study Events</option>
                  <option value="Competitive Exams">Competitive Exam Events</option>
                </select>
              </div>
            </div>

            {/* Date, Time, Venue, Zone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date(s) *
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Oct 14 - 16, 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Time *
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 04:00 PM onwards"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Venue Location *
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Open Air Theatre (OAT)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Campus Zone
                </label>
                <input
                  type="text"
                  value={campusZone}
                  onChange={(e) => setCampusZone(e.target.value)}
                  placeholder="e.g. Engineering Complex - North Campus"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Capacity, Fee, Deadline, Organizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Seat Capacity
                </label>
                <input
                  type="number"
                  value={seatsTotal}
                  onChange={(e) => setSeatsTotal(parseInt(e.target.value) || 100)}
                  min={1}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registration Fee
                </label>
                <input
                  type="text"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(e.target.value)}
                  placeholder="Free for PU Students or ₹100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registration Deadline
                </label>
                <input
                  type="text"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  placeholder="e.g. Oct 10, 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Organizing Body / Faculty
                </label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="Department of Student Welfare"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* ATTACHED REGISTRATION LINK & EVENT PAYMENT GATEWAY / UPI QR */}
            {/* ------------------------------------------------------------- */}
            <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-50/60 via-slate-50 to-amber-50/40 border-2 border-rose-200/90 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-rose-200/80">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>Registration & Payment Gateway Integration</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Event Registration Link & Fee Payment Setup
                  </h3>
                  <p className="text-xs text-slate-600">
                    Attach official external registration forms (Google Forms, Unstop, PU Portal) and configure online fee payment with checkout link or uploaded UPI QR Code.
                  </p>
                </div>
              </div>

              {/* 1. ATTACH REGISTRATION LINK SECTION */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Attached Registration Link & Enrollment Mode
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Provide a direct web link for student signups or manage digital passes through the app.
                    </p>
                  </div>
                </div>

                {/* Registration Mode Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Student Registration Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'both' as const,
                        label: 'Hybrid (Pass + External Link)',
                        desc: 'Generates in-app Digital Pass AND provides official external form',
                      },
                      {
                        id: 'internal' as const,
                        label: 'Direct In-App Pass Only',
                        desc: 'Instant gate barcode pass with 1-click in PU app',
                      },
                      {
                        id: 'external' as const,
                        label: 'External Link Required',
                        desc: 'Students redirected to external form / portal',
                      },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setRegistrationType(mode.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          registrationType === mode.id
                            ? 'border-rose-600 bg-rose-50/70 ring-2 ring-rose-200'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                          <span>{mode.label}</span>
                          {registrationType === mode.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 leading-tight">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Registration Link Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Event Registration URL Link
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRegistrationLink('https://forms.google.com/sample-pu-event-registration')}
                        className="text-[10px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 transition-colors"
                      >
                        + Google Form
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegistrationLink('https://unstop.com/competitions/parul-university')}
                        className="text-[10px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 transition-colors"
                      >
                        + Unstop
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegistrationLink('https://paruluniversity.ac.in/events/registration')}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                      >
                        + PU Portal
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={registrationLink}
                        onChange={(e) => setRegistrationLink(e.target.value)}
                        placeholder="e.g. https://forms.gle/xyz123 or https://unstop.com/..."
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                      />
                      <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {registrationLink && (
                      <a
                        href={registrationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 border border-slate-200 shrink-0"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    When provided, students will see a direct <strong>"Open Official Registration Form"</strong> action button on the Event Details screen.
                  </p>
                </div>
              </div>

              {/* 2. EVENT PAYMENT & UPI QR CODE SECTION */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Event Payment Gateway & UPI QR Upload Section
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Configure payment checkout links and upload an official UPI QR code for student registration fee collection.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Gateway Link */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Online Payment / Checkout Link
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={paymentLink}
                        onChange={(e) => setPaymentLink(e.target.value)}
                        placeholder="e.g. https://rzp.io/l/... or https://paytm.me/..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Razorpay, Paytm, Stripe, or University Payment Gateway link
                    </span>
                  </div>

                  {/* UPI ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official University UPI ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={paymentUpiId}
                        onChange={(e) => setPaymentUpiId(e.target.value)}
                        placeholder="e.g. paruluniversity.dsw@icici or events.pu@sbi"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none font-mono"
                      />
                      <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Students can copy this UPI ID to pay instantly via Google Pay, PhonePe, or Paytm
                    </span>
                  </div>
                </div>

                {/* Upload or Choose Payment QR Code */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      UPI Payment QR Code (Upload Image or Choose Official Preset)
                    </label>
                    <div className="flex items-center gap-2">
                      {SAMPLE_PAYMENT_QR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPaymentQrUrl(preset.url);
                            setPaymentUpiId(preset.upiId);
                            showToast(`✓ Applied ${preset.name}`);
                          }}
                          className="text-[10px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition-colors"
                        >
                          + {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hidden File Input for Admin QR Upload */}
                  <input
                    ref={paymentQrFileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handlePaymentQrFileUpload}
                    className="hidden"
                  />

                  {/* QR Code Upload Drag/Click Box & Preview Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div
                      onClick={() => paymentQrFileRef.current?.click()}
                      className="sm:col-span-8 p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/60 hover:bg-amber-50/30 transition-all text-center cursor-pointer flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-2xs border border-slate-200 mb-1.5">
                        <FileUp className="w-5 h-5 text-amber-600" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to <span className="text-amber-700 underline">upload UPI Payment QR Code</span> from device
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Supports PNG, JPG, JPEG, WEBP image files (Max 5MB)
                      </p>
                    </div>

                    {/* QR Preview Card */}
                    <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      {paymentQrUrl ? (
                        <div className="space-y-1.5 w-full flex flex-col items-center">
                          <img
                            src={paymentQrUrl}
                            alt="Payment QR"
                            referrerPolicy="no-referrer"
                            className="w-24 h-24 rounded-xl object-contain border border-slate-300 bg-white p-1 shadow-xs"
                          />
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ QR Attached
                          </span>
                          <button
                            type="button"
                            onClick={() => setPaymentQrUrl('')}
                            className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Remove QR
                          </button>
                        </div>
                      ) : (
                        <div className="py-3 text-slate-400 text-center space-y-1">
                          <QrCode className="w-10 h-10 mx-auto text-slate-300" />
                          <span className="text-[11px] block text-slate-400">No QR Code attached</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QR Image URL Input fallback */}
                  <div className="pt-1">
                    <input
                      type="url"
                      value={paymentQrUrl}
                      onChange={(e) => setPaymentQrUrl(e.target.value)}
                      placeholder="Or paste direct Payment QR image URL (https://...)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Payment Instructions for Students */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Payment & Verification Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={paymentInstructions}
                    onChange={(e) => setPaymentInstructions(e.target.value)}
                    placeholder="e.g. Scan the UPI QR code above or use the payment link. Enter your 12-digit UPI Transaction ID / UTR number for verification."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Banner Presets & Custom Banner URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Event Banner Graphic
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3">
                {SAMPLE_BANNER_PRESETS.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setBannerUrl(preset.url)}
                    className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                      bannerUrl === preset.url ? 'border-rose-600 ring-2 ring-rose-200' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-16 object-cover"
                    />
                    <div className="p-1.5 bg-white text-[10px] font-bold text-slate-800 truncate">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Custom image URL: https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Short Description & Full Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Card Short Summary * (1-2 sentences)
                </label>
                <textarea
                  rows={3}
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Brief summary that appears on the Home feed cards..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Description & Event Objectives
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive event details, keynote speakers, competition tracks..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Eligibility & Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student Eligibility Criteria
                </label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. Open to all UG/PG students with valid enrollment number."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Rules (One per line)
                </label>
                <textarea
                  rows={2}
                  value={rulesInput}
                  onChange={(e) => setRulesInput(e.target.value)}
                  placeholder="Rule 1&#10;Rule 2"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-rose-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Broadcast Notification Checkbox */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <input
                type="checkbox"
                id="broadcastNotif"
                checked={broadcastNotification}
                onChange={(e) => setBroadcastNotification(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <label htmlFor="broadcastNotif" className="text-xs sm:text-sm text-slate-700 cursor-pointer">
                <strong>Broadcast Flash Notification:</strong> Instantly notify all students across Home Feed and Alerts when published to backend.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Committing to Backend...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>{isEditing ? 'Save Updates to Backend' : 'Publish Official Event to Backend'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          TAB 2: MANAGE ALL EVENTS & ATTENDEES (ADMIN ONLY)
          --------------------------------------------------------------------- */}
      {activeTab === 'manage' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Backend Event Inventory & Student Bookings
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                View seats, inspect enrolled student rosters, edit schedules, or remove events from the backend database.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {events.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearAllEventsModal(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Clear all events from home, alerts, and categories"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Events</span>
                </button>
              )}
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('upload');
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Another Event</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchManageTerm}
                onChange={(e) => setSearchManageTerm(e.target.value)}
                placeholder="Search event title, venue, or category..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
              />
            </div>

            <select
              value={manageCategory}
              onChange={(e) => setManageCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold bg-white w-full sm:w-auto"
            >
              <option value="All">All Categories ({events.length})</option>
              <option value="Cultural">Cultural</option>
              <option value="Technical">Technical</option>
              <option value="Sports">Sports</option>
              <option value="Workshops">Workshops</option>
              <option value="Placements">Placements</option>
              <option value="Clubs">Clubs</option>
              <option value="Celebrity Nights">Celebrity Nights</option>
              <option value="Abroad Study">Abroad Study</option>
              <option value="Competitive Exams">Competitive Exams</option>
            </select>
          </div>

          {/* Events Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Event Title & Details</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date & Venue</th>
                  <th className="px-4 py-3">Capacity & Registrations</th>
                  <th className="px-4 py-3 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredManageEvents.map((ev) => {
                  const percent = Math.min(100, Math.round(((ev.seatsBooked || 0) / (ev.seatsTotal || 1)) * 100));
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={ev.bannerUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 leading-snug">{ev.title}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{ev.shortDesc}</div>
                            {ev.uploadedByAppHolder && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                Uploaded by Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-700">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                          {ev.category}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 leading-tight">
                        <div className="font-semibold text-slate-800">{ev.date}</div>
                        <div className="text-[11px] text-slate-500">{ev.venue}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                            <span>{ev.seatsBooked || 0} booked</span>
                            <span>{ev.seatsTotal} total</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${percent > 90 ? 'bg-rose-600' : 'bg-emerald-600'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAttendees(ev)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                            title="View registered students roster"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Students</span>
                          </button>

                          <button
                            onClick={() => handleEditClick(ev)}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors"
                            title="Edit Event"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(ev)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredManageEvents.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs sm:text-sm">
                No events match the current search filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          TAB: STUDENT ACCOUNTS & REAL-TIME EXCEL DIRECTORY (ADMIN ONLY)
          --------------------------------------------------------------------- */}
      {activeTab === 'students-excel' && (
        <div className="space-y-6">
          {/* Top Banner Card with Excel Branding */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-emerald-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wider uppercase">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Microsoft Excel & Spreadsheet Directory</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Student Accounts Database & Excel Ledger
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                  Whenever any user creates an account in the Parul University Events portal, their university credentials, UG Enrollment Number, department, and event passes are permanently stored in the administrative database and synchronized in this Excel directory.
                </p>
              </div>

              {/* Action Buttons for Excel & CSV Export */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  title="Download full student directory as .xlsx Excel workbook"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>Download Excel (.xlsx)</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
                  title="Download student accounts as UTF-8 CSV for Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleCopyTsv}
                  className="px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
                  title="Copy rows formatted for instant Ctrl+V paste into Excel or Google Sheets"
                >
                  {copiedTsv ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-300" />
                      <span>Copy for Excel</span>
                    </>
                  )}
                </button>

                <button
                  onClick={loadStudents}
                  disabled={loadingStudents}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
                  title="Refresh latest student accounts"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingStudents ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-500/20">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Registered Accounts</div>
                <div className="text-2xl font-black text-white mt-0.5">{adminStudents.length}</div>
                <div className="text-[10px] text-emerald-200/70 mt-0.5">Stored in data/db.json</div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Booked Event Passes</div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {adminStudents.reduce((acc, s) => acc + (s.registeredEventsCount || 0), 0)}
                </div>
                <div className="text-[10px] text-emerald-200/70 mt-0.5">Total tickets issued</div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">PU Departments</div>
                <div className="text-2xl font-black text-white mt-0.5">{uniqueStudentDepartments.length}</div>
                <div className="text-[10px] text-emerald-200/70 mt-0.5">Across Parul University</div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Excel Format</div>
                <div className="text-sm font-black text-emerald-300 mt-1">Microsoft .XLSX / CSV</div>
                <div className="text-[10px] text-emerald-200/70 mt-0.5">UTF-8 BOM Compatible</div>
              </div>
            </div>
          </div>

          {/* Spreadsheet Controls & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                placeholder="Search by student name, UG number (e.g. PU26UG034823), email, phone, or faculty..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              {studentSearchTerm && (
                <button
                  onClick={() => setStudentSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={studentDeptFilter}
                  onChange={(e) => setStudentDeptFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold bg-white w-full md:w-48"
                >
                  <option value="All">All Departments ({adminStudents.length})</option>
                  {uniqueStudentDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={`${sortField}-${sortAsc ? 'asc' : 'desc'}`}
                  onChange={(e) => {
                    const [field, dir] = e.target.value.split('-');
                    setSortField(field as any);
                    setSortAsc(dir === 'asc');
                  }}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold bg-white w-full md:w-48"
                >
                  <option value="registeredAt-desc">Newest First</option>
                  <option value="registeredAt-asc">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="ugNumber-asc">UG Number (Ascending)</option>
                  <option value="registeredEventsCount-desc">Most Passes Booked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Excel Worksheet Grid */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            {/* Excel Formula Bar */}
            <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center gap-3 text-xs font-mono text-slate-700">
              <div className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-800 shrink-0">
                A1:K{filteredStudents.length + 1}
              </div>
              <div className="font-bold text-slate-400 select-none">fx</div>
              <div className="flex-1 truncate text-slate-600 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                =DATA_STORE(&apos;students&apos;) [Matches: {filteredStudents.length} / Total: {adminStudents.length}]
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Synced
                </span>
              </div>
            </div>

            {/* Excel Table */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                {/* Excel Column Letters */}
                <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 z-10 border-b-2 border-slate-300 select-none">
                  <tr>
                    <th className="px-3 py-2 text-center w-12 bg-slate-200 border-r border-slate-300 text-[10px] text-slate-500 uppercase">
                      #
                    </th>
                    <th className="px-3.5 py-2.5 border-r border-slate-200 text-[11px] font-extrabold text-slate-700 tracking-wider">
                      <span className="text-[10px] text-slate-400 block font-mono">A</span>
                      UG Enrollment No.
                    </th>
                    <th className="px-3.5 py-2.5 border-r border-slate-200 text-[11px] font-extrabold text-slate-700 tracking-wider">
                      <span className="text-[10px] text-slate-400 block font-mono">B</span>
                      Full Name
                    </th>
                    <th className="px-3.5 py-2.5 border-r border-slate-200 text-[11px] font-extrabold text-slate-700 tracking-wider">
                      <span className="text-[10px] text-slate-400 block font-mono">C</span>
                      Student Email
                    </th>
                    <th className="px-3.5 py-2.5 border-r border-slate-200 text-[11px] font-extrabold text-slate-700 tracking-wider">
                      <span className="text-[10px] text-slate-400 block font-mono">D</span>
                      Phone
                    </th>
                    <th className="px-3.5 py-2.5 border-r border-slate-200 text-[11px] font-extrabold text-slate-700 tracking-wider">
                      <span className="text-[10px] text-slate-400 block font-mono">E</span>
                      Department
                    </th>
                    <th className="px-3.5 py-2.5 border-r border-slate-200 text-[11px] font-extrabold text-slate-700 tracking-wider">
                      <span className="text-[10px] text-slate-400 block font-mono">F</span>
                      Institute
                    </th>
                    <th className="px-3.5 py-2.5 border-r border-slate-200 text-[11px] font-extrabold text-slate-700 tracking-wider">
                      <span className="text-[10px] text-slate-400 block font-mono">G</span>
                      Registered Date
                    </th>
                    <th className="px-3.5 py-2.5 border-r border-slate-200 text-[11px] font-extrabold text-slate-700 tracking-wider text-center">
                      <span className="text-[10px] text-slate-400 block font-mono">H</span>
                      Event Passes
                    </th>
                    <th className="px-3.5 py-2.5 border-r border-slate-200 text-[11px] font-extrabold text-slate-700 tracking-wider text-center">
                      <span className="text-[10px] text-slate-400 block font-mono">I</span>
                      Status
                    </th>
                    <th className="px-3.5 py-2.5 text-[11px] font-extrabold text-slate-700 tracking-wider text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">J</span>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 font-normal">
                  {filteredStudents.map((student, idx) => (
                    <tr
                      key={student.ugNumber}
                      className="hover:bg-emerald-50/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudentForModal(student)}
                    >
                      {/* Row Index */}
                      <td className="px-3 py-3 text-center bg-slate-100/70 border-r border-slate-300 text-slate-500 font-mono text-[11px] font-bold select-none group-hover:bg-emerald-100/80">
                        {idx + 1}
                      </td>

                      {/* UG Number */}
                      <td className="px-3.5 py-3 border-r border-slate-200 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-900 group-hover:border-emerald-300">
                          {student.ugNumber}
                        </span>
                      </td>

                      {/* Full Name */}
                      <td className="px-3.5 py-3 border-r border-slate-200 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">{student.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{student.semester || 'Student'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-3.5 py-3 border-r border-slate-200 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        <a
                          href={`mailto:${student.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-emerald-700 hover:underline"
                        >
                          {student.email}
                        </a>
                      </td>

                      {/* Phone */}
                      <td className="px-3.5 py-3 border-r border-slate-200 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        {student.phone || 'N/A'}
                      </td>

                      {/* Department */}
                      <td className="px-3.5 py-3 border-r border-slate-200 text-slate-800 font-medium">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                          {student.department}
                        </span>
                      </td>

                      {/* Institute */}
                      <td className="px-3.5 py-3 border-r border-slate-200 text-slate-600 text-[11px] max-w-[200px] truncate" title={student.institute}>
                        {student.institute || 'Parul University'}
                      </td>

                      {/* Registered Date */}
                      <td className="px-3.5 py-3 border-r border-slate-200 text-slate-600 whitespace-nowrap text-[11px] font-mono">
                        {student.registeredAt || 'Active'}
                      </td>

                      {/* Event Passes */}
                      <td className="px-3.5 py-3 border-r border-slate-200 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentForModal(student);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-transform hover:scale-105 ${
                            (student.registeredEventsCount || 0) > 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <Ticket className="w-3 h-3" />
                          <span>{student.registeredEventsCount || 0} Pass{(student.registeredEventsCount || 0) === 1 ? '' : 'es'}</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3 border-r border-slate-200 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedStudentForModal(student)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                            title="Inspect Student Record & Passes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteStudent(student.ugNumber, student.name, student.email, student.registeredEventsCount || 0)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors cursor-pointer"
                            title="Delete Student Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-700 text-base">No Student Accounts Found</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {studentSearchTerm
                      ? `No student matching "${studentSearchTerm}". Try adjusting your search query.`
                      : 'No students have created accounts in the app yet. Accounts created in the student registration portal will automatically appear here.'}
                  </p>
                </div>
              )}
            </div>

            {/* Excel Status Bar Footer */}
            <div className="bg-slate-100 border-t border-slate-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-mono select-none">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  EXCEL STATUS: READY
                </span>
                <span className="text-slate-400">|</span>
                <span>Visible Rows: <strong>{filteredStudents.length}</strong></span>
                <span className="text-slate-400">|</span>
                <span>Total Directory: <strong>{adminStudents.length}</strong> accounts</span>
              </div>

              <div className="flex items-center gap-4">
                <span>Sum of Passes: <strong>{filteredStudents.reduce((a, s) => a + (s.registeredEventsCount || 0), 0)}</strong></span>
                <span className="text-slate-400">|</span>
                <button
                  onClick={handleExportExcel}
                  className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export .xlsx
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          TAB 3: CAMPUS BROADCAST ALERTS (ADMIN ONLY)
          --------------------------------------------------------------------- */}
      {activeTab === 'broadcast' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold uppercase mb-1">
              <Bell className="w-3.5 h-3.5" />
              <span>Broadcast Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Push Live Alert to All Student Portals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Publish high-priority official announcements, urgent venue changes, or registration alerts directly to the backend notification feed.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Announcement Headline *
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Venue Change Notice: Kalam Hall Entrance Protocols"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alert Priority Type
                </label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold bg-white"
                >
                  <option value="urgent">🔴 Urgent Campus Alert</option>
                  <option value="schedule">⚡ Schedule / Venue Update</option>
                  <option value="registration">🎟️ Registration Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Link to Relevant Event (Optional)
                </label>
                <select
                  value={selectedBroadcastEventId}
                  onChange={(e) => setSelectedBroadcastEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white truncate"
                >
                  <option value="">None (General University Broadcast)</option>
                  {(events || []).map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Broadcast Body Message *
              </label>
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Detailed announcement text that will flash across all student alert centers..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isBroadcasting}
                className="py-3 px-6 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isBroadcasting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Send University Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          TAB 4: SYSTEM METRICS & TELEMETRY (ADMIN ONLY)
          --------------------------------------------------------------------- */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{adminStats?.totalEvents || events.length}</div>
                <div className="text-xs text-slate-500 font-semibold">Total Events in Backend</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{adminStats?.totalRegistrations || 0}</div>
                <div className="text-xs text-slate-500 font-semibold">Total Event Registrations</div>
              </div>
            </div>

            <div
              onClick={() => {
                setActiveTab('students-excel');
                loadStudents();
              }}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group"
              title="Click to view full Excel Student Directory"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{adminStudents.length || adminStats?.totalStudents || 0}</div>
                <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 group-hover:text-emerald-700">
                  <span>Student Accounts (Excel)</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">Active</div>
                <div className="text-xs text-slate-500 font-semibold">Express REST Backend</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Category Distribution in Backend Repository
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(adminStats?.eventsByCategory || {}).map(([cat, count]) => (
                <div key={cat} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">{cat}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {count} events
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          MODAL: ATTENDEES ROSTER MODAL (ADMIN ONLY)
          --------------------------------------------------------------------- */}
      <AnimatePresence>
        {attendeeModalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                    Official Student Attendance Roster
                  </div>
                  <h3 className="text-lg font-black">{attendeeModalEvent.title}</h3>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {attendeesList.length} registered students • {attendeeModalEvent.seatsTotal} total capacity
                  </div>
                </div>

                <button
                  onClick={() => setAttendeeModalEvent(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-3">
                {loadingAttendees ? (
                  <div className="p-8 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading registered attendees from backend...</span>
                  </div>
                ) : attendeesList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No students have registered for this event yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(attendeesList || []).map((attendee, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{attendee.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                              {attendee.ugNumber}
                            </span>
                          </div>
                          <div className="text-slate-500">{attendee.email} • {attendee.department}</div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-[11px] font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                            {attendee.ticketId}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setAttendeeModalEvent(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Close Roster
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Student Account Details & Event Passes Modal */}
        {selectedStudentForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-black text-emerald-300">
                    {selectedStudentForModal.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Student Account Record (Excel Directory)</span>
                    </div>
                    <h3 className="text-xl font-black text-white leading-tight">
                      {selectedStudentForModal.name}
                    </h3>
                    <div className="text-xs text-emerald-200 font-mono mt-0.5">
                      Enrollment: <strong>{selectedStudentForModal.ugNumber}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudentForModal(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Academic & Contact Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      Student Email Address
                    </div>
                    <div className="text-xs font-semibold text-slate-900 font-mono select-all">
                      {selectedStudentForModal.email}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      Contact Phone
                    </div>
                    <div className="text-xs font-semibold text-slate-900 font-mono select-all">
                      {selectedStudentForModal.phone || 'Not Provided'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-slate-500" />
                      Department / Faculty
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      {selectedStudentForModal.department}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-500" />
                      Institute Campus
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      {selectedStudentForModal.institute || 'Parul University, Vadodara'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Semester & Academic Batch
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      {selectedStudentForModal.semester || 'Current Semester'} • Batch {selectedStudentForModal.batch || '2024-2028'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Account Registered On
                    </div>
                    <div className="text-xs font-semibold text-slate-900 font-mono">
                      {selectedStudentForModal.registeredAt || 'Active Verified'}
                    </div>
                  </div>
                </div>

                {/* Event Passes Held Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-emerald-600" />
                      <span>Registered Event Passes ({selectedStudentForModal.registeredEventsCount || 0})</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Synced from student tickets ledger
                    </span>
                  </div>

                  {(!selectedStudentForModal.registeredEventsList || selectedStudentForModal.registeredEventsList.length === 0) ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500 text-xs">
                      This student has not booked any event passes yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedStudentForModal.registeredEventsList.map((evItem) => (
                        <div
                          key={evItem.id}
                          className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {evItem.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>Event ID: {evItem.id}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">Confirmed Booking</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
                              {evItem.ticketId || 'PU-TKT-CONFIRMED'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      api.exportStudentsToExcel([selectedStudentForModal], `Student_${selectedStudentForModal.ugNumber}`);
                      showToast(`✓ Exported single student record for ${selectedStudentForModal.name} (.xlsx)`);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Record to Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      handleDeleteStudent(
                        selectedStudentForModal.ugNumber,
                        selectedStudentForModal.name,
                        selectedStudentForModal.email,
                        selectedStudentForModal.registeredEventsCount || 0
                      );
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Permanently remove this student account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedStudentForModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Student Account Confirmation Modal */}
        {studentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col"
            >
              <div className="p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Delete Student Account</h3>
                    <p className="text-xs text-rose-100">Permanent Campus Directory Removal</p>
                  </div>
                </div>
                <button
                  onClick={() => setStudentToDelete(null)}
                  disabled={deletingStudentLoading}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Are you sure you want to delete this student account?</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    This will permanently delete the student account from Parul University records, revoke their access to login, delete their event passes, and remove them from all event attendee lists.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Student Name:</span>
                    <span className="text-slate-900 font-bold">{studentToDelete.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">UG Enrollment ID:</span>
                    <span className="text-slate-900 font-mono font-bold">{studentToDelete.ugNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Email Address:</span>
                    <span className="text-slate-900 font-mono">{studentToDelete.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Active Passes:</span>
                    <span className="text-slate-900 font-semibold">{studentToDelete.eventsCount} event pass(es)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStudentToDelete(null)}
                  disabled={deletingStudentLoading}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteStudent}
                  disabled={deletingStudentLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  {deletingStudentLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete Student</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Event Confirmation Modal */}
        {eventToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col"
            >
              <div className="p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Delete University Event</h3>
                    <p className="text-xs text-rose-100">Permanent Backend Removal</p>
                  </div>
                </div>
                <button
                  onClick={() => setEventToDelete(null)}
                  disabled={deletingEventLoading}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Confirm Event Deletion</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    Are you sure you want to permanently delete <strong>"{eventToDelete.title}"</strong>? This will remove the event and all associated bookings from the university backend.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEventToDelete(null)}
                  disabled={deletingEventLoading}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteEvent}
                  disabled={deletingEventLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  {deletingEventLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Event</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Clear All Events Confirmation Modal */}
        {showClearAllEventsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-red-300 overflow-hidden flex flex-col"
            >
              <div className="p-5 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Clear All Events</h3>
                    <p className="text-xs text-rose-100">Wipe Home, Alerts & Categories</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClearAllEventsModal(false)}
                  disabled={isClearingAllEvents}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Warning: Irreversible Data Reset</span>
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">
                    This will permanently delete all {events.length} events uploaded to the portal, wipe associated student attendee lists, clear alert broadcasts, and reset Home, Alerts, and Categories dashboards to clean state.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClearAllEventsModal(false)}
                  disabled={isClearingAllEvents}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearAllEvents}
                  disabled={isClearingAllEvents}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  {isClearingAllEvents ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Clearing All Events...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Clear All Events</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
