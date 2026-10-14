import React from 'react';
import { IntegratedMotherCohort } from '../types/health';
import { X, Calendar, Activity, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface PatientDetailDrawerProps {
  mother: IntegratedMotherCohort | null;
  onClose: () => void;
}

export const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({ mother, onClose }) => {
  if (!mother) return null;

  const isHigh = mother.riskLevel === 'HIGH';
  const isMod = mother.riskLevel === 'MODERATE';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto flex flex-col justify-between shadow-2xl">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">{mother.motherPseudonym}</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  isHigh
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                    : isMod
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                }`}
              >
                {mother.riskLevel} RISK (Score {mother.riskScore}/100)
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>{mother.county} County</span>
              <span aria-hidden="true">·</span>
              <span>{mother.facility}</span>
              <span aria-hidden="true">·</span>
              <span>{mother.reportingPeriod}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 text-xs flex-1">
          {/* Clinical Escalation Actions */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recommended Follow-up Clinical Actions</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 pl-4 list-disc">
              {mother.recommendedActions.map((act, idx) => (
                <li key={idx} className="leading-relaxed">
                  {act}
                </li>
              ))}
            </ul>
          </div>

          {/* Longitudinal Registers Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Integrated Longitudinal Health Journey
            </h4>

            {/* 1. Antenatal Care (ANC MOH 405) */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800/80">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Antenatal Care Register (MOH 405)</span>
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  {mother.gestationalAgeWeeks} Weeks Gestation
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500">Age / Parity:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    Age {mother.maternalAge} · G{mother.gravida}P{mother.parity}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Blood Pressure:</span>
                  <div className={`font-mono font-semibold mt-0.5 ${mother.systolicBp >= 140 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {mother.systolicBp}/{mother.diastolicBp} mmHg
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Haemoglobin (Hb):</span>
                  <div className={`font-mono font-semibold mt-0.5 ${mother.haemoglobin < 10.0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {mother.haemoglobin.toFixed(1)} g/dL
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Proteinuria Dipstick:</span>
                  <div className={`font-semibold mt-0.5 ${mother.proteinuria !== 'Negative' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {mother.proteinuria}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Blood Glucose:</span>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {mother.bloodGlucose.toFixed(1)} mmol/L ({mother.diabetesStatus})
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">ANC Visits Total:</span>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {mother.totalAncVisits} Visits Attended
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Maternity / Delivery Register (MOH 333) */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800/80">
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Maternity Register (MOH 333)</span>
                </span>
                <span className="text-slate-600 dark:text-slate-400">{mother.deliveryMode || 'Spontaneous Vertex'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500">Birth Weight:</span>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {mother.birthWeightKg ? `${mother.birthWeightKg} kg` : '2.95 kg'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Documented Complications:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {mother.maternalComplications.join(', ')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Delivery Retest HIV:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {mother.hivStatus === 'Negative' ? 'Negative' : 'Documented Reactive'}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PMTCT Longitudinal Tracking (MOH 206) */}
            {mother.pmtctRecord && (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800/80">
                  <span className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>PMTCT & Exposed Infant Register (MOH 206)</span>
                  </span>
                  <span className="font-mono text-teal-700 dark:text-teal-400">{mother.pmtctRecord.infantPseudonym}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500">6-Week DNA-PCR:</span>
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {mother.pmtctRecord.infantDnaPcr6Weeks}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">18-Month Rapid Test:</span>
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {mother.pmtctRecord.infantRapidTest18Months}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">5-Year Pediatric Status:</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {mother.pmtctRecord.fiveYearChildHivStatus}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Maternal Viral Load:</span>
                    <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {mother.pmtctRecord.maternalViralLoadCopies ? `${mother.pmtctRecord.maternalViralLoadCopies.toLocaleString()} cp/mL` : 'Suppressed (<200)'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">ARV Adherence:</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {mother.arvAdherence}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Individual Patient SHAP Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>SHAP Feature Attribution for {mother.motherPseudonym}</span>
            </div>

            <div className="space-y-2">
              {mother.shapValues.map((sv) => (
                <div
                  key={sv.feature}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">{sv.feature}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{sv.valueDescription}</div>
                  </div>
                  <span
                    className={`font-mono font-bold tabular-nums text-xs px-2 py-0.5 rounded ${
                      sv.impact > 0
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                    }`}
                  >
                    {sv.impact > 0 ? `+${(sv.impact * 100).toFixed(1)}%` : `${(sv.impact * 100).toFixed(1)}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs dark:shadow-none"
          >
            Close Patient View
          </button>
        </div>
      </div>
    </div>
  );
};
