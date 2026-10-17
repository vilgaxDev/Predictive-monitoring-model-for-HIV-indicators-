import React from 'react';
import {
  Activity,
  HeartPulse,
  ClipboardList,
  ShieldAlert,
  UserCheck,
  Sparkles,
  MapPin,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Shield,
  Stethoscope,
  X
} from 'lucide-react';
import { UserRole } from '../types/health';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  userRole: UserRole;
  onOpenPythonModal: () => void;
  totalRecordsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
  userRole,
  onOpenPythonModal,
  totalRecordsCount,
}) => {
  const navSections = [
    {
      group: 'Clinical Surveillance',
      items: [
        { id: 'overview', label: 'Executive Overview', icon: Activity },
        { id: 'maternal-risk', label: 'Pregnancy Risk', icon: HeartPulse },
        { id: 'high-risk-register', label: 'Mothers Register', icon: ClipboardList },
      ],
    },
    {
      group: 'PMTCT & HIV Cohorts',
      items: [
        { id: 'hiv-incidence', label: 'HIV Surveillance', icon: ShieldAlert },
        { id: 'pmtct-outcomes', label: '5-Year PMTCT Cascade', icon: UserCheck },
      ],
    },
    {
      group: 'Explainable AI & Evaluation',
      items: [
        { id: 'explainable-ai', label: 'SHAP Explainability', icon: Sparkles },
        { id: 'county-comparisons', label: 'County Benchmarks', icon: MapPin },
        { id: 'model-performance', label: 'Model Visualization', icon: CheckCircle2 },
      ],
    },
    {
      group: 'Governance & Data',
      items: [
        { id: 'data-governance', label: 'Data & Governance', icon: Lock },
      ],
    },
  ];

  const roleLabelMap: Record<UserRole, string> = {
    MOH_POLICY_MAKER: 'MOH National Policy',
    COUNTY_HEALTH_DIRECTOR: 'County Health Director',
    FACILITY_CLINICIAN: 'Facility Clinician',
    RESEARCHER_EPIDEMIOLOGIST: 'Epidemiologist',
  };

  const handleSelect = (id: string) => {
    onTabChange(id);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/90 transition-all duration-200 ease-in-out shadow-sm dark:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[264px]'} w-[264px]`}
      >
        {/* Brand / Logo Zone */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/90 shrink-0">
          <div
            onClick={() => handleSelect('overview')}
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-600 dark:text-teal-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  AfyaBora AI
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                  Kenya MNH Monitoring
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((sec) => (
            <div key={sec.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 pb-1">
                  {sec.group}
                </div>
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-500/30 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/80 border border-transparent'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Zone */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-950/60 shrink-0 space-y-2">
          {/* Active Role Card */}
          {!isCollapsed && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-lg p-2.5 text-[11px] space-y-1 shadow-xs dark:shadow-none">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-300 truncate">
                  {roleLabelMap[userRole]}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono tabular-nums text-[10px]">
                <span>Active Cohort</span>
                <span className="text-teal-700 dark:text-teal-300 font-semibold">{totalRecordsCount} records</span>
              </div>
            </div>
          )}

          {/* Python Modal launcher button */}
          <button
            onClick={onOpenPythonModal}
            className={`w-full flex items-center gap-2 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-xs dark:shadow-none ${
              isCollapsed ? 'justify-center px-0' : 'px-2.5'
            }`}
            title="View Python scripts, requirements.txt, and setup scripts"
          >
            <Terminal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Python Code & Tests</span>}
          </button>

          {/* Side Menu Theme Toggle Option */}
          <div className="pt-1">
            <ThemeToggle className="w-full justify-center" />
          </div>

          {/* Desktop Collapse / Expand toggle button */}
          <div className="hidden lg:flex items-center justify-end pt-1">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 text-xs transition-colors cursor-pointer flex items-center gap-1.5 w-full justify-center"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Collapse Menu</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
