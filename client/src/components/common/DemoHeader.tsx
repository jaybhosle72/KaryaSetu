import React from 'react';
import { UserRole } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { Users, HardHat, Briefcase, Building, RotateCcw, AlertTriangle } from 'lucide-react';

interface DemoHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetDemo: () => void;
  onTriggerEmergency: () => void;
  activeBookingsCount: number;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const DemoHeader: React.FC<DemoHeaderProps> = ({
  currentRole,
  onRoleChange,
  onResetDemo,
  onTriggerEmergency,
  activeBookingsCount,
  currentLanguage,
  onLanguageChange
}) => {
  // 4 Perspectives: Customer, Worker, Contractor, Admin
  const roles: { key: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'customer',
      label: 'Customer',
      icon: <Users className="w-3.5 h-3.5" />,
      desc: 'Book verified workers'
    },
    {
      key: 'worker',
      label: 'Worker',
      icon: <HardHat className="w-3.5 h-3.5" />,
      desc: 'Jobs, earnings & welfare'
    },
    {
      key: 'contractor',
      label: 'Contractor',
      icon: <Briefcase className="w-3.5 h-3.5 text-blue-400" />,
      desc: 'Manage worker community'
    },
    {
      key: 'admin',
      label: 'Admin',
      icon: <Building className="w-3.5 h-3.5 text-amber-400" />,
      desc: 'Cooperative oversight & AI'
    }
  ];

  // Map admin or cooperative to admin tab
  const activeKey = currentRole === 'cooperative' || currentRole === 'federation' ? 'admin' : currentRole;

  return (
    <div className="bg-slate-900 text-slate-300 border-b border-slate-800 sticky top-0 z-50 py-2 px-4 font-sans text-xs">
      <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-white text-xs tracking-tight">
            Cooperative Platform Demo:
          </span>
        </div>

        {/* Center: 3 Major Sides Switcher (Customer | Worker | Admin) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {roles.map((r) => {
            const isActive = activeKey === r.key;
            return (
              <button
                key={r.key}
                onClick={() => onRoleChange(r.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-white text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Emergency Demo & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerEmergency}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm"
            title="Demonstrate instant emergency request flow"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Emergency SOS</span>
          </button>

          <button
            onClick={onResetDemo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
            title="Reset demo records to clean state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

      </div>
    </div>
  );
};
