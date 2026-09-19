import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ParulLogo } from './ParulLogo';
import { DashboardId, RegisteredAccount } from '../types';
import {
  authenticateStudent,
  registerStudentAccount,
  getRegisteredStudents,
} from '../utils/authStorage';
import { api } from '../utils/api';
import {
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  GraduationCap,
  UserPlus,
  Mail,
  Phone,
  Building,
  User,
} from 'lucide-react';

interface Dashboard2LoginProps {
  onLoginSuccess: (ugNumber: string, studentName?: string, account?: RegisteredAccount) => void;
  onNavigate: (dashboardId: DashboardId) => void;
  currentUgNumber?: string;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Dashboard2Login: React.FC<Dashboard2LoginProps> = ({
  onLoginSuccess,
  onNavigate,
  currentUgNumber = '',
  isLoggedIn,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(isLoggedIn && currentUgNumber ? currentUgNumber : '26UG030789');
  const [loginPassword, setLoginPassword] = useState(isLoggedIn ? '' : 'Parul@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUgNumber, setRegUgNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering (PIET)');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // Handle Login submission with backend synchronization
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your registered UG Number (e.g. 26UG030789) or Email ID.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage('Please enter your portal password.');
      return;
    }

    setIsLoading(true);

    try {
      // First try backend authentication API
      const apiResult = await api.studentLogin(loginIdentifier.trim(), loginPassword.trim());
      if (apiResult.success && apiResult.account) {
        setIsLoading(false);
        onLoginSuccess(apiResult.account.ugNumber, apiResult.account.name, apiResult.account);
        onNavigate('dashboard-3-home');
        return;
      }

      // Local fallback for offline/instant mode
      const authResult = authenticateStudent(loginIdentifier, loginPassword);
      setIsLoading(false);

      if (!authResult.success) {
        setErrorMessage(apiResult.message || authResult.message);
        return;
      }

      if (authResult.account) {
        onLoginSuccess(authResult.account.ugNumber, authResult.account.name, authResult.account);
        onNavigate('dashboard-3-home');
      }
    } catch {
      // Fallback to local authentication
      const authResult = authenticateStudent(loginIdentifier, loginPassword);
      setIsLoading(false);
      if (!authResult.success) {
        setErrorMessage(authResult.message);
      } else if (authResult.account) {
        onLoginSuccess(authResult.account.ugNumber, authResult.account.name, authResult.account);
        onNavigate('dashboard-3-home');
      }
    }
  };

