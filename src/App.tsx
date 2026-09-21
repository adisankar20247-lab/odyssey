import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  BottomNav, 
  TabKey 
} from './components/BottomNav';
import { 
  HomeView 
} from './components/HomeView';
import { 
  TripPlanner 
} from './components/TripPlanner';
import { 
  ItineraryView 
} from './components/ItineraryView';
import { 
  ExploreProviders 
} from './components/ExploreProviders';
import { 
  SavedTripsView 
} from './components/SavedTripsView';
import { 
  ProfileView 
} from './components/ProfileView';
import { 
  AdminDashboard 
} from './components/AdminDashboard';
import { 
  DestinationDetailModal 
} from './components/DestinationDetailModal';
import { 
  ProviderDetailModal 
} from './components/ProviderDetailModal';
import { 
  TrustTransparencyModal 
} from './components/TrustTransparencyModal';
import { 
  ReportIssueModal 
} from './components/ReportIssueModal';
import {
  GeminiDecisionAssistant
} from './components/GeminiDecisionAssistant';
import {
  FloatingMapWidget
} from './components/FloatingMapWidget';

import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  syncUserProfile, 
  saveItineraryToFirestore, 
  getSavedItinerariesFromFirestore, 
  saveBookmarkToFirestore, 
  getBookmarksFromFirestore, 
  removeBookmarkFromFirestore,
  seedGoogleDatabaseIfEmpty,
  FirestoreItinerary
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

