import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  FileCheck2, 
  Clock, 
  AlertTriangle, 
  Lock, 
  EyeOff, 
  Sparkles, 
  HelpCircle,
  FileText,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';

interface TrustTransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportIssue?: () => void;
}

export const TrustTransparencyModal: React.FC<TrustTransparencyModalProps> = ({
  isOpen,
  onClose,
  onOpenReportIssue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0F2942] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Integrity & Governance Standard</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black">
            Trust & Data Transparency Framework
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Why Local Lens does not rely on opaque algorithms, fake review scores, or unverified commercial listings.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 text-xs sm:text-sm">
          {/* SECTION 1: VERIFICATION LABELS */}
          <div>
            <h3 className="text-sm font-extrabold text-[#0F2942] uppercase tracking-wider mb-3">
              1. What Each Verification Label Means
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Local Partner</span>
                </div>
                <p className="text-xs text-emerald-950 mt-1 leading-relaxed">
                  Contact, location, and service information reviewed by Local Lens. Includes physical field verification by our corridor coordinators, confirming authentic local ownership and direct community benefit.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                <div className="flex items-center gap-2 font-bold text-blue-900 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Official Source</span>
                </div>
                <p className="text-xs text-blue-950 mt-1 leading-relaxed">
                  Information from an authorised public or tourism source (e.g. Kerala Tourism, Archaeological Survey of India, Forest Department, or Kerala State RTC).
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-sm">
                  <Users className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Community Submitted</span>
                </div>
                <p className="text-xs text-amber-950 mt-1 leading-relaxed">
                  Submitted by a community member or local provider and currently awaiting physical field review by our verification squad.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs sm:text-sm">
                  <FileCheck2 className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Curated Pilot Data</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  Demonstration information used during the Thiruvananthapuram–Kovalam–Varkala pilot phase and clearly marked for testing purposes.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: 90-DAY FRESHNESS RULE */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F2942] uppercase tracking-wider">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>2. How "Last Updated" Dates Work (90-Day Freshness Rule)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tourism conditions, seasonal monsoon schedules, tariff cards, and beach safety flags change rapidly in Kerala. Every record displays its explicit last-updated stamp. If any record has not been re-audited in the past <strong>90 days</strong>, the system automatically flags it with a visible <span className="inline-block px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold border border-red-300 text-[10px]">Needs Update</span> warning tag.
            </p>
          </div>

          {/* SECTION 3: PROVIDER APPROVAL PIPELINE */}
          <div>
            <h3 className="text-sm font-extrabold text-[#0F2942] uppercase tracking-wider mb-2">
              3. Strict Provider Approval Pipeline
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Small businesses must complete a 5-step vetting flow before receiving recommendation status:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                <div className="font-bold text-slate-700">1. Submitted</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Application filed</div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <div className="font-bold text-blue-800">2. Contact Verified</div>
                <div className="text-[10px] text-blue-600 mt-0.5">Phone & WhatsApp</div>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                <div className="font-bold text-teal-800">3. Location Verified</div>
                <div className="text-[10px] text-teal-600 mt-0.5">Coordinates & address</div>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                <div className="font-bold text-purple-800">4. Admin Review</div>
                <div className="text-[10px] text-purple-600 mt-0.5">Trade & NOC check</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300">
                <div className="font-bold text-emerald-900">5. Approved</div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Public partner badge</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic mt-2">
              Note: Unapproved, suspended, or pending providers are strictly suppressed from itinerary recommendations.
            </p>
          </div>

          {/* SECTION 4: PRIVACY & ZERO COMMISSIONS */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>4. Privacy Statement & Anti-Commercial Charter</span>
            </div>
            <ul className="space-y-1.5 text-xs text-emerald-900 list-disc list-inside">
              <li><strong>Free core experience:</strong> Travellers never pay to generate routes.</li>
              <li><strong>No advertisements:</strong> No paid sponsored rankings or search placements.</li>
              <li><strong>Zero personal data sales:</strong> We do not monetise or package user data.</li>
              <li><strong>No mandatory GPS tracking:</strong> Location sharing is disabled by default and only activated if explicitly toggled for civic issue reporting.</li>
            </ul>
          </div>

          {/* SECTION 5: REPORTING INACCURACIES */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-slate-800">Encountered an inaccurate record or safety hazard?</div>
              <p className="text-[11px] text-slate-500">
                Submit an anonymised report to help local destination coordinators keep public data honest.
              </p>
            </div>
            {onOpenReportIssue && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReportIssue();
                }}
                className="px-4 py-2 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white text-xs font-bold shrink-0 shadow-xs"
              >
                File Civic Report
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 shadow-2xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