  // Handle Register submission with backend storage
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name in the name section.');
      return;
    }
    if (!regUgNumber.trim()) {
      setErrorMessage('Please enter your Parul University UG Number (e.g. 26UG456789).');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Please enter your student email ID.');
      return;
    }
    if (!regPhone.trim()) {
      setErrorMessage('Please enter your contact phone number.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    const newAccount: RegisteredAccount = {
      name: regName.trim(),
      ugNumber: regUgNumber.trim().toUpperCase(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      phone: regPhone.trim(),
      institute: 'Parul Institute of Technology & Applied Sciences',
      department: regDepartment,
      semester: '4th Semester',
      batch: '2024 - 2028',
    };

    try {
      // Register in backend database
      const backendRes = await api.studentRegister(newAccount);
      registerStudentAccount(newAccount); // Local cache

      setIsLoading(false);
      if (!backendRes.success) {
        setErrorMessage(backendRes.message || 'Registration failed.');
        return;
      }

      setSuccessMessage(backendRes.message || 'Account successfully registered!');
      setTimeout(() => {
        onLoginSuccess(newAccount.ugNumber, newAccount.name, newAccount);
        onNavigate('dashboard-3-home');
      }, 500);
    } catch {
      const result = registerStudentAccount(newAccount);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      setSuccessMessage(result.message);
      setTimeout(() => {
        if (result.account) {
          onLoginSuccess(result.account.ugNumber, result.account.name, result.account);
          onNavigate('dashboard-3-home');
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4 sm:p-6 my-2">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        {/* Left Visual Column: Collegiate Brand Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#800020] via-[#940026] to-[#400010] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-rose-500/15 blur-2xl"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl"></div>

          <div className="relative z-10 space-y-6">
            <ParulLogo size="md" variant="dark" showTagline={true} />

            <div className="pt-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-sm border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Student Access Only</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                Parul University Events Gate
              </h2>

              <p className="text-sm text-rose-100/90 leading-relaxed">
                Access to the campus events portal, schedule feeds, and digital entry barcode passes is strictly reserved for registered Parul University students.
              </p>
            </div>

            {/* University Trust Points */}
            <div className="space-y-3 pt-4 border-t border-rose-800/60 text-xs text-rose-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Verified student accounts only (Aman Singh pre-registered)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instant QR Entry Passes for OAT & Auditoriums</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Personalized certificates and notifications</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 text-[11px] text-rose-200/80">
            Parul University • Post Limda, Waghodia, Vadodara, Gujarat 391760
          </div>
        </div>

        {/* Right Form Column: Authentication & Registration */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-slate-50/50">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {authMode === 'login'
                    ? 'Enter your registered Parul University credentials to proceed.'
                    : 'Register your official student details to access the portal.'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-rose-600" />
                <span>Restricted</span>
              </span>
            </div>

            {/* Currently Logged In Box (if already logged in) */}
            {isLoggedIn ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-700">Active Verified Session</div>
                    <div className="text-sm font-bold text-slate-900">{loginIdentifier || currentUgNumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('dashboard-3-home')}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Open Events Feed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onLogout}
                    className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : null}

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-relaxed font-semibold">{successMessage}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN (Strictly checks registered accounts) */}
            {authMode === 'login' && (
              <div className="space-y-4">
                {/* Official Student Credentials Card */}
                <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-900">
                    <GraduationCap className="w-4 h-4 text-rose-700 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">Student Login ID:</span>{' '}
                      <span className="font-mono font-bold text-slate-900 bg-white/90 px-1.5 py-0.5 rounded border border-amber-200">26UG030789</span>
                      <span className="mx-1 text-slate-400">•</span>
                      <span className="text-slate-600">Password:</span>{' '}
                      <span className="font-mono font-bold text-slate-900 bg-white/90 px-1.5 py-0.5 rounded border border-amber-200">Parul@2026</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('26UG030789');
                      setLoginPassword('Parul@2026');
                      setErrorMessage('');
                    }}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-[11px] rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    Fill ID & Password
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* UG Number or Email Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="ugNumberInput"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      UG Number or Registered Email <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap className="w-5 h-5 text-rose-700" />
                      </div>
                      <input
                        id="ugNumberInput"
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. 26UG030789 or 26ug030789@paruluniversity.ac.in"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="passwordInput"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                      >
                        Password <span className="text-rose-600">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotModalOpen(true)}
                        className="text-xs font-semibold text-rose-700 hover:text-rose-800 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-5 h-5 text-rose-700" />
                      </div>
                      <input
                        id="passwordInput"
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your student password (default: Parul@2026)"
                        className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-700 border-slate-300 focus:ring-rose-600"
                      />
                      <span>Keep student session active</span>
                    </label>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg hover:shadow-rose-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Downward attached Create Account option */}
                  <div className="pt-3.5 text-center border-t border-slate-200/80">
                    <p className="text-xs text-slate-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setErrorMessage('');
                          setSuccessMessage('');
                        }}
                        className="font-bold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer"
                      >
                        Create Account
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: REGISTER NEW STUDENT */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Account Registration Helper Card */}
                <div className="p-3 bg-blue-50/90 rounded-xl border border-blue-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-blue-950">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>
                      Enter <strong>Name</strong>, UG Number <strong>26UG456789</strong>, and <strong>Email</strong> to create student account.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRegName('Parul Student');
                      setRegUgNumber('26UG456789');
                      setRegEmail('26ug456789@paruluniversity.ac.in');
                      setRegPhone('+91 98765 43210');
                      setRegDepartment('Computer Science & Engineering (PIET)');
                      setRegPassword('Parul@2026');
                      setRegConfirmPassword('Parul@2026');
                      setErrorMessage('');
                    }}
                    className="px-2.5 py-1 bg-blue-200 hover:bg-blue-300 text-blue-950 font-bold text-[11px] rounded-lg transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                  >
                    Prefill 26UG456789
                  </button>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Student Name <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 text-rose-700" />
                    </div>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 text-xs font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* UG Number & Email (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      UG Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap className="w-4 h-4 text-rose-700" />
                      </div>
                      <input
                        type="text"
                        value={regUgNumber}
                        onChange={(e) => setRegUgNumber(e.target.value.toUpperCase())}
                        placeholder="26UG456789"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">e.g. 26UG456789</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4 text-rose-700" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Enter email (e.g. 26ug456789@paruluniversity.ac.in)"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 text-xs font-medium text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">e.g. 26ug456789@paruluniversity.ac.in</p>
                  </div>
                </div>

                {/* Department & Phone (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Department / Faculty <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building className="w-4 h-4 text-rose-700" />
                      </div>
                      <input
                        type="text"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        placeholder="e.g. Computer Science & Engg"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 text-xs font-medium text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Phone Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4 text-rose-700" />
                      </div>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 text-xs font-medium text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4 text-rose-700" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 4 characters"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 text-xs font-medium text-slate-900 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Confirm Password <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4 text-rose-700" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 text-xs font-medium text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>

                {/* Downward attached Sign In option */}
                <div className="pt-3 text-center border-t border-slate-200/80">
                  <p className="text-xs text-slate-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="font-bold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Protected Access Notice */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-rose-800 font-semibold">
              <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Only registered Parul students allowed</span>
            </div>
            <span className="text-[11px] text-slate-400">PU IT Helpdesk: 02668-260300</span>
          </div>

          {/* Admin Backend Access Gate Link */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={() => onNavigate('dashboard-admin')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>Administration & Event Upload Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Reset Student Password</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Password reset instructions will be dispatched to your registered email address (e.g. <strong>aman576544534@gmail.com</strong>).
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
              For immediate campus account assistance, contact the Parul University Student IT Helpdesk.
            </div>
            <button
              onClick={() => setForgotModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-rose-700 text-white font-semibold text-xs hover:bg-rose-800 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
