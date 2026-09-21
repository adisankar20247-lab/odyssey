import React, { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  MapPin, 
  Upload, 
  Check, 
  ShieldAlert, 
  Info, 
  Navigation, 
  Camera, 
  AlertTriangle 
} from 'lucide-react';
import { IssueCategory, IssueSeverity, Destination, Provider, IssueReport } from '../types';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  providers: Provider[];
  initialEntityName?: string;
  onSubmitReport: (report: IssueReport) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  destinations,
  providers,
  initialEntityName = '',
  onSubmitReport
}) => {
  const [category, setCategory] = useState<IssueCategory>('Safety');
  const [relatedEntity, setRelatedEntity] = useState<string>(initialEntityName || 'Kovalam Beach & Lighthouse');
  const [severity, setSeverity] = useState<IssueSeverity>('Medium');
  const [description, setDescription] = useState<string>('');
  const [hasLocationShared, setHasLocationShared] = useState<boolean>(false); // DEFAULT OFF per prompt
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [imageAttached, setImageAttached] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories: IssueCategory[] = [
    'Safety',
    'Cleanliness',
    'Accessibility',
    'Incorrect price',
    'Incorrect opening hours',
    'Transport issue',
    'Closed location',
    'Harassment/misconduct',
    'Other'
  ];

  const severities: { level: IssueSeverity; label: string; color: string }[] = [
    { level: 'Low', label: 'Low (Informational)', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { level: 'Medium', label: 'Medium (Disruption)', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { level: 'High', label: 'High (Immediate Attention)', color: 'bg-orange-100 text-orange-900 border-orange-300' },
    { level: 'Urgent', label: 'Urgent (Safety Risk)', color: 'bg-red-100 text-red-900 border-red-300' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) return;

    const newReport: IssueReport = {
      id: `rep-${Date.now()}`,
      category,
      relatedEntity,
      destination: relatedEntity.includes('Varkala') ? 'Varkala' : relatedEntity.includes('Kovalam') ? 'Kovalam' : 'Thiruvananthapuram',
      severity,
      description,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      moderationStatus: 'Pending',
      hasLocationShared,
      hasImageAttached: imageAttached,
      isSensitive: category === 'Harassment/misconduct' || severity === 'Urgent'
    };

    onSubmitReport(newReport);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDescription('');
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-amber-700 to-orange-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-black/30 text-amber-200 text-xs font-bold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Civic & Safety Reporting</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black">
            Report a Destination Issue
          </h2>
          <p className="text-xs text-amber-100 mt-0.5">
            Help local panchayats, tourism coordinators, and fellow travellers maintain safe, clean, and accessible public spaces.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-300 rounded-2xl animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-base font-extrabold text-emerald-950">
                “Thank you. Your report has been submitted for moderation. It will not be displayed publicly until reviewed.”
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                Our corridor destination manager has received your submission. Once reviewed and verified, necessary civic actions or directory corrections will be applied.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  What are you reporting?
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as IssueCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Related Entity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Related Destination or Provider
                </label>
                <select
                  value={relatedEntity}
                  onChange={e => setRelatedEntity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <optgroup label="Corridor Destinations">
                    {destinations.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.area})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Local Providers">
                    {providers.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.category})</option>
                    ))}
                  </optgroup>
                  <option value="Other Public Location">Other Corridor Public Space</option>
                </select>
              </div>

              {/* Severity Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Severity Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {severities.map(s => (
                    <button
                      key={s.level}
                      type="button"
                      onClick={() => setSeverity(s.level)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        severity === s.level
                          ? `${s.color} ring-2 ring-amber-600/30`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s.level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description of the Issue
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide objective facts (e.g. broken handrail, locked accessible ramp, wrong bus slot, overcharging)..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Image upload placeholder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Supporting Photo (Optional)
                </label>
                <div 
                  onClick={() => setImageAttached(!imageAttached)}
                  className={`p-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    imageAttached ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-300 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium">
                    {imageAttached ? 'Photo attached: issue_evidence.jpg (Click to remove)' : 'Tap to attach photo evidence (e.g. blocked ramp or price board)'}
                  </span>
                </div>
              </div>

              {/* Location sharing toggle - DEFAULT OFF */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Share Current Location</div>
                    <div className="text-[11px] text-slate-500">Helps field rangers pinpoint the exact spot (Default: OFF)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasLocationShared(!hasLocationShared)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    hasLocationShared ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    hasLocationShared ? 'left-5.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Consent Checkbox - MANDATED */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="report-consent"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded mt-0.5"
                  required
                />
                <label htmlFor="report-consent" className="text-xs text-amber-950 font-medium cursor-pointer">
                  “I understand this report will be reviewed and may be shared in anonymised form with destination administrators.”
                </label>
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!consentChecked || !description.trim()}
                  className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-xs"
                >
                  Submit Issue for Moderation
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
