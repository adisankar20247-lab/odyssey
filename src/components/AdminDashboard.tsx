import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Users, 
  FileText, 
  Download, 
  Filter, 
  Search, 
  Eye, 
  Building2, 
  Award, 
  DollarSign, 
  Check, 
  AlertCircle,
  RefreshCw,
  Edit2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  Destination, 
  Provider, 
  IssueReport, 
  CommunityFeedbackItem, 
  AuditLogEntry, 
  ProviderReviewStatus 
} from '../types';
import { TrustBadge, isStale } from './TrustBadge';
import { getGeminiAdminDecision } from '../services/geminiService';

interface AdminDashboardProps {
  destinations: Destination[];
  providers: Provider[];
  reports: IssueReport[];
  feedback: CommunityFeedbackItem[];
  auditLogs: AuditLogEntry[];
  onUpdateProviderStatus: (providerId: string, newStatus: ProviderReviewStatus, note?: string) => void;
  onToggleProviderActive: (providerId: string) => void;
  onUpdateReportStatus: (reportId: string, newStatus: IssueReport['moderationStatus'], adminNotes?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  destinations,
  providers,
  reports,
  feedback,
  auditLogs,
  onUpdateProviderStatus,
  onToggleProviderActive,
  onUpdateReportStatus
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'providers' | 'reports' | 'audit'>('overview');
  const [selectedHotspot, setSelectedHotspot] = useState<string>('All');
  const [selectedProviderForReview, setSelectedProviderForReview] = useState<Provider | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [filterProviderStatus, setFilterProviderStatus] = useState<string>('All');
  const [triageLoadingId, setTriageLoadingId] = useState<string | null>(null);
  const [triageDecisions, setTriageDecisions] = useState<Record<string, any>>({});

  const handleGetAiDecision = async (report: IssueReport) => {
    setTriageLoadingId(report.id);
    try {
      const res = await getGeminiAdminDecision(report);
      setTriageDecisions(prev => ({ ...prev, [report.id]: res.decision }));
    } catch (err) {
      console.error(err);
    } finally {
      setTriageLoadingId(null);
    }
  };

  // Key Metrics Calculations
  const verifiedProvidersCount = providers.filter(p => p.verificationStatus === 'Verified Local Partner').length;
  const staleProvidersCount = providers.filter(p => isStale(p.lastUpdated)).length;
  const activePilotDestinationsCount = destinations.length;
  const openIssuesCount = reports.filter(r => r.moderationStatus === 'Pending' || r.moderationStatus === 'Under Review' || (r.moderationStatus as string) === 'Investigating').length;
  const avgResponsibleScore = 84;
  const totalCommunityBenefitINR = 485000;

  // Filtered destinations by hotspot
  const filteredDestinations = destinations.filter(d => {
    if (selectedHotspot === 'All') return true;
    return d.area.toLowerCase().includes(selectedHotspot.toLowerCase()) || d.name.toLowerCase().includes(selectedHotspot.toLowerCase());
  });

  // Filtered providers
  const filteredProviders = providers.filter(p => {
    if (filterProviderStatus !== 'All' && p.adminReviewStatus !== filterProviderStatus) {
      return false;
    }
    if (selectedHotspot !== 'All' && !p.location.toLowerCase().includes(selectedHotspot.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Export audit log
  const handleExportAuditLogs = () => {
    const csvRows = [
      ['Timestamp', 'Action', 'Target Entity', 'Performed By', 'Reason'],
      ...auditLogs.map(l => [l.timestamp, l.action, l.targetEntity, l.performedBy, l.reason])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `local_lens_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Admin Header */}
      <div className="bg-[#0F2942] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-800/70 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Tourism Officer & Destination Manager Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Corridor Destination Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Piloting civic trust, provider credentials, and crowd-safety management for Thiruvananthapuram–Kovalam–Varkala.
          </p>
        </div>

        {/* Hotspot quick filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/70 p-1 rounded-xl border border-slate-700">
          <span className="text-[11px] text-slate-400 px-2 font-semibold">Hotspot:</span>
          {['All', 'Kovalam', 'Varkala', 'Thiruvananthapuram'].map(spot => (
            <button
              key={spot}
              onClick={() => setSelectedHotspot(spot)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedHotspot === spot
                  ? 'bg-[#0D9488] text-white font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {spot}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            adminTab === 'overview'
              ? 'bg-[#0F2942] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Overview & Destination Health
        </button>

        <button
          onClick={() => setAdminTab('providers')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
            adminTab === 'providers'
              ? 'bg-[#0F2942] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>Provider Verification Pipeline</span>
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono">
            {providers.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
            adminTab === 'reports'
              ? 'bg-[#0F2942] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>Issue Moderation Queue</span>
          {openIssuesCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-mono">
              {openIssuesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            adminTab === 'audit'
              ? 'bg-[#0F2942] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Community Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & KEY METRICS */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* SIX KEY METRICS - MANDATED */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Verified Providers</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">{verifiedProvidersCount}</span>
              <span className="text-[10px] text-slate-400">Of {providers.length} listed</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Needs Update (&gt;90d)</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{staleProvidersCount}</span>
              <span className="text-[10px] text-rose-500 font-medium">Flagged stale</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Active Destinations</span>
              <span className="text-2xl font-black text-[#0F2942] mt-1 block">{activePilotDestinationsCount}</span>
              <span className="text-[10px] text-slate-400">Full corridor</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Open Issues</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{openIssuesCount}</span>
              <span className="text-[10px] text-slate-400">Pending review</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Avg Route Score</span>
              <span className="text-2xl font-black text-[#0D9488] mt-1 block">{avgResponsibleScore}/100</span>
              <span className="text-[10px] text-slate-400">Target: &gt;80</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-300 bg-emerald-50/40 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-900 block">Est. Community Direct</span>
              <span className="text-xl font-black text-emerald-800 mt-1 block">₹{(totalCommunityBenefitINR / 1000).toFixed(0)}k</span>
              <span className="text-[10px] text-emerald-700">Retained locally</span>
            </div>
          </div>

          {/* DESTINATION HEALTH TABLE - MANDATED */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#0F2942]">Destination Corridor Health Index</h3>
                <p className="text-xs text-slate-500">Live indicators across pilot sites</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Showing {filteredDestinations.length} nodes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Destination Name</th>
                    <th className="py-3 px-4">Verified Providers</th>
                    <th className="py-3 px-4">Cleanliness / Safety Status</th>
                    <th className="py-3 px-4">Active Issues</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDestinations.map(d => {
                    const destinationProvidersCount = providers.filter(p => p.location.toLowerCase().includes(d.area.toLowerCase())).length;
                    const destinationIssuesCount = reports.filter(r => r.destination.toLowerCase().includes(d.area.toLowerCase())).length;

                    return (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="text-sm">{d.name}</div>
                          <span className="text-[11px] text-slate-500 font-normal">{d.area} • {d.category}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-emerald-700 text-sm">
                            {destinationProvidersCount}
                          </span>{' '}
                          <span className="text-slate-400">partners</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            d.safetyRating.includes('Good') || d.safetyRating.includes('Monitored')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{d.safetyRating}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {destinationIssuesCount > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                              {destinationIssuesCount} reports
                            </span>
                          ) : (
                            <span className="text-slate-400">0 open</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {d.lastUpdated}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => alert(`Audit checklist generated for ${d.name}. Dispatched to field ranger.`)}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors"
                          >
                            Audit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROVIDER VERIFICATION PIPELINE (SCREEN 11) */}
      {adminTab === 'providers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#0F2942]">Provider Onboarding & Verification Pipeline</h3>
              <p className="text-xs text-slate-500">
                Review licenses, phone verification, field photos, and grant verified partner status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Filter:</span>
              <select
                value={filterProviderStatus}
                onChange={e => setFilterProviderStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="All">All Pipeline Stages</option>
                <option value="Approved">Approved</option>
                <option value="Submitted">Submitted</option>
                <option value="Contact verified">Contact verified</option>
                <option value="Location verified">Location verified</option>
                <option value="Needs re-verification">Needs re-verification</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Providers Pipeline List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProviders.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#0D9488]">{p.category}</span>
                      <h4 className="font-extrabold text-base text-slate-900">{p.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.adminReviewStatus === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.adminReviewStatus === 'Suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.adminReviewStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{p.location} • Contact: {p.phone}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <div className="font-semibold text-slate-700">Verification Trail:</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Status: {p.verificationStatus} • Last Verified: {p.lastVerifiedDate}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleProviderActive(p.id)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-md transition-colors ${
                        p.activeStatus
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {p.activeStatus ? 'Public: Active' : 'Public: Hidden'}
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedProviderForReview(p)}
                    className="px-3 py-1.5 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white text-xs font-bold transition-colors"
                  >
                    Open Review Drawer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SCREEN 11: REVIEW MODAL / DRAWER */}
          {selectedProviderForReview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700">
                      {selectedProviderForReview.category}
                    </span>
                    <h3 className="text-xl font-black text-[#0F2942]">
                      {selectedProviderForReview.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedProviderForReview(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <div className="font-bold text-slate-800">Compliance & Regulatory Check (Pilot Registry)</div>
                    <div>Aadhaar / Udyam MSME: <span className="font-mono text-emerald-700 font-bold">UDYAM-KL-12-88741 (Verified)</span></div>
                    <div>Kerala Tourism Homestay NOC / Guide Badge: <span className="font-mono text-emerald-700 font-bold">KL-TVM-TR-2024-C</span></div>
                    <div>Direct Contact Test: <span className="font-semibold text-slate-900">{selectedProviderForReview.phone}</span></div>
                    <div>Tariff Card: <span className="font-semibold text-slate-900">{selectedProviderForReview.priceRange}</span></div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Add Verification Auditor Note
                    </label>
                    <textarea
                      rows={2}
                      value={adminNoteInput}
                      onChange={e => setAdminNoteInput(e.target.value)}
                      placeholder="e.g. Field inspection confirmed accessibility ramp and pricing transparency..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onUpdateProviderStatus(selectedProviderForReview.id, 'Suspended', adminNoteInput);
                      setSelectedProviderForReview(null);
                      setAdminNoteInput('');
                    }}
                    className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold"
                  >
                    Suspend Listing
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onUpdateProviderStatus(selectedProviderForReview.id, 'Needs re-verification', adminNoteInput);
                        setSelectedProviderForReview(null);
                        setAdminNoteInput('');
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold"
                    >
                      Request More Info
                    </button>

                    <button
                      onClick={() => {
                        onUpdateProviderStatus(selectedProviderForReview.id, 'Approved', adminNoteInput);
                        setSelectedProviderForReview(null);
                        setAdminNoteInput('');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                    >
                      Approve & Verify Partner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ISSUE MODERATION QUEUE (SCREEN 10 & 8 MODERATION) */}
      {adminTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="font-bold text-base text-[#0F2942]">Civic & Destination Issue Queue</h3>
            <p className="text-xs text-slate-500">
              User submissions are kept unlisted from the public until verified by corridor moderators.
            </p>
          </div>

          <div className="space-y-3">
            {reports.map(rep => (
              <div
                key={rep.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                      {rep.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rep.severity === 'Urgent' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {rep.severity} Severity
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {rep.timestamp}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900">
                    {rep.relatedEntity} ({rep.destination})
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rep.description}
                  </p>

                  {rep.adminNotes && (
                    <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-500 font-medium">
                      Admin Note: {rep.adminNotes}
                    </div>
                  )}

                  {/* Gemini AI Decision Recommendation */}
                  {triageDecisions[rep.id] && (
                    <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Gemini Decision Recommendation (Priority: {triageDecisions[rep.id].priority})</span>
                      </div>
                      <p className="text-slate-800 font-medium">
                        <strong>Action:</strong> {triageDecisions[rep.id].triageAction}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        <strong>Resolution:</strong> {triageDecisions[rep.id].suggestedResolution}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGetAiDecision(rep)}
                      disabled={triageLoadingId === rep.id}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {triageLoadingId === rep.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>AI Decision</span>
                    </button>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      rep.moderationStatus === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rep.moderationStatus === 'Dismissed'
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rep.moderationStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {rep.moderationStatus !== 'Resolved' && (
                      <button
                        onClick={() => onUpdateReportStatus(rep.id, 'Resolved', 'Field team verified and resolved.')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                    {rep.moderationStatus !== 'Dismissed' && (
                      <button
                        onClick={() => onUpdateReportStatus(rep.id, 'Dismissed', 'Duplicate or unverified notice.')}
                        className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMMUNITY FEEDBACK & AUDIT LOGS (SCREEN 12) */}
      {adminTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#0F2942]">Community Audit Logs & Transparency History</h3>
              <p className="text-xs text-slate-500">
                Every moderation decision and directory update is recorded immutably for governance.
              </p>
            </div>

            <button
              onClick={handleExportAuditLogs}
              className="px-4 py-2 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Log (CSV)</span>
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Performed By</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="py-3 px-4 font-bold text-[#0F2942]">{log.action}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{log.targetEntity}</td>
                      <td className="py-3 px-4 text-emerald-700 font-medium">{log.performedBy}</td>
                      <td className="py-3 px-4 text-slate-600">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
