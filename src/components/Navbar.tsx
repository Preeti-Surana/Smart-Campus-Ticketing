import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Ticket,
  Shield,
  User as UserIcon,
  Zap,
  QrCode,
  Flame,
  LayoutDashboard,
  Compass,
  ChevronDown,
  Sparkles,
  LogIn,
  LogOut,
  MapPin,
} from 'lucide-react';

interface Props {
  activeTab: 'discovery' | 'student' | 'admin' | 'testlab';
  setActiveTab: (tab: 'discovery' | 'student' | 'admin' | 'testlab') => void;
  onOpenScanner: () => void;
  surgingCount?: number;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenScanner,
  surgingCount = 0,
}) => {
  const {
    currentUser,
    isLoggedIn,
    allUsers,
    switchUserById,
    logout,
    setIsLoginModalOpen,
  } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('discovery')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-white">
                Smart Campus
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/20">
                India
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider">
              Dynamic Pricing & Digital QR Passes
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'discovery'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Events</span>
          </button>

          <button
            onClick={() => setActiveTab('student')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'student'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>My Passes</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Organizer Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('testlab')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'testlab'
                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-xs'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Race Condition Lab</span>
          </button>
        </nav>

        {/* Right Action Icons & Auth Controls */}
        <div className="flex items-center gap-2.5">
          {/* Gate Scanner Action Button */}
          <button
            onClick={onOpenScanner}
            title="Gate Entry QR Scanner"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Scanner</span>
          </button>

          {/* Dynamic Surge Active Tag */}
          {surgingCount > 0 && (
            <div
              onClick={() => setActiveTab('discovery')}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold cursor-pointer hover:bg-amber-500/30 transition-colors"
              title="Events currently in dynamic surge pricing (<20% tickets left)"
            >
              <Zap className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
              <span>{surgingCount} Surging</span>
            </div>
          )}

          {/* User Account / Login State */}
          {isLoggedIn && currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-left transition-colors"
              >
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-7 h-7 rounded-xl object-cover ring-1 ring-indigo-500"
                />
                <div className="hidden sm:block">
                  <span className="font-bold text-white block leading-tight truncate max-w-[110px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-indigo-300 uppercase font-semibold">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Profile & Persona Switcher Dropdown */}
              {showRoleDropdown && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowRoleDropdown(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <span className="font-bold text-xs text-white block truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {currentUser.email}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        {currentUser.role}
                      </span>
                      {currentUser.college_id && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {currentUser.college_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Switch Profiles */}
                  <div className="p-1 space-y-1">
                    <div className="px-3 pt-1 text-[10px] font-bold uppercase text-slate-500">
                      Switch Active Persona (India)
                    </div>
                    {allUsers.map((user) => (
                      <button
                        key={user.user_id}
                        onClick={() => switchUserById(user.user_id)}
                        className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                          currentUser.user_id === user.user_id
                            ? 'bg-indigo-600/30 border border-indigo-500/40 text-white'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <img
                          src={user.avatar}
                          alt=""
                          className="w-7 h-7 rounded-lg object-cover shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-bold text-xs block text-white truncate">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {user.department || user.role} ({user.role.toUpperCase()})
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-1 mt-1 border-t border-slate-800 px-1">
                    <button
                      onClick={() => logout()}
                      className="w-full text-left p-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-semibold transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 px-2 py-2 bg-slate-950">
        <button
          onClick={() => setActiveTab('discovery')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg ${
            activeTab === 'discovery' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg ${
            activeTab === 'student' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'
          }`}
        >
          My Passes
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg ${
            activeTab === 'admin' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'
          }`}
        >
          Organizer
        </button>
        <button
          onClick={() => setActiveTab('testlab')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg ${
            activeTab === 'testlab' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'
          }`}
        >
          Test Lab
        </button>
      </div>
    </header>
  );
};
