import React from 'react';
import { IntegratedMotherCohort } from '../types/health';
import { HeartPulse, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { formatSuppressedCount } from '../utils/mlEngine';

interface HivIncidenceDashboardProps {
  cohorts: IntegratedMotherCohort[];
  onSelectMother: (mother: IntegratedMotherCohort) => void;
}

export const HivIncidenceDashboard: React.FC<HivIncidenceDashboardProps> = ({
  cohorts,
  onSelectMother,
}) => {
  // Baseline HIV-Negative Mothers
  const baselineNegativeMothers = cohorts.filter(
    (m) => m.hivStatus === 'Negative' || m.hasSeroconverted
  );
  const totalDenominator = baselineNegativeMothers.length;

  // Confirmed Seroconversions
  const confirmedSeroconverters = cohorts.filter((m) => m.isConfirmedSeroconversion);
  // Suspected / Incomplete / Discordant
  const suspectedSeroconverters = cohorts.filter(
    (m) => m.hasSeroconverted && !m.isConfirmedSeroconversion
  );

  const confirmedCount = confirmedSeroconverters.length;
  const suspectedCount = suspectedSeroconverters.length;

  const incidenceRatePer1000 = totalDenominator > 0
    ? ((confirmedCount / totalDenominator) * 1000).toFixed(2)
    : '0.00';

  // Detection period breakdown
  const detectionPeriods: { [key: string]: number } = {
    'ANC Retest (3rd Trimester)': 0,
    'Maternity Labour Retest': 0,
    'PNC 6-Week Retest': 0,
  };

  cohorts.forEach((m) => {
    if (m.pmtctRecord?.seroconversionDetectionPeriod) {
      const period = m.pmtctRecord.seroconversionDetectionPeriod;
      if (detectionPeriods[period] !== undefined) {
        detectionPeriods[period]++;
      }
    }
  });

  // County breakdown
  const countyData: { [county: string]: { eligible: number; confirmed: number; suspected: number } } = {};
  cohorts.forEach((m) => {
    if (!countyData[m.county]) {
      countyData[m.county] = { eligible: 0, confirmed: 0, suspected: 0 };
    }
    if (m.hivStatus === 'Negative' || m.hasSeroconverted) {
      countyData[m.county].eligible++;
    }
    if (m.isConfirmedSeroconversion) {
      countyData[m.county].confirmed++;
    } else if (m.hasSeroconverted && !m.isConfirmedSeroconversion) {
      countyData[m.county].suspected++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs dark:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Maternal HIV Seroconversion Surveillance</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Monitors incident HIV infections occurring during pregnancy and breastfeeding among mothers who initially tested HIV-negative at ANC booking.
            Distinguishes confirmed cases with verified sequence of negative baseline and confirmatory repeat tests from discordant rapid tests awaiting ELISA/PCR.
          </p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded text-xs text-slate-700 dark:text-slate-300 font-mono tabular-nums shrink-0">
          Denominator: Eligible Baseline Negatives ({totalDenominator.toLocaleString()})
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Eligible Denominator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400">Baseline Negative Denominator</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
            {totalDenominator.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Documented HIV-negative test at ANC booking</p>
        </div>

        {/* KPI 2: Confirmed Seroconversions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400">Confirmed Seroconversions</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums mt-2">
            {formatSuppressedCount(confirmedCount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Verified reactive repeat + confirmatory test</p>
        </div>

        {/* KPI 3: Suspected / Discordant */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400">Suspected / Discordant Tests</div>
          <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300 tabular-nums mt-2">
            {formatSuppressedCount(suspectedCount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Single reactive test; awaiting tie-breaker algorithm</p>
        </div>

        {/* KPI 4: Population Incidence Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400">Incidence Rate</div>
          <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums mt-2">
            {incidenceRatePer1000}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ 1,000 pregnant women</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Calculated only across verified follow-up cohorts</p>
        </div>
      </div>

      {/* Detection Timing & Clinical Urgency Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timing Window Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
            Seroconversion Detection Windows (Kenya Retesting Schedule)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4">
            Under Kenya PMTCT guidelines, re-testing is mandatory at 3rd trimester (32-36 wks), labour & delivery, and 6 weeks postnatal.
          </p>

          <div className="space-y-3 text-xs">
            {Object.entries(detectionPeriods).map(([period, count]) => {
              const totalSeros = confirmedCount + suspectedCount || 1;
              const pct = ((count / totalSeros) * 100).toFixed(1);
              return (
                <div key={period} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{period}</span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {formatSuppressedCount(count)} cases ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 dark:bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(3, Number(pct)))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Rationale & Prevention Protocol */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between shadow-xs dark:shadow-none">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Clinical Risk Note: Incident vs Chronic HIV</h3>
            </div>
            <div className="mt-3 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>High Transmission Window:</strong> Primary acute HIV infection during pregnancy is associated with high plasma and genital viral loads (often &gt;100,000 copies/mL) before maternal antibodies develop.
              </p>
              <p>
                <strong>Transmission Risk:</strong> Vertical transmission risk during acute maternal infection exceeds 20-30% without immediate intervention, compared to &lt;2% for a mother established on ART with suppressed viral load.
              </p>
              <p>
                <strong>Kenya Action Protocol:</strong> Immediate initiation of Dolutegravir-based ART (TLD), viral load testing, enhanced partner testing/Prep counseling, and enhanced dual ARV prophylaxis (NVP + AZT) for the infant for 12 weeks.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-teal-700 dark:text-teal-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All identified cases are automatically escalated in the High-Risk Register.</span>
          </div>
        </div>
      </div>

      {/* County Seroconversion Table with Small-Cell Suppression */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
          County-Level Maternal Seroconversion Distribution
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4">
          Cell counts less than 5 are suppressed (&lt;5) per the Kenya Data Protection Act 2019 to prevent patient re-identification.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-3 font-medium">County</th>
                <th className="py-2.5 px-3 font-medium">Eligible Baseline Negatives</th>
                <th className="py-2.5 px-3 font-medium">Confirmed Incident Cases</th>
                <th className="py-2.5 px-3 font-medium">Suspected / Discordant</th>
                <th className="py-2.5 px-3 font-medium">Estimated Incidence Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {Object.entries(countyData).map(([cName, stats]) => {
                const rate = stats.eligible > 0 ? ((stats.confirmed / stats.eligible) * 1000).toFixed(1) : '0.0';
                return (
                  <tr key={cName} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{cName}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums">{stats.eligible.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-amber-600 dark:text-amber-400 font-semibold">
                      {formatSuppressedCount(stats.confirmed)}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {formatSuppressedCount(stats.suspected)}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-teal-700 dark:text-teal-400 font-medium">
                      {stats.confirmed >= 5 ? `${rate} / 1,000` : 'Suppressed'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
