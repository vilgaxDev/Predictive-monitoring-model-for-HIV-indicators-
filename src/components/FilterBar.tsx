import React from 'react';
import { Search, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { KENYAN_COUNTIES, REPORTING_PERIODS } from '../data/kenyanData';
import { RiskLevel, UserRole } from '../types/health';

interface FilterBarProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedCounty: string;
  onCountyChange: (county: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedRisk: 'ALL' | RiskLevel;
  onRiskChange: (risk: 'ALL' | RiskLevel) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenThresholdModal: () => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedRole,
  onRoleChange,
  selectedCounty,
  onCountyChange,
  selectedPeriod,
  onPeriodChange,
  selectedRisk,
  onRiskChange,
  searchQuery,
  onSearchChange,
  onOpenThresholdModal,
  totalFilteredCount,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Side: Role and Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 shadow-xs dark:shadow-none">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">Role:</span>
            <select
              value={selectedRole}
              aria-label="Active Role"
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="MOH_POLICY_MAKER" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">MOH National Policy Maker</option>
              <option value="COUNTY_HEALTH_DIRECTOR" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">County Health Director</option>
              <option value="FACILITY_CLINICIAN" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Facility Midwife / Clinician</option>
              <option value="RESEARCHER_EPIDEMIOLOGIST" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Epidemiologist / Auditor</option>
            </select>
          </div>

          {/* County Filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 shadow-xs dark:shadow-none">
            <span className="text-slate-500 dark:text-slate-400">County:</span>
            <select
              value={selectedCounty}
              aria-label="Filter by County"
              onChange={(e) => onCountyChange(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">All 10 Counties</option>
              {KENYAN_COUNTIES.map((c) => (
                <option key={c.county} value={c.county} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {c.county}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 shadow-xs dark:shadow-none">
            <span className="text-slate-500 dark:text-slate-400">Period:</span>
            <select
              value={selectedPeriod}
              aria-label="Filter by Reporting Period"
              onChange={(e) => onPeriodChange(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">All Periods</option>
              {REPORTING_PERIODS.map((p) => (
                <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Segmented Selector */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-0.5">
            {(['ALL', 'HIGH', 'MODERATE', 'LOW'] as const).map((r) => (
              <button
                key={r}
                onClick={() => onRiskChange(r)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedRisk === r
                    ? r === 'HIGH'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold shadow-xs'
                      : r === 'MODERATE'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold shadow-xs'
                      : r === 'LOW'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All Risk' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Search and Threshold Configuration */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Pseudonym (e.g. KEN-MOM-1025)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 w-64 shadow-xs dark:shadow-none"
            />
          </div>

          <button
            onClick={onOpenThresholdModal}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-xs dark:shadow-none"
            title="Configure clinical thresholds and model cutoffs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Thresholds</span>
          </button>

          <span className="text-slate-500 font-mono tabular-nums whitespace-nowrap">
            {totalFilteredCount.toLocaleString()} records active
          </span>
        </div>
      </div>
    </div>
  );
};
