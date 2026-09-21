import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Accessibility, 
  HeartHandshake, 
  Check, 
  AlertCircle, 
  Clock, 
  Send,
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Provider } from '../types';
import { TrustBadge, isStale } from './TrustBadge';

interface ProviderDetailModalProps {
  provider: Provider | null;
  isOpen: boolean;
  onClose: () => void;
  onReportIssue: (entityName?: string) => void;
  onOpenTrustModal: () => void;
}

export const ProviderDetailModal: React.FC<ProviderDetailModalProps> = ({
  provider,
  isOpen,
  onClose,
  onReportIssue,
  onOpenTrustModal
}) => {
  const [enquiryDate, setEnquiryDate] = useState<string>('2026-09-25');
  const [enquiryTravellers, setEnquiryTravellers] = useState<number>(2);
  const [enquiryMessage, setEnquiryMessage] = useState<string>('');
  const [contactMethod, setContactMethod] = useState<'WhatsApp' | 'Phone' | 'Email'>('WhatsApp');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen || !provider) return null;

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900">
          <img
            src={provider.image}
            alt={provider.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Bottom Banner inside Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
              {provider.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1 leading-snug">
              {provider.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-200 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{provider.location}</span>
            </div>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Verification & Trust Details Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verification & Authenticity Audit</span>
              </span>
              <button
                onClick={onOpenTrustModal}
                className="text-[11px] text-[#0D9488] font-bold hover:underline"
              >
                Verification Criteria
              </button>
            </div>

            <TrustBadge 
              status={provider.verificationStatus}
              lastUpdated={provider.lastUpdated}
              source={provider.source}
            />

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div>
                <span className="text-slate-400">Field Audit Date:</span>{' '}
                <span className="font-semibold text-slate-800">{provider.lastVerifiedDate}</span>
              </div>
              <div>
                <span className="text-slate-400">Contact Verified:</span>{' '}
                <span className="font-semibold text-emerald-700">Yes (Direct Partner)</span>
              </div>
            </div>
          </div>

          {/* About Provider */}
          <div>
            <h3 className="font-bold text-sm text-[#0F2942] uppercase tracking-wider mb-2">
              About the Provider
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {provider.description}
            </p>
          </div>

          {/* Community Impact Card - MANDATED */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-900">
              <HeartHandshake className="w-4 h-4 text-amber-700" />
              <span>Community Impact</span>
            </div>
            <p className="text-xs font-semibold">
              “Choosing this provider supports local livelihoods.”
            </p>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              {provider.communityImpact}
            </p>
          </div>

          {/* Services & Tariff Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-2">Services & Features</span>
              <ul className="space-y-1 text-xs text-slate-600">
                {provider.services.map((srv, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{srv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Indicative Price Range</span>
                <span className="text-lg font-black text-[#0F2942]">{provider.priceRange}</span>
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Languages:</span> {provider.languages.join(', ')}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Seasonality:</span> {provider.seasonality}
              </div>
            </div>
          </div>

          {/* Accessibility & Safety Notices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <Accessibility className="w-4 h-4 text-emerald-600" />
                <span>Accessibility Information</span>
              </span>
              <p className="text-xs text-slate-600">{provider.accessibilityNotes}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Safety & Hygiene Notes</span>
              </span>
              <p className="text-xs text-slate-600">{provider.safetyNotes}</p>
            </div>
          </div>

          {/* Direct Provider Contacts */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Direct Contact Options
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${provider.phone.replace(/\s+/g, '')}`}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Call Provider</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{provider.phone}</span>
              </a>

              <a
                href={`https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(provider.name)},%20I%20saw%20your%20listing%20on%20Local%20Lens%20Kerala%20pilot.`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Enquiry</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              </a>
            </div>
          </div>

          {/* Direct Enquiry / Request to Book Form - MANDATED */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#0F2942]">
                  Send Enquiry / Request to Book
                </h4>
                <p className="text-[11px] text-slate-500">
                  Connect with no intermediary cut. Direct communication with the local host.
                </p>
              </div>
            </div>

            {isSubmitted ? (
              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs text-center space-y-1">
                <Check className="w-6 h-6 text-emerald-700 mx-auto" />
                <div className="font-bold">Enquiry Sent to {provider.name}!</div>
                <p>The provider will respond to you via {contactMethod} within their working hours.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={enquiryDate}
                      onChange={e => setEnquiryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Number of Travellers
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={enquiryTravellers}
                      onChange={e => setEnquiryTravellers(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Preferred Contact Channel
                  </label>
                  <div className="flex items-center gap-2">
                    {(['WhatsApp', 'Phone', 'Email'] as const).map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setContactMethod(ch)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          contactMethod === ch
                            ? 'bg-[#0D9488] text-white border-[#0D9488]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Message / Special Requests
                  </label>
                  <textarea
                    rows={2}
                    value={enquiryMessage}
                    onChange={e => setEnquiryMessage(e.target.value)}
                    placeholder="e.g. Vegetarian meal requirements, wheelchair assistance, or student group pricing..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct Request to Provider</span>
                </button>
              </form>
            )}

            {/* MANDATORY DISCLAIMER */}
            <p className="text-[10px] text-slate-400 italic text-center pt-1">
              “Local Lens facilitates enquiries. Availability and final price must be confirmed with the provider.”
            </p>
          </div>

          {/* Report an issue about this provider */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                onClose();
                onReportIssue(provider.name);
              }}
              className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center justify-center gap-1 mx-auto"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Report inaccurate information or issue regarding this provider</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
