import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Compass, 
  Wallet, 
  ShieldCheck, 
  Accessibility, 
  Award, 
  ArrowRight, 
  HeartHandshake, 
  Info, 
  CheckCircle2,
  Calendar,
  ChevronRight,
  TrendingUp,
  Clock,
  PhoneCall
} from 'lucide-react';
import { Destination, Provider } from '../types';
import { Language, TRANSLATIONS } from '../data/translations';
import { TrustBadge } from './TrustBadge';

interface HomeViewProps {
  destinations: Destination[];
  providers: Provider[];
  currentLang: Language;
  onPlanTrip: () => void;
  onExplore: (category?: string, destinationId?: string) => void;
  onSelectDestination: (dest: Destination) => void;
  onSelectProvider: (prov: Provider) => void;
  onOpenTrustModal: () => void;
  onOpenGeminiDecision?: (mode?: 'decision' | 'search' | 'maps') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  destinations,
  providers,
  currentLang,
  onPlanTrip,
  onExplore,
  onSelectDestination,
  onSelectProvider,
  onOpenTrustModal,
  onOpenGeminiDecision
}) => {
  const t = TRANSLATIONS[currentLang];

  const quickChips = [
    { label: 'Kovalam', id: 'dest-kovalam' },
    { label: 'Varkala', id: 'dest-varkala' },
    { label: 'Ponmudi', id: 'dest-ponmudi' },
    { label: 'Neyyar', id: 'dest-neyyar' },
    { label: 'Thiruvananthapuram Heritage', id: 'dest-tvm-heritage' }
  ];

  // Feature cards requested
  const featureCards = [
    {
      icon: Wallet,
      color: 'text-emerald-700 bg-emerald-100',
      title: 'Budget-Aware Itineraries',
      desc: 'Transparent, explainable daily cost breakdowns in Indian Rupees (₹) designed around realistic student, family, and solo budgets.'
    },
    {
      icon: ShieldCheck,
      color: 'text-blue-700 bg-blue-100',
      title: 'Verified Local Partners',
      desc: 'Small homestays, licensed storytelling guides, and women’s craft cooperatives vetted in the field for authentic community benefits.'
    },
    {
      icon: Accessibility,
      color: 'text-amber-700 bg-amber-100',
      title: 'Safety & Accessibility Info',
      desc: 'Wheelchair access ratings, daylight travel advice, lifeguard flag status, and verified emergency police and medical contacts.'
    },
    {
      icon: Award,
      color: 'text-purple-700 bg-purple-100',
      title: 'Responsible Route Score',
      desc: 'A transparent 0–100 index measuring community benefit, public transit feasibility, fair pricing, and off-peak crowd suitability.'
    }
  ];

  // Verified spotlight providers
  const spotlightProviders = providers
    .filter(p => p.verificationStatus === 'Verified Local Partner' && p.activeStatus)
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* SCREEN 1: HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F2942] via-[#16385C] to-[#0A1F33] text-white p-6 sm:p-10 shadow-lg border border-slate-700/50">
        {/* Background ambient lighting and subtle Kerala pattern */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Pilot Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/40 text-emerald-200 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Thiruvananthapuram – Kovalam – Varkala Pilot</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Travel local. <br />
            <span className="text-emerald-400">Travel safe.</span> <span className="text-orange-400">Travel responsibly.</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
            Build affordable Kerala journeys that support verified local homestays, community guides, and craft artisans—with total data transparency.
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onPlanTrip}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-98 cursor-pointer"
            >
              <span>{t.planMyTrip}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onExplore()}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm sm:text-base backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{t.exploreExperiences}</span>
            </button>

            {onOpenGeminiDecision && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenGeminiDecision('decision')}
                  className="px-4 py-3.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/30 font-bold text-sm sm:text-base backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>AI Decisions</span>
                </button>

                <button
                  onClick={() => onOpenGeminiDecision('search')}
                  className="px-3 py-3.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-300/30 font-bold text-xs sm:text-sm backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Live Google Search Grounding for current conditions, tides & trains"
                >
                  <span>Search Grounding</span>
                </button>

                <button
                  onClick={() => onOpenGeminiDecision('maps')}
                  className="px-3 py-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-300/30 font-bold text-xs sm:text-sm backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Live Google Maps Grounding for locations, access & spots"
                >
                  <span>Maps Grounding</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Destination Chips */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explore Corridor Destinations:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickChips.map(chip => {
                const destObj = destinations.find(d => d.id === chip.id);
                return (
                  <button
                    key={chip.id}
                    onClick={() => destObj && onSelectDestination(destObj)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-emerald-500/30 text-white text-xs font-medium border border-white/15 transition-colors flex items-center gap-1"
                  >
                    <span>{chip.label}</span>
                    <ChevronRight className="w-3 h-3 text-emerald-300 opacity-70" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BANNER - MANDATED REQUIREMENT */}
      <section className="rounded-xl bg-[#F0FDF4] border border-emerald-300 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="font-bold text-sm text-emerald-950">
                “Every recommendation shows its source, verification status, and last updated date.”
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                No hidden commercial sponsorships. We display clear trust badges so you know exactly who verified the information and when.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTrustModal}
            className="px-3.5 py-1.5 rounded-lg bg-white text-emerald-900 border border-emerald-300 text-xs font-bold hover:bg-emerald-50 transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
          >
            <Info className="w-3.5 h-3.5 text-emerald-700" />
            <span>Read Trust Framework</span>
          </button>
        </div>
      </section>

      {/* FOUR CORE DIFFERENTIATION CARDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942]">Why Choose Local Lens?</h2>
            <p className="text-xs sm:text-sm text-slate-500">A responsible, non-commercial alternative to algorithmic travel aggregators.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1.5">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* VERIFIED LOCAL PROVIDERS SPOTLIGHT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942]">Verified Local Partners</h2>
            <p className="text-xs sm:text-sm text-slate-500">Supporting small homestays, licensed storytelling guides, and fair-trade artisans.</p>
          </div>
          <button
            onClick={() => onExplore()}
            className="text-xs font-bold text-[#0D9488] hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All ({providers.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {spotlightProviders.map(prov => (
            <div
              key={prov.id}
              onClick={() => onSelectProvider(prov)}
              className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={prov.image}
                  alt={prov.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-white/95 text-[#0F2942] backdrop-blur-xs shadow-xs">
                    {prov.category}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <TrustBadge status={prov.verificationStatus} compact={true} />
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0D9488] transition-colors line-clamp-1">
                    {prov.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{prov.location}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2">
                    {prov.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Starting from</span>
                    <span className="font-extrabold text-[#0F2942]">{prov.priceRange}</span>
                  </div>
                  <span className="text-xs font-bold text-[#0D9488] flex items-center gap-0.5">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CURATED PILOT STATEMENT SECTION - MANDATED REQUIREMENT */}
      <section className="rounded-2xl bg-amber-50/70 border border-amber-200/90 p-5 sm:p-7">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Info className="w-4 h-4 text-amber-700" />
              <span>Curated Pilot Data Notice</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              “Local Lens is a curated pilot for responsible tourism in Kerala.”
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We do not claim live bookings, crowd predictions, or live bus telemetry unless verified. All itineraries and listings are transparent pilot models designed to test fair local commerce and civic accountability along the Thiruvananthapuram–Kovalam–Varkala corridor.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={onPlanTrip}
              className="px-4 py-2.5 rounded-lg bg-[#0F2942] text-white text-xs font-bold hover:bg-[#16385C] transition-colors"
            >
              Test Route Planner
            </button>
            <button
              onClick={onOpenTrustModal}
              className="px-4 py-2.5 rounded-lg bg-white text-slate-700 border border-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Data Principles
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
