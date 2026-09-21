import React from 'react';
import { ShieldCheck, CheckCircle2, Users, FileCheck2, Clock, AlertTriangle } from 'lucide-react';
import { VerificationStatus } from '../types';

interface TrustBadgeProps {
  status: VerificationStatus;
  lastUpdated?: string;
  source?: string;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const isStale = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  try {
    const recordDate = new Date(dateStr);
    const now = new Date('2026-09-20'); // App current pilot reference date
    const diffTime = Math.abs(now.getTime() - recordDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 90;
  } catch {
    return false;
  }
};

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  status,
  lastUpdated,
  source,
  compact = false,
  className = '',
  onClick
}) => {
  const stale = isStale(lastUpdated);

  const getBadgeConfig = () => {
    switch (status) {
      case 'Verified Local Partner':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
          icon: ShieldCheck,
          iconColor: 'text-emerald-600',
          label: 'Verified Local Partner',
          tooltip: 'Contact, location, and identity vetted by Local Lens field team'
        };
      case 'Official Source':
        return {
          bg: 'bg-blue-50 border-blue-300 text-blue-800',
          icon: CheckCircle2,
          iconColor: 'text-blue-600',
          label: 'Official Source',
          tooltip: 'Directly sourced from Kerala Tourism / Government Department'
        };
      case 'Community Submitted':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-800',
          icon: Users,
          iconColor: 'text-amber-600',
          label: 'Community Submitted',
          tooltip: 'Contributed by local travellers; field audit in progress'
        };
      case 'Curated Pilot Data':
      default:
        return {
          bg: 'bg-slate-100 border-slate-300 text-slate-700',
          icon: FileCheck2,
          iconColor: 'text-slate-600',
          label: 'Curated Pilot Data',
          tooltip: 'Demonstration pilot record for Kerala Corridor MVP'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  if (compact) {
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
        title={config.tooltip}
      >
        <Icon className={`w-3.5 h-3.5 ${config.iconColor} shrink-0`} />
        <span className="truncate">{config.label}</span>
        {stale && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-700 border border-red-300 font-semibold ml-1">
            <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
            Needs Update
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`rounded-lg border p-2.5 text-xs ${config.bg} ${onClick ? 'cursor-pointer hover:shadow-sm transition-all' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 font-semibold">
          <Icon className={`w-4 h-4 ${config.iconColor} shrink-0`} />
          <span>{config.label}</span>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated: {lastUpdated}</span>
          </div>
        )}
      </div>

      {source && (
        <div className="mt-1 text-[11px] text-slate-600 font-normal">
          <span className="text-slate-400 font-medium">Source:</span> {source}
        </div>
      )}

      {stale && (
        <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-red-100/90 text-red-800 rounded border border-red-200 text-[11px] font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>Record is older than 90 days — Field re-audit scheduled soon.</span>
        </div>
      )}
    </div>
  );
};
