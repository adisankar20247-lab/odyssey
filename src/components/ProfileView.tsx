import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Compass, 
  Building2, 
  Phone, 
  MapPin, 
  Award, 
  HeartHandshake, 
  Check, 
  Globe2, 
  Lock, 
  Info,
  ChevronRight,
  Database,
  Cloud,
  LogOut,
  Send,
  MessageSquare,
  Sparkles,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { TripPlanPreferences, UserRole } from '../types';
import { 
  postCommunityNote, 
  fetchCommunityNotes, 
  FirestoreCommunityNote, 
  FirestoreItinerary 
} from '../lib/firebase';

interface ProfileViewProps {
  currentLang: Language;
  onSelectLanguage: (lang: Language) => void;
  userRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  preferences: TripPlanPreferences;
  savedCount: number;
  onOpenTrustModal: () => void;
  onRegisterProviderSubmit: (providerData: any) => void;
  currentUser?: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  } | null;
  onSignInGoogle?: () => void;
  onSignOut?: () => void;
  cloudItineraries?: FirestoreItinerary[];
  onOpenGrounding?: (mode?: 'decision' | 'search' | 'maps') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentLang,
  onSelectLanguage,
  userRole,
  onSelectRole,
  preferences,
  savedCount,
  onOpenTrustModal,
  onRegisterProviderSubmit,
  currentUser,
  onSignInGoogle,
  onSignOut,
  cloudItineraries = [],
  onOpenGrounding
}) => {
  const [showProviderRegForm, setShowProviderRegForm] = useState<boolean>(false);
  const [businessName, setBusinessName] = useState<string>('');
  const [category, setCategory] = useState<string>('Homestay');
  const [location, setLocation] = useState<string>('Kovalam');
  const [phone, setPhone] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Community Notes (Firestore collection `community_notes`)
  const [communityNotes, setCommunityNotes] = useState<FirestoreCommunityNote[]>([]);
  const [noteText, setNoteText] = useState<string>('');
  const [noteLocation, setNoteLocation] = useState<string>('Varkala North Cliff');
  const [isPostingNote, setIsPostingNote] = useState<boolean>(false);
  const [notePostSuccess, setNotePostSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Load community notes
    fetchCommunityNotes().then(notes => {
      if (notes && notes.length > 0) {
        setCommunityNotes(notes);
      } else {
        // Default verified community guidance
        setCommunityNotes([
          {
            id: 'note-default-1',
            userId: 'admin',
            authorName: 'Kerala RT Mission Volunteer',
            location: 'Thiruvananthapuram Central',
            tipText: 'Take unreserved passenger train #56304 directly to Varkala Sivagiri. It costs ₹15 and saves 85% carbon compared to hiring a private cab.',
            category: 'Low Carbon Transit',
            responsibleImpact: 'Local economy & climate protection',
            verified: true,
            createdAt: '2026-09-20'
          },
          {
            id: 'note-default-2',
            userId: 'admin',
            authorName: 'Meenmutty Host Anjali',
            location: 'Kovalam Bay',
            tipText: 'Refill filtered drinking water for free at Kudumbashree canteens instead of buying single-use bottled water along the promenade.',
            category: 'Plastic Waste Reduction',
            responsibleImpact: 'Zero plastic waste on marine beaches',
            verified: true,
            createdAt: '2026-09-20'
          }
        ]);
      }
    });
  }, []);

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsPostingNote(true);
    const newNote: Omit<FirestoreCommunityNote, 'createdAt'> = {
      id: `note-${Date.now()}`,
      userId: currentUser?.uid || 'guest-user',
      authorName: currentUser?.displayName || 'Responsible Traveller',
      location: noteLocation,
      tipText: noteText.trim(),
      category: 'Community Tip',
      responsibleImpact: '+5 Points Community Knowledge',
      verified: !!currentUser
    };

    const success = await postCommunityNote(newNote);
    setIsPostingNote(false);
    if (success) {
      setCommunityNotes(prev => [{ ...newNote, createdAt: new Date().toISOString() }, ...prev]);
      setNoteText('');
      setNotePostSuccess(true);
      setTimeout(() => setNotePostSuccess(false), 3000);
    }
  };

  const handleSubmitProvider = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterProviderSubmit({
      name: businessName,
      category,
      location,
      phone,
      description
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowProviderRegForm(false);
      setBusinessName('');
      setPhone('');
      setDescription('');
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Profile Header & Firebase Auth State */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F2942] to-[#0D9488] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
              {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'LL'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#0F2942]">
                {currentUser?.displayName || 'Local Lens Account'}
              </h1>
              {currentUser && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {currentUser?.email || 'Guest Explorer • Active Corridor: Thiruvananthapuram – Kovalam – Varkala'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Role: {userRole}
          </span>
          {currentUser && (
            <button
              onClick={onSignOut}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* FIREBASE AUTHENTICATION & FIRESTORE STATUS CARD */}
      <div className="bg-gradient-to-br from-[#0F2942] to-[#163E66] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                Firebase Authentication & Firestore Sync
              </h3>
              <p className="text-[11px] text-slate-300">
                Persistent cloud storage for itineraries, bookmarks, and responsible traveler scores
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
            Active
          </span>
        </div>

        {currentUser ? (
          <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Check className="w-4 h-4" />
                <span>Connected via Google Sign-In</span>
              </div>
              <span className="text-[10px] text-slate-300 font-mono truncate max-w-[150px]">
                UID: {currentUser.uid.substring(0, 8)}...
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10">
              <div>
                <span className="text-slate-400 block">Database:</span>
                <span className="font-medium text-slate-200">Google Cloud Firestore</span>
              </div>
              <div>
                <span className="text-slate-400 block">Cloud Saved Itineraries:</span>
                <span className="font-medium text-emerald-300">{cloudItineraries.length} records</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white/10 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-white">
                Sign in with Google to enable permanent Firestore sync
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Keep your curated Kerala itineraries, provider contacts, and responsible travel score across all devices.
              </p>
            </div>
            <button
              onClick={onSignInGoogle}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </div>

      {/* Language & Role Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-[#0F2942] uppercase tracking-wider">
          Language & Access Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Display Language</span>
            </label>
            <div className="flex gap-2">
              {[
                { code: 'en' as Language, label: 'English' },
                { code: 'ml' as Language, label: 'മലയാളം' },
                { code: 'hi' as Language, label: 'हिन्दी' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`flex-1 py-2 rounded-xl border font-bold transition-colors cursor-pointer ${
                    currentLang === lang.code
                      ? 'bg-[#0D9488] text-white border-[#0D9488]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Simulated Persona (Pilot Mode)</span>
            </label>
            <div className="flex gap-2">
              {(['traveller', 'provider', 'admin'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => onSelectRole(role)}
                  className={`flex-1 py-2 rounded-xl border font-bold capitalize transition-colors cursor-pointer ${
                    userRole === role
                      ? 'bg-[#0F2942] text-white border-[#0F2942]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* COMMUNITY RESPONSIBLE TRAVEL TIPS (FIRESTORE: community_notes) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#0D9488]" />
            <h2 className="text-sm font-extrabold text-[#0F2942] uppercase tracking-wider">
              Community Responsible Travel Tips
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            Firestore: community_notes
          </span>
        </div>

        {/* Post a Tip Form */}
        <form onSubmit={handlePostNote} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={noteLocation}
              onChange={e => setNoteLocation(e.target.value)}
              placeholder="Corridor stop (e.g. Varkala Cliff, Kovalam)"
              className="sm:w-1/3 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
            />
            <input
              type="text"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Share an eco-friendly transit tip or verified local vendor advice..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
            />
            <button
              type="submit"
              disabled={isPostingNote || !noteText.trim()}
              className="px-4 py-2 rounded-lg bg-[#0F2942] hover:bg-[#16385C] disabled:bg-slate-300 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isPostingNote ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Post Tip</span>
            </button>
          </div>
          {notePostSuccess && (
            <p className="text-[11px] text-emerald-700 font-bold">
              Tip successfully saved to Firebase Firestore community notes!
            </p>
          )}
        </form>

        {/* Community Notes Stream */}
        <div className="space-y-2.5">
          {communityNotes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span>{note.authorName}</span>
                  {note.verified && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                      Verified Contributor
                    </span>
                  )}
                </div>
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {note.location}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                "{note.tipText}"
              </p>
              <div className="text-[10px] text-emerald-700 font-medium">
                Impact: {note.responsibleImpact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LOCAL PROVIDER ONBOARDING CALLOUT */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-6 shadow-md border border-emerald-700 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold mb-2">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Kerala Grassroots Tourism Outreach</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              Are you a local homestay host, storyteller guide, or artisan?
            </h3>
            <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
              Gain free digital visibility across the Thiruvananthapuram–Kovalam–Varkala corridor with zero commissions and direct traveller inquiries.
            </p>
          </div>
        </div>

        {!showProviderRegForm ? (
          <button
            onClick={() => setShowProviderRegForm(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black transition-colors shadow-xs cursor-pointer"
          >
            Apply for Free Pilot Verification
          </button>
        ) : (
          <div className="bg-white text-slate-900 p-5 rounded-2xl animate-in fade-in space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-sm text-[#0F2942]">
                New Local Provider Pilot Application
              </span>
              <button
                onClick={() => setShowProviderRegForm(false)}
                className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-xs text-emerald-900 font-bold">
                Application received! Your record has been queued for phone and field audit.
              </div>
            ) : (
              <form onSubmit={handleSubmitProvider} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Business / Service Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. Malabar Waves Homestay"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Homestay">Homestay / Guesthouse</option>
                      <option value="Local Guide">Heritage / Nature Storyteller Guide</option>
                      <option value="Food Experience">Traditional Food / Cookery Workshop</option>
                      <option value="Artisan Workshop">Coir / Handloom / Potter Artisan</option>
                      <option value="Local Transport">Verified Auto / Green E-Transit</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location / Corridor Hub</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Varkala South Cliff or Kovalam"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Direct Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. +91 98470 12345"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Short Description of Services</label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your authentic local experience, community impact, or pricing..."
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white font-bold transition-colors cursor-pointer"
                >
                  Submit for Verification
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* TRUST FRAMEWORK LINK */}
      <div className="p-4 bg-slate-100 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Review Data Verification & Anti-Commercial Charter</span>
        </div>
        <button
          onClick={onOpenTrustModal}
          className="font-bold text-[#0D9488] hover:underline cursor-pointer"
        >
          Read Policy
        </button>
      </div>
    </div>
  );
};
