import React from 'react';
import { Menu, Download, ChevronRight, Terminal } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface TopHeaderProps {
  activeTabTitle: string;
  onMobileMenuToggle: () => void;
  onOpenPythonModal: () => void;
  onExportReport: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTabTitle,
  onMobileMenuToggle,
  onOpenPythonModal,
  onExportReport,
}) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/90 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
      {/* Zone 1: Mobile Hamburger & Contextual Breadcrumbs */}
      <div className="flex items-center gap-3 truncate">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          <span className="text-slate-700 dark:text-slate-300 hidden sm:inline whitespace-nowrap">Republic of Kenya MOH</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 hidden sm:inline shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 hidden md:inline whitespace-nowrap">MNH Surveillance</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 hidden md:inline shrink-0" />
          <span className="text-teal-600 dark:text-teal-400 font-semibold truncate whitespace-nowrap">
            {activeTabTitle}
          </span>
        </nav>
      </div>

      {/* Zone 2: Primary Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <ThemeToggle />

        <button
          onClick={onOpenPythonModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700/80 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm dark:shadow-none"
          title="Inspect and copy Python, Streamlit, and XGBoost modules"
        >
          <Terminal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Python & Tests</span>
        </button>

        <button
          onClick={onExportReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white dark:text-slate-950 bg-teal-600 hover:bg-teal-700 dark:bg-teal-400 dark:hover:bg-teal-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export MOH Report</span>
        </button>
      </div>
    </header>
  );
};
