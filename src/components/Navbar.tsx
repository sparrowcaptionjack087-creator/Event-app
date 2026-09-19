import React from 'react';
import { ParulLogo } from './ParulLogo';
import { DashboardId } from '../types';
import {
  LogIn,
  Home,
  Bell,
  Layers,
  FileText,
  User,
  ShieldCheck,
  Menu,
  X,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  currentDashboard: DashboardId;
  onNavigate: (dashboardId: DashboardId) => void;
  unreadCount: number;
  isLoggedIn: boolean;
  ugNumber: string;
  avatarUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDashboard,
  onNavigate,
  unreadCount,
  isLoggedIn,
  ugNumber,
  avatarUrl,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: {
    id: DashboardId;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'dashboard-3-home', label: 'Home Feed', icon: Home },
    { id: 'dashboard-4-notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'dashboard-5-categories', label: 'Categories', icon: Layers },
    { id: 'dashboard-6-details', label: 'Details', icon: FileText },
    { id: 'dashboard-7-profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">
        {/* University Crest & Logo */}
        <div
          onClick={() => onNavigate(isLoggedIn ? 'dashboard-3-home' : 'dashboard-2-login')}
          className="cursor-pointer transition-transform hover:scale-[1.02] flex items-center"
          title={isLoggedIn ? 'Go to Home' : 'Parul University Portal'}
        >
          <ParulLogo size="sm" variant="light" showTagline={false} />
        </div>

        {/* Navigation Bar (Desktop) */}
        {isLoggedIn ? (
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentDashboard === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>

                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs font-semibold text-rose-900">
            <Lock className="w-3.5 h-3.5 text-rose-700 shrink-0" />
            <span>Student Sign-In Required • App Interface Locked</span>
          </div>
        )}

        {/* User Badge / Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Quick Bell (Accessible only when logged in) */}
          {isLoggedIn ? (
            <button
              onClick={() => onNavigate('dashboard-4-notifications')}
              className={`relative p-2 sm:p-2.5 rounded-xl border transition-colors ${
                currentDashboard === 'dashboard-4-notifications'
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          ) : null}

          {/* Student UG pill or Login button */}
          {isLoggedIn ? (
            <button
              onClick={() => onNavigate('dashboard-7-profile')}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-800 transition-colors"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Student Profile"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-lg object-cover border border-amber-400/80 shadow-2xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-rose-700 text-white flex items-center justify-center text-xs font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[10px] font-mono font-bold text-rose-700 uppercase">
                  UG: {ugNumber}
                </div>
                <div className="text-xs font-bold text-slate-900">Student Profile</div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('dashboard-2-login')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>UG Student Login</span>
            </button>
          )}

          {/* Admin Portal Button */}
          <button
            onClick={() => onNavigate('dashboard-admin')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              currentDashboard === 'dashboard-admin'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
            }`}
            title="Parul University Backend Administrative Access"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Admin Portal</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 animate-fade-in shadow-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Parul University • Events Portal
          </div>
          {isLoggedIn ? (
            <>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentDashboard === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.badge} new
                    </span>
                  ) : null}
                </button>
              );
            })}
            <button
              onClick={() => {
                onNavigate('dashboard-admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentDashboard === 'dashboard-admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 mt-2'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Admin Portal</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold uppercase">
                Admin
              </span>
            </button>
          </>
          ) : (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Lock className="w-4 h-4 text-rose-700" />
                <span>Authentication Required</span>
              </div>
              <p className="text-[11px] text-rose-700">
                Log in with your official Parul University UG Number to unlock the campus events feed, digital barcode passes, and alerts.
              </p>
              <button
                onClick={() => {
                  onNavigate('dashboard-2-login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Go to Login Form</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Persistent Mobile Bottom Navigation Bar (Visible only when logged in) */}
      {isLoggedIn && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 flex items-center justify-around shadow-2xl">
          {[
            { id: 'dashboard-3-home' as DashboardId, label: 'Home', icon: Home },
            { id: 'dashboard-4-notifications' as DashboardId, label: 'Alerts', icon: Bell, badge: unreadCount },
            { id: 'dashboard-5-categories' as DashboardId, label: 'Categories', icon: Layers },
            { id: 'dashboard-7-profile' as DashboardId, label: 'Profile', icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentDashboard === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive ? 'text-rose-700 font-bold' : 'text-slate-500 font-medium'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-none">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
