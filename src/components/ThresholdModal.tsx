import React from 'react';
import { ModelThresholdConfig, DEFAULT_THRESHOLDS } from '../utils/mlEngine';
import { X, RotateCcw, Check, SlidersHorizontal } from 'lucide-react';

interface ThresholdModalProps {
  isOpen: boolean;
  thresholds: ModelThresholdConfig;
  onUpdateThresholds: (thresholds: ModelThresholdConfig) => void;
  onClose: () => void;
}

export const ThresholdModal: React.FC<ThresholdModalProps> = ({
  isOpen,
  thresholds,
  onUpdateThresholds,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Configure Clinical Risk Thresholds</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          <p className="text-slate-400">
            Tuning thresholds dynamically recalculates risk classifications across all monitored patient cohorts.
          </p>

          {/* Systolic */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-200">Systolic Blood Pressure High Risk</span>
              <span className="font-mono text-teal-400 font-bold">{thresholds.systolicHighRisk} mmHg</span>
            </div>
            <input
              type="range"
              min="130"
              max="165"
              step="5"
              value={thresholds.systolicHighRisk}
              onChange={(e) =>
                onUpdateThresholds({ ...thresholds, systolicHighRisk: Number(e.target.value) })
              }
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Diastolic */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-200">Diastolic Blood Pressure High Risk</span>
              <span className="font-mono text-teal-400 font-bold">{thresholds.diastolicHighRisk} mmHg</span>
            </div>
            <input
              type="range"
              min="80"
              max="115"
              step="5"
              value={thresholds.diastolicHighRisk}
              onChange={(e) =>
                onUpdateThresholds({ ...thresholds, diastolicHighRisk: Number(e.target.value) })
              }
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Severe Anaemia */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-200">Severe Anaemia Cutoff</span>
              <span className="font-mono text-teal-400 font-bold">{thresholds.haemoglobinSevereRisk.toFixed(1)} g/dL</span>
            </div>
            <input
              type="range"
              min="6.0"
              max="8.5"
              step="0.5"
              value={thresholds.haemoglobinSevereRisk}
              onChange={(e) =>
                onUpdateThresholds({ ...thresholds, haemoglobinSevereRisk: Number(e.target.value) })
              }
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Minimum ANC Visits */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-200">Minimum Adequate ANC Visits</span>
              <span className="font-mono text-teal-400 font-bold">{thresholds.minAdequateAncVisits} Visits</span>
            </div>
            <input
              type="range"
              min="3"
              max="8"
              step="1"
              value={thresholds.minAdequateAncVisits}
              onChange={(e) =>
                onUpdateThresholds({ ...thresholds, minAdequateAncVisits: Number(e.target.value) })
              }
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          {/* High Risk Score Cutoff */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-200">High Risk Classification Cutoff</span>
              <span className="font-mono text-rose-400 font-bold">Score $\ge$ {thresholds.highRiskScoreCutoff}</span>
            </div>
            <input
              type="range"
              min="50"
              max="80"
              step="5"
              value={thresholds.highRiskScoreCutoff}
              onChange={(e) =>
                onUpdateThresholds({ ...thresholds, highRiskScoreCutoff: Number(e.target.value) })
              }
              className="w-full accent-rose-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs">
          <button
            onClick={() => onUpdateThresholds(DEFAULT_THRESHOLDS)}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
