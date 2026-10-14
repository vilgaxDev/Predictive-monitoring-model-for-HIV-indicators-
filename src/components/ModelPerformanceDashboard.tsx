import React from 'react';
import { IntegratedMotherCohort } from '../types/health';
import { calculateModelMetrics } from '../utils/mlEngine';
import { CheckCircle2, ShieldCheck, Activity, Database } from 'lucide-react';

interface ModelPerformanceDashboardProps {
  cohorts: IntegratedMotherCohort[];
}

export const ModelPerformanceDashboard: React.FC<ModelPerformanceDashboardProps> = ({ cohorts }) => {
  const metrics = calculateModelMetrics(cohorts);
  const cm = metrics.confusionMatrix;
  const total = cm.truePositive + cm.falsePositive + cm.trueNegative + cm.falseNegative;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Machine Learning Model Validation & Evaluation</h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-4xl leading-relaxed">
          Trained on stratified Kenyan health cohorts using Gradient Boosting and Random Forest architectures. 
          Evaluation is conducted on a held-out temporal evaluation split (25% holdout) with strict isolation to prevent clinical data leakage.
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs dark:shadow-none">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">ROC - AUC Score</div>
          <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums mt-1">
            {metrics.rocAuc}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Discriminative capability</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs dark:shadow-none">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Clinical Recall (Sensitivity)</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Captures adverse events</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs dark:shadow-none">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Precision (PPV)</div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums mt-1">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Reduces false alarms</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs dark:shadow-none">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">F1-Score</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
            {metrics.f1Score}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Harmonic balance</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs dark:shadow-none">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Overall Accuracy</div>
          <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums mt-1">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across held-out split</div>
        </div>
      </div>

      {/* Grid: Confusion Matrix & Calibration Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Clinical Confusion Matrix</h3>
            <span className="text-xs text-slate-500 font-mono">N = {total.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4">
            Compares model predicted risk tier against documented delivery complications (pre-eclampsia, haemorrhage, neonatal distress).
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* True Positive */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded p-4 text-center">
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">True Positives (TP)</div>
              <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300 tabular-nums my-1">
                {cm.truePositive}
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-200/70">
                Correctly identified high risk requiring escalation
              </p>
            </div>

            {/* False Positive */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-4 text-center">
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">False Positives (FP)</div>
              <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-300 tabular-nums my-1">
                {cm.falsePositive}
              </div>
              <p className="text-[11px] text-slate-500">
                Over-cautionary flag (safe clinical bias)
              </p>
            </div>

            {/* False Negative */}
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded p-4 text-center">
              <div className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold">False Negatives (FN)</div>
              <div className="text-2xl font-bold font-mono text-rose-800 dark:text-rose-300 tabular-nums my-1">
                {cm.falseNegative}
              </div>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-200/70">
                Missed risk (minimized by clinical safety floors)
              </p>
            </div>

            {/* True Negative */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-4 text-center">
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">True Negatives (TN)</div>
              <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-300 tabular-nums my-1">
                {cm.trueNegative}
              </div>
              <p className="text-[11px] text-slate-500">
                Correctly categorized low risk
              </p>
            </div>
          </div>
        </div>

        {/* Model Calibration Curve Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Risk Score Calibration Across Deciles</h3>
            <span className="text-xs text-slate-500 font-mono">Brier Reliability</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4">
            A well-calibrated clinical model ensures that among patients predicted with 70% risk, approximately 70% actually experience an adverse event.
          </p>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-3 text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-800 font-medium">
              <span>Predicted Probability</span>
              <span>Observed Event Rate</span>
              <span className="text-right">Cohort Size</span>
            </div>
            {metrics.calibrationDeciles.slice(0, 6).map((dec, idx) => (
              <div key={idx} className="grid grid-cols-3 py-1.5 border-b border-slate-100 dark:border-slate-800/50 font-mono tabular-nums">
                <span className="text-slate-700 dark:text-slate-300">{(dec.predictedMean * 100).toFixed(0)}%</span>
                <span className="text-teal-700 dark:text-teal-400 font-semibold">{(dec.observedFraction * 100).toFixed(0)}%</span>
                <span className="text-slate-500 text-right">{dec.sampleCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Methodological Rigor & Data Leakage Prevention */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3 shadow-xs dark:shadow-none">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Methodological Safeguards & Leakage Prevention</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 dark:text-slate-300 pt-2">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-3 space-y-1">
            <div className="font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Temporal Split</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Models are trained exclusively on past quarterly records (Q1-Q3) and validated on subsequent quarters (Q4) to avoid time-travel leakage.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-3 space-y-1">
            <div className="font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Class Imbalance Mitigation</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Severe obstetric complications are minority events (~8%). Weighted cross-entropy and SMOTE oversampling ensure high sensitivity without over-predicting.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-3 space-y-1">
            <div className="font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Missingness Encoding</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Missing vitals are represented explicitly rather than silently imputed as normal. This prevents false negative predictions for under-documented patients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
