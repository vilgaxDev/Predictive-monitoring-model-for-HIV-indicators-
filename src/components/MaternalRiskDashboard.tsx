import React, { useState } from 'react';
import { IntegratedMotherCohort, RiskLevel } from '../types/health';
import { ModelThresholdConfig } from '../utils/mlEngine';
import { Sliders, ShieldCheck, HeartPulse, CheckCircle2, AlertOctagon } from 'lucide-react';

interface MaternalRiskDashboardProps {
  cohorts: IntegratedMotherCohort[];
  thresholds: ModelThresholdConfig;
  onUpdateThresholds: (newThresholds: ModelThresholdConfig) => void;
  onSelectMother: (mother: IntegratedMotherCohort) => void;
}

export const MaternalRiskDashboard: React.FC<MaternalRiskDashboardProps> = ({
  cohorts,
  thresholds,
  onUpdateThresholds,
  onSelectMother,
}) => {
  const [activeTab, setActiveTab] = useState<'stratification' | 'thresholds' | 'guidelines'>('stratification');

  const total = cohorts.length;
  const highRisk = cohorts.filter((m) => m.riskLevel === 'HIGH');
  const modRisk = cohorts.filter((m) => m.riskLevel === 'MODERATE');
  const lowRisk = cohorts.filter((m) => m.riskLevel === 'LOW');

  // Distribution buckets (0-20, 21-40, 41-60, 61-80, 81-100)
  const buckets = [
    { label: '0 - 20 (Minimal)', range: [0, 20], color: 'bg-emerald-500' },
    { label: '21 - 40 (Low)', range: [21, 40], color: 'bg-emerald-400' },
    { label: '41 - 60 (Moderate)', range: [41, 60], color: 'bg-amber-500' },
    { label: '61 - 80 (Elevated)', range: [61, 80], color: 'bg-rose-400' },
    { label: '81 - 100 (Critical)', range: [81, 100], color: 'bg-rose-600' },
  ].map((b) => {
    const count = cohorts.filter((m) => m.riskScore >= b.range[0] && m.riskScore <= b.range[1]).length;
    return { ...b, count, pct: total ? ((count / total) * 100).toFixed(1) : '0' };
  });

  // Gestational age group risk correlation
  const trimesters = [
    {
      label: '1st & Early 2nd Trimester (<20 wks)',
      filter: (m: IntegratedMotherCohort) => m.gestationalAgeWeeks < 20,
    },
    {
      label: 'Late 2nd Trimester (20 - 27 wks)',
      filter: (m: IntegratedMotherCohort) => m.gestationalAgeWeeks >= 20 && m.gestationalAgeWeeks < 28,
    },
    {
      label: 'Early 3rd Trimester (28 - 35 wks)',
      filter: (m: IntegratedMotherCohort) => m.gestationalAgeWeeks >= 28 && m.gestationalAgeWeeks < 36,
    },
    {
      label: 'Term / Late Gestation (36+ wks)',
      filter: (m: IntegratedMotherCohort) => m.gestationalAgeWeeks >= 36,
    },
  ].map((t) => {
    const list = cohorts.filter(t.filter);
    const high = list.filter((m) => m.riskLevel === 'HIGH').length;
    return {
      label: t.label,
      total: list.length,
      high,
      highRate: list.length ? ((high / list.length) * 100).toFixed(1) : '0',
    };
  });

  return (
    <div className="space-y-6">
      {/* Navigation sub-tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Maternal Pregnancy Risk Classification</h2>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveTab('stratification')}
            className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'stratification'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Risk Stratification
          </button>
          <button
            onClick={() => setActiveTab('thresholds')}
            className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'thresholds'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Clinical Threshold Tuning
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'guidelines'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Kenya MOH Clinical Protocols
          </button>
        </div>
      </div>

      {/* Primary Content by Tab */}
      {activeTab === 'stratification' && (
        <div className="space-y-6">
          {/* Risk Level Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* High Risk Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">HIGH RISK PREGNANCIES</span>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  Score $\ge$ {thresholds.highRiskScoreCutoff}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {highRisk.length.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({((highRisk.length / total) * 100).toFixed(1)}%)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Severe HTN ($\ge160/110$), pre-eclampsia, severe anaemia (&lt;7.0 g/dL), pre-existing diabetes, or HIV with unsuppressed VL/poor adherence.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                  Escalation: Immediate referral to Level 4/5 hospital with obstetric surgical coverage.
                </div>
              </div>
            </div>

            {/* Moderate Risk Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">MODERATE RISK PREGNANCIES</span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  Score {thresholds.moderateRiskScoreCutoff} - {thresholds.highRiskScoreCutoff - 1}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {modRisk.length.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({((modRisk.length / total) * 100).toFixed(1)}%)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Mild anaemia (10.0-10.9 g/dL), grand multiparity ($\ge5$), adolescent pregnancy (&lt;18), or well-managed HIV with suppressed VL.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  Escalation: Bi-weekly ANC reviews; therapeutic oral iron; home CHP tracking.
                </div>
              </div>
            </div>

            {/* Low Risk Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">LOW RISK PREGNANCIES</span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  Score &lt; {thresholds.moderateRiskScoreCutoff}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {lowRisk.length.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({((lowRisk.length / total) * 100).toFixed(1)}%)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Normotensive, Hb $\ge 11.0$ g/dL, normal glycaemia, regular ANC attendance, and no obstetric red flags.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  Escalation: Standard WHO 8-contact ANC schedule; prophylactic IFAS supplements.
                </div>
              </div>
            </div>
          </div>

          {/* Risk Score Histogram Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              Risk Score Population Distribution (Histogram)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4">
              Calibrated model probability scores mapped to 5 risk decile bins across {total.toLocaleString()} monitored Kenyan mothers.
            </p>

            <div className="space-y-3">
              {buckets.map((b) => (
                <div key={b.label} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{b.label}</span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {b.count.toLocaleString()} mothers ({b.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div
                      className={`${b.color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(100, Math.max(1, Number(b.pct)))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gestational Age Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              High-Risk Vulnerability Across Gestational Age Windows
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4">
              Monitoring gestational trajectory: late-onset pre-eclampsia and late ANC booking peak during the 3rd trimester.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trimesters.map((t) => (
                <div key={t.label} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-3 text-xs">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">{t.label}</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
                    {t.highRate}% <span className="text-xs font-normal text-slate-500 dark:text-slate-400">High Risk</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-1">
                    {t.high} high / {t.total} total
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Threshold Configuration Simulator */}
      {activeTab === 'thresholds' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-6 shadow-xs dark:shadow-none">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Interactive Clinical Threshold Tuning</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Adjust thresholds to simulate policy sensitivity changes. The cohort classifications update instantaneously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            {/* Systolic BP Cutoff */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Systolic Blood Pressure High Risk (mmHg)</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{thresholds.systolicHighRisk} mmHg</span>
              </div>
              <input
                type="range"
                min="130"
                max="160"
                step="5"
                value={thresholds.systolicHighRisk}
                onChange={(e) =>
                  onUpdateThresholds({ ...thresholds, systolicHighRisk: Number(e.target.value) })
                }
                className="w-full accent-teal-600 dark:accent-teal-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">WHO/Kenya standard is 140 mmHg (Severe $\ge$ 160 mmHg).</p>
            </div>

            {/* Diastolic BP Cutoff */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Diastolic Blood Pressure High Risk (mmHg)</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{thresholds.diastolicHighRisk} mmHg</span>
              </div>
              <input
                type="range"
                min="80"
                max="110"
                step="5"
                value={thresholds.diastolicHighRisk}
                onChange={(e) =>
                  onUpdateThresholds({ ...thresholds, diastolicHighRisk: Number(e.target.value) })
                }
                className="w-full accent-teal-600 dark:accent-teal-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Standard clinical threshold is 90 mmHg (Severe $\ge$ 110 mmHg).</p>
            </div>

            {/* Haemoglobin Severe Anaemia */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Severe Anaemia Cutoff (Hb g/dL)</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{thresholds.haemoglobinSevereRisk.toFixed(1)} g/dL</span>
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
                className="w-full accent-teal-600 dark:accent-teal-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">WHO guideline for severe pregnancy anaemia is &lt; 7.0 g/dL.</p>
            </div>

            {/* Minimum Adequate ANC Visits */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Minimum Adequate ANC Visits by Term</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{thresholds.minAdequateAncVisits} Visits</span>
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
                className="w-full accent-teal-600 dark:accent-teal-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Kenya MOH standard tracks towards WHO 8-contact model (minimum 4 focused visits).</p>
            </div>
          </div>
        </div>
      )}

      {/* Kenya MOH Clinical Protocols Tab */}
      {activeTab === 'guidelines' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-4 text-xs shadow-xs dark:shadow-none">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Kenya MOH Maternal & Neonatal Clinical Management Protocols</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                <AlertOctagon className="w-4 h-4" />
                <span>Protocol 1: Severe Pre-Eclampsia / Eclampsia</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                1. Administer Magnesium Sulphate loading dose (4g 20% IV over 10-15 mins + 10g 50% IM deep intragluteal).<br />
                2. Antihypertensive therapy: Oral Nifedipine 10mg or IV Hydralazine 5mg slow bolus if BP $\ge 160/110$.<br />
                3. Continuous foetal heart rate monitoring via CTG or Doppler.<br />
                4. Expedite delivery within 24 hours regardless of gestational age once stabilized.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-teal-700 dark:text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Protocol 2: PMTCT & Viral Load Suppression</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                1. All HIV-positive pregnant women receive universal ART (TLD: Tenofovir + Lamivudine + Dolutegravir) regardless of CD4.<br />
                2. Viral load testing at booking and 6-monthly until delivery.<br />
                3. If VL $\ge 1000$ copies/mL: 3 sessions of Enhanced Adherence Counseling (EAC) + repeat VL after 3 months.<br />
                4. Infant prophylaxis: Dual ARV (AZT + NVP) for 12 weeks for high-risk exposed infants.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
