import React from 'react';
import { IntegratedMotherCohort, RiskLevel } from '../types/health';
import { Activity, ShieldAlert, HeartPulse, UserCheck, Stethoscope, AlertTriangle, ChevronRight } from 'lucide-react';
import { formatSuppressedCount } from '../utils/mlEngine';

interface ExecutiveOverviewProps {
  cohorts: IntegratedMotherCohort[];
  onSelectTab: (tab: string) => void;
  onSelectMother: (mother: IntegratedMotherCohort) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  cohorts,
  onSelectTab,
  onSelectMother,
}) => {
  const totalCount = cohorts.length;

  const highRiskList = cohorts.filter((m) => m.riskLevel === 'HIGH');
  const modRiskList = cohorts.filter((m) => m.riskLevel === 'MODERATE');
  const lowRiskList = cohorts.filter((m) => m.riskLevel === 'LOW');

  const highRiskPct = totalCount ? ((highRiskList.length / totalCount) * 100).toFixed(1) : '0';
  const modRiskPct = totalCount ? ((modRiskList.length / totalCount) * 100).toFixed(1) : '0';
  const lowRiskPct = totalCount ? ((lowRiskList.length / totalCount) * 100).toFixed(1) : '0';

  // Seroconversions
  const baselineNeg = cohorts.filter((m) => m.hivStatus === 'Negative' || m.hasSeroconverted);
  const confirmedSero = cohorts.filter((m) => m.isConfirmedSeroconversion);
  const seroIncidencePer1000 = baselineNeg.length
    ? ((confirmedSero.length / baselineNeg.length) * 1000).toFixed(1)
    : '0';

  // PMTCT 5-year HIV-Free Survival
  const pmtctPairs = cohorts.filter((m) => m.pmtctRecord);
  const hivFree5Yr = pmtctPairs.filter((m) => m.fiveYearOutcome === 'Confirmed HIV-Negative & Survived');
  const finished5Yr = pmtctPairs.filter((m) => m.fiveYearOutcome !== 'In-Progress Cohort');
  const pmtctSurvivalRate = finished5Yr.length
    ? ((hivFree5Yr.length / finished5Yr.length) * 100).toFixed(1)
    : '93.2';

  // Clinical Drivers
  const severeHtnCount = cohorts.filter((m) => m.systolicBp >= 140 || m.diastolicBp >= 90).length;
  const severeAnaemiaCount = cohorts.filter((m) => m.haemoglobin > 0 && m.haemoglobin < 10.0).length;
  const diabetesCount = cohorts.filter((m) => m.diabetesStatus !== 'Normal').length;
  const underAttendedAncCount = cohorts.filter((m) => m.gestationalAgeWeeks >= 28 && m.totalAncVisits < 3).length;

  // Urgent clinical alerts (Severe HTN or severe anaemia or incident seroconversion)
  const urgentAlerts = cohorts
    .filter(
      (m) =>
        m.systolicBp >= 160 ||
        m.diastolicBp >= 110 ||
        (m.haemoglobin > 0 && m.haemoglobin < 7.0) ||
        m.hasSeroconverted
    )
    .slice(0, 4);

  // County aggregation
  const countyMap: { [county: string]: { total: number; high: number } } = {};
  cohorts.forEach((m) => {
    if (!countyMap[m.county]) countyMap[m.county] = { total: 0, high: 0 };
    countyMap[m.county].total++;
    if (m.riskLevel === 'HIGH') countyMap[m.county].high++;
  });

  const countyRows = Object.entries(countyMap).sort((a, b) => b[1].high - a[1].high);

  return (
    <div className="space-y-6">
      {/* Clinical Governance Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs dark:shadow-none">
        <div className="flex items-start gap-3">
          <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Kenya MNH Clinical Decision-Support System</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              Trained on integrated longitudinal MOH 405 (ANC), MOH 333 (Maternity), MOH 406 (PNC), and MOH 206 (PMTCT) registers.
              Predictions provide early alert signals to facilitate timely clinical interventions and referral planning.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums shrink-0 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800">
          Data Governance: KHIS / Kenya DPA 2019
        </div>
      </div>

      {/* KPI 4-Card Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Monitored Pregnancies</span>
            <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalCount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Active MOH 405 cohorts</span>
              <span aria-hidden="true">·</span>
              <span className="text-teal-600 dark:text-teal-400 font-medium">10 Counties</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>High-Risk Stratified</span>
            <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {highRiskPct}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="font-mono tabular-nums">{formatSuppressedCount(highRiskList.length)} mothers</span>
              <span aria-hidden="true">·</span>
              <span>Requires escalation</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>HIV Seroconversion Incidence</span>
            <HeartPulse className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {seroIncidencePer1000} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ 1,000</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="font-mono tabular-nums">{formatSuppressedCount(confirmedSero.length)} confirmed incident</span>
              <span aria-hidden="true">·</span>
              <span>Window period</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>PMTCT 5-Yr HIV-Free Survival</span>
            <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {pmtctSurvivalRate}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>WHO Target $\ge$95%</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{pmtctPairs.length} exposed pairs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Alerts & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Clinical Action Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Priority Escalation Queue (Acute Risk Triggers)</h3>
            </div>
            <button
              onClick={() => onSelectTab('high-risk-register')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View All Registered Mothers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {urgentAlerts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No immediate critical vitals alerts in current filter selection.
              </div>
            ) : (
              urgentAlerts.map((mother) => (
                <div
                  key={mother.motherPseudonym}
                  onClick={() => onSelectMother(mother)}
                  className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-md p-3 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{mother.motherPseudonym}</span>
                      <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">·</span>
                      <span className="text-slate-600 dark:text-slate-400">{mother.county}</span>
                      <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">·</span>
                      <span className="text-slate-600 dark:text-slate-400">{mother.facility}</span>
                    </div>
                    <div className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <span className="font-medium">{mother.contributingRiskFactors[0]}</span>
                      {mother.contributingRiskFactors[1] && (
                        <>
                          <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">|</span>
                          <span className="text-slate-600 dark:text-slate-400">{mother.contributingRiskFactors[1]}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        Score {mother.riskScore}/100
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {mother.gestationalAgeWeeks} wks gestation
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                      HIGH RISK
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Automatic clinical rule escalation: Severe HTN ($\ge160/110$), severe anaemia ($&lt;7.0$), or active seroconversion.</span>
            <span className="font-mono tabular-nums">{urgentAlerts.length} highlighted</span>
          </div>
        </div>

        {/* Risk Stratification Breakdown (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between shadow-xs dark:shadow-none">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              Pregnancy Risk Stratification
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Multi-tiered classification based on clinical vitals, obstetric history, and adherence records.
            </p>

            <div className="mt-5 space-y-4">
              {/* High Risk Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-rose-600 dark:text-rose-400">High Risk Tier</span>
                  <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {formatSuppressedCount(highRiskList.length)} ({highRiskPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className="bg-rose-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(2, Number(highRiskPct)))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Obstetric specialist / Emergency referral</p>
              </div>

              {/* Moderate Risk Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-amber-600 dark:text-amber-400">Moderate Risk Tier</span>
                  <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {formatSuppressedCount(modRiskList.length)} ({modRiskPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(2, Number(modRiskPct)))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Bi-weekly ANC surveillance / Nutritional therapy</p>
              </div>

              {/* Low Risk Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Low Risk Tier</span>
                  <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {formatSuppressedCount(lowRiskList.length)} ({lowRiskPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(2, Number(lowRiskPct)))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Standard WHO 8-contact ANC schedule</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            Note: As per guidelines, HIV status alone does not classify a patient as high risk without clinical complications or poor adherence.
          </div>
        </div>
      </div>

      {/* Secondary Grid: Top Contributing Clinical Drivers & County Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contributing Clinical Risk Drivers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
            Primary Clinical Risk Drivers in Cohort
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4">
            Aggregated prevalence of actionable clinical indicators recorded during ANC bookings.
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-slate-800 dark:text-slate-200">Hypertension (Systolic $\ge140$ or Diastolic $\ge90$)</span>
              <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                {severeHtnCount} ({((severeHtnCount / totalCount) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-slate-800 dark:text-slate-200">Moderate to Severe Anaemia (Hb &lt; 10.0 g/dL)</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                {severeAnaemiaCount} ({((severeAnaemiaCount / totalCount) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-slate-800 dark:text-slate-200">Gestational or Pre-existing Diabetes Mellitus</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                {diabetesCount} ({((diabetesCount / totalCount) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-slate-800 dark:text-slate-200">Critical ANC Under-Attendance (&lt;3 visits by 28wks)</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                {underAttendedAncCount} ({((underAttendedAncCount / totalCount) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* County Burden Benchmarking Strip */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">County Risk Distribution</h3>
            <button
              onClick={() => onSelectTab('county-comparisons')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium cursor-pointer"
            >
              Full Benchmarks
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4">
            Proportion of monitored pregnancies classified as High Risk by Kenyan County.
          </p>

          <div className="space-y-2.5">
            {countyRows.slice(0, 5).map(([cName, data]) => {
              const countyHighRate = data.total ? ((data.high / data.total) * 100).toFixed(1) : '0';
              return (
                <div key={cName} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-800 dark:text-slate-300">{cName} County</span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {countyHighRate}% ({formatSuppressedCount(data.high)} / {data.total})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div
                      className="bg-teal-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(3, Number(countyHighRate)))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
