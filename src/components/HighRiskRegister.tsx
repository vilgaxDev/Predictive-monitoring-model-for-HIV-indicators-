import React, { useState } from 'react';
import { IntegratedMotherCohort, UserRole } from '../types/health';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface HighRiskRegisterProps {
  cohorts: IntegratedMotherCohort[];
  userRole: UserRole;
  onSelectMother: (mother: IntegratedMotherCohort) => void;
}

export const HighRiskRegister: React.FC<HighRiskRegisterProps> = ({
  cohorts,
  userRole,
  onSelectMother,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Sorting
  const [sortField, setSortField] = useState<'riskScore' | 'gestationalAgeWeeks' | 'totalAncVisits'>('riskScore');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedList = [...cohorts].sort((a, b) => {
    let diff = 0;
    if (sortField === 'riskScore') diff = b.riskScore - a.riskScore;
    else if (sortField === 'gestationalAgeWeeks') diff = b.gestationalAgeWeeks - a.gestationalAgeWeeks;
    else if (sortField === 'totalAncVisits') diff = b.totalAncVisits - a.totalAncVisits;
    return sortAsc ? -diff : diff;
  });

  const totalPages = Math.ceil(sortedList.length / pageSize) || 1;
  const paginatedList = sortedList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: 'riskScore' | 'gestationalAgeWeeks' | 'totalAncVisits') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>High-Risk Mothers Pseudonymous Clinical Register</span>
            <span className="text-xs font-mono font-normal text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-teal-200 dark:border-slate-800">
              {cohorts.length.toLocaleString()} Active Records
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Strictly de-identified under the Kenya Data Protection Act 2019. Click any record to inspect clinical attributions, longitudinal timeline, and SHAP explanations.
          </p>
        </div>

        {/* Quick Sorting */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Sort by:</span>
          <button
            onClick={() => handleSort('riskScore')}
            className={`px-2.5 py-1 rounded border text-xs font-medium cursor-pointer ${
              sortField === 'riskScore'
                ? 'bg-slate-200 dark:bg-slate-800 text-teal-700 dark:text-teal-400 border-teal-500/50'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Risk Score {sortField === 'riskScore' ? (sortAsc ? '↑' : '↓') : ''}
          </button>
          <button
            onClick={() => handleSort('gestationalAgeWeeks')}
            className={`px-2.5 py-1 rounded border text-xs font-medium cursor-pointer ${
              sortField === 'gestationalAgeWeeks'
                ? 'bg-slate-200 dark:bg-slate-800 text-teal-700 dark:text-teal-400 border-teal-500/50'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Gestational Wks {sortField === 'gestationalAgeWeeks' ? (sortAsc ? '↑' : '↓') : ''}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-3.5 font-medium">Pseudonym ID</th>
                <th className="py-3 px-3.5 font-medium">Risk Status</th>
                <th className="py-3 px-3.5 font-medium">County & Facility</th>
                <th className="py-3 px-3.5 font-medium">Gestation / Age</th>
                <th className="py-3 px-3.5 font-medium">Key Clinical Vitals</th>
                <th className="py-3 px-3.5 font-medium">ANC Visits</th>
                <th className="py-3 px-3.5 font-medium">HIV / ARV Status</th>
                <th className="py-3 px-3.5 font-medium">Contributing Factors</th>
                <th className="py-3 px-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No patient records matched the active filters.
                  </td>
                </tr>
              ) : (
                paginatedList.map((m) => {
                  const isHigh = m.riskLevel === 'HIGH';
                  const isMod = m.riskLevel === 'MODERATE';

                  return (
                    <tr
                      key={m.motherPseudonym}
                      onClick={() => onSelectMother(m)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Pseudonym */}
                      <td className="py-3 px-3.5 font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{m.motherPseudonym}</span>
                          {m.hasSeroconverted && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1 py-0.2 rounded border border-amber-300 dark:border-amber-800/60 font-medium">
                              Incident
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal">{m.reportingPeriod}</div>
                      </td>

                      {/* Risk Tier & Score */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-xs px-2 py-0.5 rounded ${
                              isHigh
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                                : isMod
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                            }`}
                          >
                            {m.riskLevel}
                          </span>
                          <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-bold">
                            {m.riskScore}
                          </span>
                        </div>
                      </td>

                      {/* County & Facility */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-slate-200">{m.county}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]" title={m.facility}>
                          {m.facility}
                        </div>
                      </td>

                      {/* Gestation & Age */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono tabular-nums">
                        <div>{m.gestationalAgeWeeks} wks</div>
                        <div className="text-[11px] text-slate-500">Age {m.maternalAge} · G{m.gravida}P{m.parity}</div>
                      </td>

                      {/* Clinical Vitals */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono tabular-nums">
                        <div className={m.systolicBp >= 140 || m.diastolicBp >= 90 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
                          {m.systolicBp > 0 ? `${m.systolicBp}/${m.diastolicBp}` : 'Unrecorded'} mmHg
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Hb: {m.haemoglobin > 0 ? `${m.haemoglobin.toFixed(1)} g/dL` : 'Unrecorded'} · Prot: {m.proteinuria}
                        </div>
                      </td>

                      {/* ANC Visits */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono tabular-nums">
                        <span className={m.totalAncVisits < 2 && m.gestationalAgeWeeks >= 28 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
                          {m.totalAncVisits} Visits
                        </span>
                        <div className="text-[11px] text-slate-500">
                          {m.isDataSufficient ? 'Vitals complete' : 'Partial vitals'}
                        </div>
                      </td>

                      {/* HIV & ARV Indicators */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {m.hivStatus === 'Negative' ? (
                          <span className="text-slate-500 dark:text-slate-400">Negative</span>
                        ) : m.hivStatus === 'Seroconverted' ? (
                          <div className="text-amber-700 dark:text-amber-400 font-medium">
                            <div>Seroconverted</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">TLD Initiated</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-slate-900 dark:text-slate-200 font-medium">HIV-Positive</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              ARV: {m.arvAdherence} · {m.viralSuppression}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Contributing Factors */}
                      <td className="py-3 px-3.5 max-w-xs">
                        <div className="text-slate-800 dark:text-slate-300 truncate" title={m.contributingRiskFactors.join('; ')}>
                          {m.contributingRiskFactors[0]}
                        </div>
                        {m.contributingRiskFactors[1] && (
                          <div className="text-[11px] text-slate-500 truncate" title={m.contributingRiskFactors[1]}>
                            + {m.contributingRiskFactors[1]}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMother(m);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-teal-700/60 rounded border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Timeline & SHAP</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div>
            Showing <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200 font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200 font-semibold">
              {Math.min(currentPage * pageSize, sortedList.length)}
            </span>{' '}
            of <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200 font-semibold">{sortedList.length}</span> mothers
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
