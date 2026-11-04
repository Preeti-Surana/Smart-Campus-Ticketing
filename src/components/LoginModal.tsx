import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Building,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { UserRole } from '../types.ts';
import { getAvatarForName, isGirlName } from '../utils/avatar.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { allUsers, login, register, switchUserById } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('student');
  const [collegeId, setCollegeId] = useState<string>('');
  const [department, setDepartment] = useState<string>('Computer Science & Eng.');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const success = await login(email.trim(), password);
    setIsLoading(false);

    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg('Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter your name and campus email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const avatarUrl = getAvatarForName(name.trim());

    const success = await register({
      name: name.trim(),
      email: email.trim(),
      role,
      department: department.trim(),
      college_id: collegeId.trim() || 'STU-' + Math.floor(1000 + Math.random() * 9000),
      avatar: avatarUrl,
    });

    setIsLoading(false);

    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg('Registration failed. Please try a different email.');
    }
  };

  const handleQuickDemoLogin = (userId: string) => {
    switchUserById(userId);
    if (onSuccess) onSuccess();
    onClose();
  };

  const previewAvatar = getAvatarForName(name.trim() || 'Student');
  const isGirl = isGirlName(name.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Campus Portal Authentication
          </div>
          <h2 className="text-xl font-bold text-white">
            {tab === 'login' ? 'Sign In to Campus Ticketing' : 'Register New Student Account'}
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1">
            Access digital QR passes, student discounts, and event analytics
          </p>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-white/10 p-1 mt-4 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              New Registration
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Campus Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aarav.patel@campus.edu or preeti@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
              {/* Dynamic Photo Preview based on Girl / Boy Name */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <img
                  src={previewAvatar}
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500 shadow-sm shrink-0"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>{name.trim() ? (isGirl ? '🌸 Girl Photo Assigned' : '👔 Boy Photo Assigned (Default)') : 'Profile Avatar Preview'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {name.trim()
                      ? isGirl
                        ? `"${name}" detected as feminine name → Showing girl photo.`
                        : `"${name}" detected as masculine / default → Showing boy photo.`
                      : 'Type your name to preview girl/boy student portrait.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Preeti Surana (Girl) or Rohan Mehta (Boy)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Campus Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. preeti.s@campus.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="student">Student</option>
                    <option value="organizer">Club Organizer</option>
                    <option value="admin">College Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Student / Faculty ID
                  </label>
                  <input
                    type="text"
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    placeholder="e.g. CS-2025-089"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Department / Club
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science / Robotics Club"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo One-Click Sign In */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 text-center">
              ⚡ Instant 1-Click Demo Profiles (India)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {allUsers.slice(0, 4).map((u) => (
                <button
                  key={u.user_id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(u.user_id)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-colors text-left flex items-center gap-2 group"
                >
                  <img
                    src={u.avatar}
                    alt=""
                    className="w-7 h-7 rounded-lg object-cover shrink-0 ring-1 ring-slate-200 group-hover:ring-indigo-400"
                  />
                  <div className="truncate">
                    <span className="font-bold text-[11px] text-slate-900 block truncate">
                      {u.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-indigo-700 font-semibold uppercase block truncate">
                      {u.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Smart Campus Ticketing • Concurrency-Safe Student Portal
        </div>
      </div>
    </div>
  );
};
