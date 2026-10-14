import React from 'react';
import { IntegratedMotherCohort } from '../types/health';
import { UserCheck } from 'lucide-react';
import { formatSuppressedCount } from '../utils/mlEngine';

interface PmtctOutcomesDashboardProps {
  cohorts: IntegratedMotherCohort[];
  onSelectMother: (mother: IntegratedMotherCohort) => void;
}

export const PmtctOutcomesDashboard: React.FC<PmtctOutcomesDashboardProps> = ({
  cohorts,
  onSelectMother,
}) => {
  // Filter HIV-exposed mother-infant pairs
  const exposedPairs = cohorts.filter((m) => m.pmtctRecord);
  const totalExposed = exposedPairs.length;

  // 6-week PCR
  const pcr6wDone = exposedPairs.filter(
    (m) => m.pmtctRecord?.infantDnaPcr6Weeks !== 'Pending / Missed'
  );
  const pcr6wNeg = exposedPairs.filter(
    (m) => m.pmtctRecord?.infantDnaPcr6Weeks === 'Negative'
  );

  // 18-month Final Diagnosis
  const rapid18mDone = exposedPairs.filter(
    (m) => m.pmtctRecord?.infantRapidTest18Months !== 'Pending / Missed'
  );
  const rapid18mNeg = exposedPairs.filter(
    (m) => m.pmtctRecord?.infantRapidTest18Months === 'Negative'
  );

  // 5-Year Longitudinal Outcomes (Distinct Categories)
  const fiveYearConfirmedNeg = exposedPairs.filter(
    (m) => m.fiveYearOutcome === 'Confirmed HIV-Negative & Survived'
  );
  const fiveYearTransmission = exposedPairs.filter(
    (m) => m.fiveYearOutcome === 'Pediatric HIV Transmission'
  );
  const fiveYearLtfu = exposedPairs.filter(
    (m) => m.fiveYearOutcome === 'Lost to Follow-up'
  );
  const fiveYearChildDeceased = exposedPairs.filter(
    (m) => m.fiveYearOutcome === 'Child Deceased'
  );
  const fiveYearInProgress = exposedPairs.filter(
    (m) => m.fiveYearOutcome === 'In-Progress Cohort'
  );

  // Completed cohorts denominator (excluding active in-progress)
  const completed5YrCohort = totalExposed - fiveYearInProgress.length;
  const fiveYearSuccessRate = completed5YrCohort > 0
    ? ((fiveYearConfirmedNeg.length / completed5YrCohort) * 100).toFixed(1)
    : '0.0';

  // Maternal viral suppression among HIV-positive cohort
  const suppressedMothers = exposedPairs.filter(
    (m) => m.viralSuppression === 'Suppressed (<200)'
  );
  const lowViremiaMothers = exposedPairs.filter(
    (m) => m.viralSuppression === 'Low Viremia (200-999)'
  );
  const unsuppressedMothers = exposedPairs.filter(
    (m) => m.viralSuppression === 'Unsuppressed (>=1000)'
  );

  const suppressionRate = totalExposed > 0
    ? ((suppressedMothers.length / totalExposed) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs dark:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">PMTCT Success & 5-Year Pediatric Cascade Monitoring</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Tracks HIV-exposed infant cohorts from birth DNA-PCR to 5-year child survival and definitive HIV-free status.
            In strict compliance with clinical reporting guidelines, <strong>Lost to Follow-up (LTFU)</strong> and <strong>Incomplete Testing</strong> are tracked separately from confirmed survival and confirmed negative status.
          </p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded text-xs text-slate-700 dark:text-slate-300 font-mono tabular-nums shrink-0">
          Cohort: {totalExposed.toLocaleString()} HIV-Exposed Infant Pairs
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400">Confirmed HIV-Negative & Survived 5 Yrs</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-2">
            {formatSuppressedCount(fiveYearConfirmedNeg.length)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {fiveYearSuccessRate}% of mature 5-year cohort
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400">Pediatric HIV Transmission Rate</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums mt-2">
            {completed5YrCohort > 0 ? ((fiveYearTransmission.length / completed5YrCohort) * 100).toFixed(1) : '0'}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {formatSuppressedCount(fiveYearTransmission.length)} pediatric infections identified
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400">5-Year Lost to Follow-Up (LTFU)</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums mt-2">
            {formatSuppressedCount(fiveYearLtfu.length)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {completed5YrCohort > 0 ? ((fiveYearLtfu.length / completed5YrCohort) * 100).toFixed(1) : '0'}% attrition rate (defaulter tracing active)
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400">Maternal Viral Suppression (&lt;200)</div>
          <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums mt-2">
            {suppressionRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {suppressedMothers.length} mothers with viral load &lt; 200 copies
          </p>
        </div>
      </div>

      {/* 5-Year Cascade Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cascade Milestone Progression */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
            Longitudinal Testing Cascade Milestones (MOH 206)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4">
            Retention and HIV testing progression from 6 weeks through 5 years.
          </p>

          <div className="space-y-4 text-xs">
            {/* Step 1: 6-Week DNA-PCR */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">1. 6-Week Infant DNA-PCR Completion</span>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {pcr6wDone.length} / {totalExposed} ({((pcr6wDone.length / totalExposed) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div
                  className="bg-teal-500 h-2 rounded-full"
                  style={{ width: `${(pcr6wDone.length / totalExposed) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Negative: {pcr6wNeg.length}</span>
                <span>Missed / Pending: {totalExposed - pcr6wDone.length}</span>
              </div>
            </div>

            {/* Step 2: 18-Month Final Rapid Test */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">2. 18-Month Final Infant Diagnosis</span>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {rapid18mDone.length} / {totalExposed} ({((rapid18mDone.length / totalExposed) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div
                  className="bg-teal-500 h-2 rounded-full"
                  style={{ width: `${(rapid18mDone.length / totalExposed) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Negative: {rapid18mNeg.length}</span>
                <span>Transmission detected: {rapid18mDone.length - rapid18mNeg.length}</span>
              </div>
            </div>

            {/* Step 3: 5-Year Definitive Outcome */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">3. 5-Year Cohort Final Status</span>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {fiveYearConfirmedNeg.length} HIV-Free Survival
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${fiveYearSuccessRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Confirmed Neg: {fiveYearConfirmedNeg.length}</span>
                <span>LTFU: {fiveYearLtfu.length} · Deaths: {fiveYearChildDeceased.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Year Detailed Outcome Stratification */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between shadow-xs dark:shadow-none">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              5-Year Pediatric Cohort Stratification
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4">
              Definitive classification verifying patient safety and data integrity.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Confirmed HIV-Negative & Survived to 5 Yrs</span>
                </div>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatSuppressedCount(fiveYearConfirmedNeg.length)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Pediatric HIV Transmission (Confirmed)</span>
                </div>
                <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatSuppressedCount(fiveYearTransmission.length)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Lost to Follow-up (LTFU)</span>
                </div>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                  {formatSuppressedCount(fiveYearLtfu.length)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Child Mortality Documented</span>
                </div>
                <span className="font-mono font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                  {formatSuppressedCount(fiveYearChildDeceased.length)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Cohort Still Active / In-Progress</span>
                </div>
                <span className="font-mono font-semibold text-teal-700 dark:text-teal-300 tabular-nums">
                  {fiveYearInProgress.length.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            Kenya National AIDS and STI Control Programme (NASCOP) guidelines require rigorous defaulter tracking prior to reclassifying LTFU.
          </div>
        </div>
      </div>
    </div>
  );
};
