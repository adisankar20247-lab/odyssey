import React from 'react';
import { LocalLensLogo } from './LocalLensLogo';
import { Language, TRANSLATIONS } from '../data/translations';
import { 
  Globe2, 
  ShieldCheck, 
  AlertCircle, 
  UserCheck, 
  ShieldAlert, 
  Sparkles, 
  ChevronDown, 
  LogIn, 
  LogOut, 
  Globe, 
  MapPin, 
  User,
  Loader2
} from 'lucide-react';

export type ActiveRole = 'traveller' | 'provider' | 'admin';

interface HeaderProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  activeRole: ActiveRole;
  onSelectRole: (role: ActiveRole) => void;
  onOpenTrustModal: () => void;
  onOpenReportModal: () => void;
  onOpenProviderOnboardModal: () => void;
  onOpenGeminiDecision?: (initialMode?: 'decision' | 'search' | 'maps') => void;
  currentUser?: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  } | null;
  onSignInGoogle?: () => void;
  onSignOut?: () => void;
  isAuthLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  activeRole,
  onSelectRole,
  onOpenTrustModal,
  onOpenReportModal,
  onOpenProviderOnboardModal,
  onOpenGeminiDecision,
  currentUser,
  onSignInGoogle,
  onSignOut,
  isAuthLoading
}) => {
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const t = TRANSLATIONS[currentLang];

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro banner for pilot notice */}
      <div className="bg-[#0F2942] text-white px-3 py-1 text-[11px] font-medium flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate max-w-xl mx-auto md:mx-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="truncate">
            <span className="font-semibold text-emerald-300">Kerala Pilot:</span> Thiruvananthapuram – Kovalam – Varkala Corridor. Live Google Search & Maps Grounding.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-slate-300">
          <button 
            onClick={onOpenTrustModal}
            className="hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verification Standards
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={onOpenReportModal}
            className="hover:text-amber-300 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <AlertCircle className="w-3 h-3 text-amber-400" />
            Report Civic Issue
          </button>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div className="cursor-pointer" onClick={() => onSelectRole('traveller')}>
          <LocalLensLogo size="md" showText={true} />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Issue Report button on mobile */}
          <button
            onClick={onOpenReportModal}
            className="flex sm:hidden items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-800 border border-amber-200 cursor-pointer"
            title="Report an issue"
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </button>

          {/* Gemini AI Grounding & Decision Button */}
          {onOpenGeminiDecision && (
            <button
              onClick={() => onOpenGeminiDecision('decision')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#0F2942] to-[#0D9488] text-white hover:from-[#163E66] hover:to-[#0F766E] shadow-2xs transition-all cursor-pointer"
              title="Open Gemini Grounding & Decision Engine"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden md:inline">AI Grounding & Decisions</span>
              <span className="md:hidden">AI</span>
            </button>
          )}

          {/* Role Switcher Pill for Judge/Demo testing */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleMenuOpen(!roleMenuOpen);
                setLangMenuOpen(false);
                setUserMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                  : activeRole === 'provider'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {activeRole === 'admin' && <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />}
              {activeRole === 'provider' && <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
              {activeRole === 'traveller' && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
              <span className="hidden sm:inline text-slate-500 font-normal">Role:</span>
              <span>
                {activeRole === 'admin' && 'Tourism Admin'}
                {activeRole === 'provider' && 'Provider Portal'}
                {activeRole === 'traveller' && 'Traveller View'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in-50 duration-150">
                <div className="px-2 py-1 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Switch Demo Role
                </div>
                
                <button
                  onClick={() => {
                    onSelectRole('traveller');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    activeRole === 'traveller' ? 'bg-emerald-50 text-emerald-950 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold">Traveller Mode</div>
                    <div className="text-[11px] text-slate-500 font-normal">Itinerary planner, budget breakdowns, explore verified providers</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectRole('provider');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors mt-1 cursor-pointer ${
                    activeRole === 'provider' ? 'bg-amber-50 text-amber-950 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold">Local Provider Portal</div>
                    <div className="text-[11px] text-slate-500 font-normal">Register local homestay, guide, food or artisan service</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectRole('admin');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors mt-1 cursor-pointer ${
                    activeRole === 'admin' ? 'bg-purple-50 text-purple-950 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold">Tourism Administrator</div>
                    <div className="text-[11px] text-slate-500 font-normal">Destination dashboard, provider vetting pipeline, issue resolution</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setRoleMenuOpen(false);
                setUserMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 transition-all cursor-pointer"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>{languages.find(l => l.code === currentLang)?.native}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLang(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      currentLang === lang.code
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[11px] text-slate-400">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Firebase Authentication: Google Sign In Button / User Avatar */}
          {isAuthLoading ? (
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          ) : currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setRoleMenuOpen(false);
                  setLangMenuOpen(false);
                }}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
                title={`Signed in as ${currentUser.displayName || currentUser.email}`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-[10px] font-extrabold">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in-50 duration-150 space-y-2">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="User"
                        className="w-9 h-9 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                        {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.displayName || 'Responsible Traveller'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {currentUser.email}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Firebase Auth (Google)
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 py-1">
                    Your itineraries, ratings, and bookmarks are persistently synced to Firestore database.
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onSignOut?.();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignInGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-2xs cursor-pointer"
              title="Sign in with Google via Firebase Auth"
            >
              {/* Google G Logo SVG */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}

          {/* Register as Provider CTA (Header) */}
          <button
            onClick={onOpenProviderOnboardModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0D9488] text-white hover:bg-[#0f766e] transition-all shadow-xs cursor-pointer"
          >
            <span>+ List Local Service</span>
          </button>
        </div>
      </div>
    </header>
  );
};

