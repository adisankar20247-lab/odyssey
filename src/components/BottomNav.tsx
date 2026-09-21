import React from 'react';
import { Home, Compass, CalendarCheck, Bookmark, User } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

export type TabKey = 'home' | 'explore' | 'plan' | 'saved' | 'profile';

interface BottomNavProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  currentLang: Language;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  currentLang,
  savedCount
}) => {
  const t = TRANSLATIONS[currentLang];

  const items: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'home', label: t.navHome, icon: Home },
    { key: 'explore', label: t.navExplore, icon: Compass },
    { key: 'plan', label: t.navPlan, icon: CalendarCheck },
    { key: 'saved', label: t.navSaved, icon: Bookmark },
    { key: 'profile', label: t.navProfile, icon: User }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 pb-safe">
      <div className="flex items-center justify-around">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          const isCenter = item.key === 'plan';

          if (isCenter) {
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className="flex flex-col items-center -mt-4 relative group focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
                  isActive ? 'bg-[#0D9488] text-white ring-4 ring-emerald-100' : 'bg-[#0F2942] text-white'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-[#0D9488]' : 'text-slate-600'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors relative ${
                isActive ? 'text-[#0D9488] font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.key === 'saved' && savedCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
