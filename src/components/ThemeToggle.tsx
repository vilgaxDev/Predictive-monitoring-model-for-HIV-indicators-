import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-1.5 rounded-md border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-700/80 text-amber-300 hover:bg-slate-800 hover:text-amber-200'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle between dark and light mode"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden xl:inline text-[11px] text-slate-300">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-slate-700" />
          <span className="hidden xl:inline text-[11px] text-slate-700">Dark</span>
        </>
      )}
    </button>
  );
};