import { 
  Destination, 
  Provider, 
  IssueReport, 
  CommunityFeedbackItem, 
  AuditLogEntry, 
  TripPlanPreferences, 
  UserRole,
  ProviderReviewStatus,
  ItineraryDay,
  CostBreakdown,
  ResponsibleScoreBreakdown
} from './types';
import { 
  MOCK_DESTINATIONS, 
  MOCK_PROVIDERS, 
  MOCK_ISSUE_REPORTS, 
  MOCK_COMMUNITY_FEEDBACK, 
  MOCK_AUDIT_LOGS, 
  DEFAULT_TRIP_PREFERENCES,
  MOCK_ITINERARY_DAYS,
  MOCK_COST_BREAKDOWN,
  calculateResponsibleScore
} from './data/mockData';
import { generateDynamicItineraryWithAI } from './services/geminiService';
import { Language } from './data/translations';
import { 
  LayoutDashboard, 
  Compass, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Bookmark, 
  User, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // App state
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [userRole, setUserRole] = useState<UserRole>('traveller');
  const [currentLang, setCurrentLang] = useState<Language>('en');

  // Core Data loaded into mutable state for full interactivity
  const [destinations, setDestinations] = useState<Destination[]>(MOCK_DESTINATIONS);
  const [providers, setProviders] = useState<Provider[]>(MOCK_PROVIDERS);
  const [reports, setReports] = useState<IssueReport[]>(MOCK_ISSUE_REPORTS);
  const [feedback, setFeedback] = useState<CommunityFeedbackItem[]>(MOCK_COMMUNITY_FEEDBACK);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);

  // User trip planner & itinerary state
  const [tripPreferences, setTripPreferences] = useState<TripPlanPreferences>(DEFAULT_TRIP_PREFERENCES);
  const [hasGeneratedItinerary, setHasGeneratedItinerary] = useState<boolean>(true);
  const [isItinerarySaved, setIsItinerarySaved] = useState<boolean>(true);
  const [savedProviderIds, setSavedProviderIds] = useState<string[]>([
    'prov-meenmutty-homestay',
    'prov-coir-artisan'
  ]);

  // AI-Generated Dynamic Output State (Replaces default static data)
  const [dynamicItineraryDays, setDynamicItineraryDays] = useState<ItineraryDay[] | null>(null);
  const [dynamicCostBreakdown, setDynamicCostBreakdown] = useState<CostBreakdown | null>(null);
  const [dynamicResponsibleScore, setDynamicResponsibleScore] = useState<ResponsibleScoreBreakdown | null>(null);
  const [dynamicAiSummary, setDynamicAiSummary] = useState<string | null>(null);
  const [dynamicAiSource, setDynamicAiSource] = useState<string | null>(null);
  const [isDynamicLoading, setIsDynamicLoading] = useState<boolean>(false);

  // Modals state
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isTrustModalOpen, setIsTrustModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isGeminiDecisionOpen, setIsGeminiDecisionOpen] = useState<boolean>(false);
  const [geminiAssistantMode, setGeminiAssistantMode] = useState<'decision' | 'search' | 'maps'>('decision');
  const [reportEntityName, setReportEntityName] = useState<string>('');

  // Firebase Auth & Firestore Persistence State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [cloudItineraries, setCloudItineraries] = useState<FirestoreItinerary[]>([]);

  // Precalculated score based on current preferences
  const responsibleScore = calculateResponsibleScore(tripPreferences);

  // Monitor Firebase Auth State & Sync Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        // Sync user profile to Firestore
        await syncUserProfile(user, userRole === 'admin' ? 'admin' : 'traveller');
        // Retrieve cloud-stored itineraries
        const its = await getSavedItinerariesFromFirestore(user.uid);
        setCloudItineraries(its);
        // Retrieve cloud-stored bookmarks
        const bms = await getBookmarksFromFirestore(user.uid);
        if (bms && bms.length > 0) {
          setSavedProviderIds(prev => Array.from(new Set([...prev, ...bms.map(b => b.providerId)])));
        }
      }
    });
    return () => unsubscribe();
  }, [userRole]);

  // Seed Google Firestore Database with pilot destinations and providers if empty
  useEffect(() => {
    seedGoogleDatabaseIfEmpty(MOCK_DESTINATIONS, MOCK_PROVIDERS).catch(err => {
      console.warn('Initial Firestore seeding check:', err);
    });
  }, []);

  // Generate dynamic AI itinerary on mount using Google Gemini & Grounding to replace static default data
  useEffect(() => {
    setIsDynamicLoading(true);
    generateDynamicItineraryWithAI(DEFAULT_TRIP_PREFERENCES)
      .then(result => {
        if (result && result.days && result.days.length > 0) {
          setDynamicItineraryDays(result.days);
          if (result.cost) setDynamicCostBreakdown(result.cost);
          if (result.score) setDynamicResponsibleScore(result.score);
          setDynamicAiSummary(result.summary);
          setDynamicAiSource(result.source);
        }
      })
      .catch(err => {
        console.warn('Initial dynamic itinerary generation warning:', err);
      })
      .finally(() => {
        setIsDynamicLoading(false);
      });
  }, []);

  // Sync saved state with localStorage as fallback/offline layer
  useEffect(() => {
    try {
      const savedPref = localStorage.getItem('local_lens_pref');
      if (savedPref) {
        setTripPreferences(JSON.parse(savedPref));
      }
      const savedBookmarked = localStorage.getItem('local_lens_saved_providers');
      if (savedBookmarked) {
        setSavedProviderIds(JSON.parse(savedBookmarked));
      }
    } catch (e) {
      // safe fallback
    }
  }, []);

  const saveBookmarksToStorage = (newIds: string[]) => {
    setSavedProviderIds(newIds);
    try {
      localStorage.setItem('local_lens_saved_providers', JSON.stringify(newIds));
    } catch (e) {}
  };

  // Google Sign-In & Sign-Out Handlers
  const handleSignInGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      setCurrentUser(user);
      if (user) {
        const its = await getSavedItinerariesFromFirestore(user.uid);
        setCloudItineraries(its);
      }
    } catch (err) {
      console.error('Google Sign-in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setCloudItineraries([]);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  // Handlers
  const handlePlanTrip = () => {
    setActiveTab('plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateItinerary = (prefs: TripPlanPreferences, dynamicOutput?: any) => {
    setTripPreferences(prefs);
    if (dynamicOutput && dynamicOutput.days && dynamicOutput.days.length > 0) {
      setDynamicItineraryDays(dynamicOutput.days);
      if (dynamicOutput.cost) setDynamicCostBreakdown(dynamicOutput.cost);
      if (dynamicOutput.score) setDynamicResponsibleScore(dynamicOutput.score);
      setDynamicAiSummary(dynamicOutput.summary || null);
      setDynamicAiSource(dynamicOutput.source || null);
    }
    setHasGeneratedItinerary(true);
    setIsItinerarySaved(true);
    try {
      localStorage.setItem('local_lens_pref', JSON.stringify(prefs));
    } catch (e) {}

    // If signed in, persist to Firestore
    if (currentUser) {
      const currentCost = dynamicOutput?.cost || dynamicCostBreakdown || MOCK_COST_BREAKDOWN;
      const currentScore = dynamicOutput?.score || dynamicResponsibleScore || responsibleScore;
      const newIt: Omit<FirestoreItinerary, 'userId' | 'createdAt' | 'updatedAt'> = {
        id: `itinerary-${Date.now()}`,
        title: `${prefs.numberOfDays}-Day Responsible Kerala Journey`,
        corridor: prefs.destinationArea || 'Thiruvananthapuram – Kovalam – Varkala',
        score: currentScore.overall,
        daysCount: prefs.numberOfDays,
        totalBudget: currentCost.total,
        stopsSummary: `From ${prefs.startingPoint} through ${prefs.destinationArea}`
      };
      saveItineraryToFirestore(currentUser.uid, newIt).then(() => {
        getSavedItinerariesFromFirestore(currentUser.uid).then(setCloudItineraries);
      });
    }

    setActiveTab('plan'); // Stay in planner/itinerary view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSaveItinerary = async () => {
    const nextSaved = !isItinerarySaved;
    setIsItinerarySaved(nextSaved);

    if (nextSaved && currentUser) {
      const newIt: Omit<FirestoreItinerary, 'userId' | 'createdAt' | 'updatedAt'> = {
        id: `itinerary-${Date.now()}`,
        title: `${tripPreferences.numberOfDays}-Day Responsible Kerala Journey`,
        corridor: tripPreferences.destinationArea || 'Thiruvananthapuram – Kovalam – Varkala',
        score: responsibleScore.overall,
        daysCount: tripPreferences.numberOfDays,
        totalBudget: MOCK_COST_BREAKDOWN.total,
        stopsSummary: 'Thiruvananthapuram – Kovalam – Varkala'
      };
      await saveItineraryToFirestore(currentUser.uid, newIt);
      const its = await getSavedItinerariesFromFirestore(currentUser.uid);
      setCloudItineraries(its);
    }
  };

  const handleToggleBookmarkProvider = async (providerId: string) => {
    const prov = providers.find(p => p.id === providerId);
    if (savedProviderIds.includes(providerId)) {
      const nextIds = savedProviderIds.filter(id => id !== providerId);
      saveBookmarksToStorage(nextIds);
      if (currentUser) {
        await removeBookmarkFromFirestore(currentUser.uid, providerId);
      }
    } else {
      const nextIds = [...savedProviderIds, providerId];
      saveBookmarksToStorage(nextIds);
      if (currentUser && prov) {
        await saveBookmarkToFirestore(currentUser.uid, {
          id: providerId,
          providerId: prov.id,
          providerName: prov.name,
          category: prov.category,
          location: prov.location
        });
      }
    }
  };

  const handleOpenGrounding = (mode: 'decision' | 'search' | 'maps' = 'decision') => {
    setGeminiAssistantMode(mode);
    setIsGeminiDecisionOpen(true);
  };

  const handleOpenReportModal = (entityName?: string) => {
    setReportEntityName(entityName || '');
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = (newReport: IssueReport) => {
    setReports(prev => [newReport, ...prev]);
    // Log to audit trail
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      action: 'Issue Submitted',
      targetEntity: newReport.relatedEntity,
      performedBy: 'Civic Contributor (Anonymous)',
      timestamp: newReport.timestamp,
      reason: `Severity: ${newReport.severity} - ${newReport.category}`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Admin Actions
  const handleUpdateProviderStatus = (providerId: string, newStatus: ProviderReviewStatus, note?: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          adminReviewStatus: newStatus,
          verificationStatus: newStatus === 'Approved' ? 'Verified Local Partner' : p.verificationStatus,
          lastVerifiedDate: newStatus === 'Approved' ? '2026-09-20' : p.lastVerifiedDate,
          lastUpdated: '2026-09-20'
        };
      }
      return p;
    }));

    const prov = providers.find(p => p.id === providerId);
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      action: `Provider ${newStatus}`,
      targetEntity: prov ? prov.name : providerId,
      performedBy: 'Tourism Admin Officer',
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
      reason: note || `Verification pipeline transitioned to ${newStatus}`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  const handleToggleProviderActive = (providerId: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return { ...p, activeStatus: !p.activeStatus };
      }
      return p;
    }));
  };

  const handleUpdateReportStatus = (reportId: string, newStatus: IssueReport['moderationStatus'], adminNotes?: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return { ...r, moderationStatus: newStatus, adminNotes };
      }
      return r;
    }));

    const rep = reports.find(r => r.id === reportId);
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      action: `Report Marked ${newStatus}`,
      targetEntity: rep ? rep.relatedEntity : reportId,
      performedBy: 'Civic Moderator',
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
      reason: adminNotes || `Issue review concluded with status: ${newStatus}`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  const handleRegisterNewProvider = (formData: any) => {
    const newProv: Provider = {
      id: `prov-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      location: formData.location,
      coordinates: { lat: 8.5241, lng: 76.9366 },
      priceRange: '₹800 – ₹1,800',
      startingPrice: 800,
      phone: formData.phone,
      whatsapp: formData.phone,
      languages: ['Malayalam', 'English'],
      verificationStatus: 'Community Submitted',
      source: 'Direct Pilot Application',
      lastUpdated: '2026-09-20',
      lastVerifiedDate: 'Pending Verification',
      adminReviewStatus: 'Pending',
      contactVerified: false,
      locationVerified: false,
      documentsVerified: false,
      consentSigned: true,
      submittedDate: '2026-09-20',
      activeStatus: true,
      description: formData.description,
      services: ['Authentic local hospitality', 'Direct community benefit'],
      communityImpact: '100% of income retained locally by community household.',
      accessibilityNotes: 'Step-free entrance and ground-floor access.',
      safetyNotes: 'Local panchayat registration and contact verified.',
      seasonality: 'Open all year',
      image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80'
    };

    setProviders(prev => [newProv, ...prev]);
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      action: 'New Provider Application',
      targetEntity: formData.name,
      performedBy: 'Self-Registered Host',
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
      reason: 'Applied for free pilot verification'
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Compute bookmarked providers objects
  const savedProviders = providers.filter(p => savedProviderIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-200">
      {/* Universal Top Header */}
      <Header
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        activeRole={userRole}
        onSelectRole={(role) => {
          setUserRole(role);
          if (role === 'admin') {
            setActiveTab('home');
          }
        }}
        onOpenTrustModal={() => setIsTrustModalOpen(true)}
        onOpenReportModal={() => handleOpenReportModal()}
        onOpenProviderOnboardModal={() => {
          setActiveTab('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenGeminiDecision={handleOpenGrounding}
        currentUser={currentUser}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        isAuthLoading={isAuthLoading}
      />

      {/* Main Container Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 md:pb-12">
        {/* DESKTOP ADMIN SWITCHER BAR (when role is admin) */}
        {userRole === 'admin' && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
              <span className="text-xs font-bold text-amber-950">
                Administrator Mode Active: Corridor Destination Management
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  activeTab === 'home' ? 'bg-[#0F2942] text-white' : 'bg-white text-slate-700 hover:bg-amber-100'
                }`}
              >
                Traveller View
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  activeTab === 'explore' ? 'bg-[#0F2942] text-white' : 'bg-white text-slate-700 hover:bg-amber-100'
                }`}
              >
                Admin Dashboard & Queue
              </button>
            </div>
          </div>
        )}

        {/* VIEW ROUTER */}
        {/* If Admin persona chooses admin dashboard or explore */}
        {userRole === 'admin' && activeTab === 'explore' ? (
          <AdminDashboard
            destinations={destinations}
            providers={providers}
            reports={reports}
            feedback={feedback}
            auditLogs={auditLogs}
            onUpdateProviderStatus={handleUpdateProviderStatus}
            onToggleProviderActive={handleToggleProviderActive}
            onUpdateReportStatus={handleUpdateReportStatus}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                destinations={destinations}
                providers={providers}
                currentLang={currentLang}
                onPlanTrip={handlePlanTrip}
                onExplore={() => setActiveTab('explore')}
                onSelectDestination={setSelectedDestination}
                onSelectProvider={setSelectedProvider}
                onOpenTrustModal={() => setIsTrustModalOpen(true)}
                onOpenGeminiDecision={() => setIsGeminiDecisionOpen(true)}
              />
            )}

            {activeTab === 'explore' && (
              <ExploreProviders
                providers={providers}
                onSelectProvider={setSelectedProvider}
                onCallProvider={(p) => {
                  window.location.href = `tel:${p.phone.replace(/\s+/g, '')}`;
                }}
                onWhatsAppEnquiry={(p) => {
                  window.open(`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(p.name)},%20I%20saw%20your%20listing%20on%20Local%20Lens%20Kerala.`, '_blank');
                }}
                onRequestBook={(p) => setSelectedProvider(p)}
                onOpenTrustModal={() => setIsTrustModalOpen(true)}
              />
            )}

            {activeTab === 'plan' && (
              <>
                {hasGeneratedItinerary ? (
                  <ItineraryView
                    days={dynamicItineraryDays || MOCK_ITINERARY_DAYS}
                    cost={dynamicCostBreakdown || MOCK_COST_BREAKDOWN}
                    score={dynamicResponsibleScore || responsibleScore}
                    preferences={tripPreferences}
                    aiSummary={dynamicAiSummary || undefined}
                    aiSource={dynamicAiSource || undefined}
                    onEditPreferences={() => setHasGeneratedItinerary(false)}
                    onSaveItinerary={handleToggleSaveItinerary}
                    isSaved={isItinerarySaved}
                    onReportIssue={handleOpenReportModal}
                    onSelectProviderById={(id) => {
                      const found = providers.find(p => p.id === id);
                      if (found) setSelectedProvider(found);
                    }}
                    onRequestBook={(stop) => {
                      if (stop.providerId) {
                        const found = providers.find(p => p.id === stop.providerId);
                        if (found) setSelectedProvider(found);
                      } else {
                        handleOpenReportModal(stop.activityOrProviderName);
                      }
                    }}
                    onOpenTrustModal={() => setIsTrustModalOpen(true)}
                    onOpenGeminiDecision={() => setIsGeminiDecisionOpen(true)}
                  />
                ) : (
                  <TripPlanner
                    onGenerateItinerary={handleGenerateItinerary}
                    onCancel={() => setHasGeneratedItinerary(true)}
                    onOpenGeminiDecision={() => setIsGeminiDecisionOpen(true)}
                  />
                )}
              </>
            )}

            {activeTab === 'saved' && (
              <SavedTripsView
                isItinerarySaved={isItinerarySaved}
                savedDays={dynamicItineraryDays || MOCK_ITINERARY_DAYS}
                savedProviders={savedProviders}
                preferences={tripPreferences}
                onViewItinerary={() => {
                  setHasGeneratedItinerary(true);
                  setActiveTab('plan');
                }}
                onSelectProvider={setSelectedProvider}
                onRemoveProvider={(id) => handleToggleBookmarkProvider(id)}
                onPlanTrip={handlePlanTrip}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                currentLang={currentLang}
                onSelectLanguage={setCurrentLang}
                userRole={userRole}
                onSelectRole={setUserRole}
                preferences={tripPreferences}
                savedCount={savedProviderIds.length}
                onOpenTrustModal={() => setIsTrustModalOpen(true)}
                onRegisterProviderSubmit={handleRegisterNewProvider}
                currentUser={currentUser}
                onSignInGoogle={handleSignInGoogle}
                onSignOut={handleSignOut}
                cloudItineraries={cloudItineraries}
                onOpenGrounding={handleOpenGrounding}
              />
            )}
          </>
        )}
      </div>

      {/* Persistent Floating Corridor Map Widget */}
      <FloatingMapWidget
        stops={(dynamicItineraryDays || MOCK_ITINERARY_DAYS).flatMap(d => d.stops)}
        onSelectStop={(stop) => {
          if (stop.providerId) {
            const found = providers.find(p => p.id === stop.providerId);
            if (found) setSelectedProvider(found);
          }
        }}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentLang={currentLang}
        savedCount={savedProviderIds.length + (isItinerarySaved ? 1 : 0)}
      />

      {/* POPUP MODALS */}
      {/* 1. Destination Details */}
      <DestinationDetailModal
        destination={selectedDestination}
        isOpen={Boolean(selectedDestination)}
        onClose={() => setSelectedDestination(null)}
        providers={providers}
        onSelectProvider={(p) => {
          setSelectedDestination(null);
          setSelectedProvider(p);
        }}
        onPlanTripToArea={(area) => {
          setSelectedDestination(null);
          setTripPreferences(prev => ({ ...prev, destinationArea: area }));
          setActiveTab('plan');
        }}
        onReportIssue={(name) => {
          setSelectedDestination(null);
          handleOpenReportModal(name);
        }}
      />

      {/* 2. Provider Profile & Enquiry */}
      <ProviderDetailModal
        provider={selectedProvider}
        isOpen={Boolean(selectedProvider)}
        onClose={() => setSelectedProvider(null)}
        onReportIssue={(name) => {
          setSelectedProvider(null);
          handleOpenReportModal(name);
        }}
        onOpenTrustModal={() => {
          setSelectedProvider(null);
          setIsTrustModalOpen(true);
        }}
      />

      {/* 3. Trust & Data Transparency Framework */}
      <TrustTransparencyModal
        isOpen={isTrustModalOpen}
        onClose={() => setIsTrustModalOpen(false)}
        onOpenReportIssue={() => {
          setIsTrustModalOpen(false);
          handleOpenReportModal('General Directory Inaccuracy');
        }}
      />

      {/* 4. Report An Issue */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        destinations={destinations}
        providers={providers}
        initialEntityName={reportEntityName}
        onSubmitReport={handleSubmitReport}
      />

      {/* 5. Gemini AI Decision Engine Assistant */}
      <GeminiDecisionAssistant
        isOpen={isGeminiDecisionOpen}
        onClose={() => setIsGeminiDecisionOpen(false)}
        preferences={tripPreferences}
        initialMode={geminiAssistantMode}
        onSelectProviderByName={(name) => {
          const found = providers.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
          if (found) {
            setSelectedProvider(found);
            setIsGeminiDecisionOpen(false);
          }
        }}
      />
    </div>
  );
}
