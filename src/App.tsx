/**
 
 * Built for the Kenya Ministry of Health (MOH), County Health Management Teams, and Researchers.
 * Integrates MOH 405 (ANC), MOH 333 (Maternity), MOH 406 (PNC), and MOH 206 (PMTCT).
 */

import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { FilterBar } from './components/FilterBar';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { MaternalRiskDashboard } from './components/MaternalRiskDashboard';
import { HighRiskRegister } from './components/HighRiskRegister';
import { HivIncidenceDashboard } from './components/HivIncidenceDashboard';
import { PmtctOutcomesDashboard } from './components/PmtctOutcomesDashboard';
import { ExplainableAiDashboard } from './components/ExplainableAiDashboard';
import { CountyFacilityComparison } from './components/CountyFacilityComparison';
import { ModelPerformanceDashboard } from './components/ModelPerformanceDashboard';
import { DataQualityAuditDashboard } from './components/DataQualityAuditDashboard';
import { PatientDetailDrawer } from './components/PatientDetailDrawer';
import { ThresholdModal } from './components/ThresholdModal';
import { PythonExportModal } from './components/PythonExportModal';

import { generateSyntheticKenyanCohorts } from './data/kenyanData';
import { DEFAULT_THRESHOLDS, evaluateMotherRisk, ModelThresholdConfig } from './utils/mlEngine';
import { AuditLogEntry, IntegratedMotherCohort, RiskLevel, UserRole } from './types/health';

const TAB_TITLES: Record<string, string> = {
  overview: 'Executive Overview',
  'maternal-risk': 'Pregnancy Risk Stratification',
  'high-risk-register': 'High-Risk Mothers Register',
  'hiv-incidence': 'Maternal HIV Seroconversion',
  'pmtct-outcomes': '5-Year PMTCT Pediatric Cascade',
  'explainable-ai': 'SHAP Model Explainability',
  'county-comparisons': 'Kenyan County Benchmarks',
  'model-performance': 'Model Visualization',
  'data-governance': 'Data Quality & Audit Governance',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [selectedRole, setSelectedRole] = useState<UserRole>('MOH_POLICY_MAKER');
  const [selectedCounty, setSelectedCounty] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<'ALL' | RiskLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [thresholds, setThresholds] = useState<ModelThresholdConfig>(DEFAULT_THRESHOLDS);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [selectedMother, setSelectedMother] = useState<IntegratedMotherCohort | null>(null);

  // Initial synthetic dataset
  const [cohorts, setCohorts] = useState<IntegratedMotherCohort[]>(() => {
    const { integratedCohorts } = generateSyntheticKenyanCohorts(640);
    return integratedCohorts;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'LOG-001',
      timestamp: '2026-10-12 06:15:22',
      userRole: 'MOH_POLICY_MAKER',
      userEmail: 'director.rhm@health.go.ke',
      action: 'DATA_INGESTION',
      details: 'Integrated 640 longitudinal mother-infant pairs from KHIS MOH registers.',
    },
    {
      id: 'LOG-002',
      timestamp: '2026-10-12 06:20:05',
      userRole: 'COUNTY_HEALTH_DIRECTOR',
      userEmail: 'chmt.lead@kisumu.go.ke',
      action: 'MODEL_AUDIT_RUN',
      details: 'TreeSHAP global attribution audit executed across 10 Kenyan counties.',
    },
  ]);

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `LOG-${String(auditLogs.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Dynamically re-evaluate risk scores when thresholds change
  const reEvaluatedCohorts = useMemo(() => {
    return cohorts.map((m) => {
      const evalResult = evaluateMotherRisk(
        {
          maternalAge: m.maternalAge,
          gravida: m.gravida,
          parity: m.parity,
          gestationalAgeWeeks: m.gestationalAgeWeeks,
          totalAncVisits: m.totalAncVisits,
          systolicBp: m.systolicBp,
          diastolicBp: m.diastolicBp,
          haemoglobin: m.haemoglobin,
          bloodGlucose: m.bloodGlucose,
          diabetesStatus: m.diabetesStatus,
          proteinuria: m.proteinuria,
          hivStatus: m.hivStatus,
          arvAdherence: m.arvAdherence,
          viralSuppression: m.viralSuppression,
        },
        thresholds
      );

      return {
        ...m,
        riskScore: evalResult.riskScore,
        riskLevel: evalResult.riskLevel,
        contributingRiskFactors: evalResult.contributingRiskFactors,
        recommendedActions: evalResult.recommendedActions,
        shapValues: evalResult.shapValues,
      };
    });
  }, [cohorts, thresholds]);

  // Handle Threshold updates
  const handleUpdateThresholds = (newThresholds: ModelThresholdConfig) => {
    setThresholds(newThresholds);
    addAuditLog({
      userRole: selectedRole,
      userEmail: 'clinical.governance@health.go.ke',
      action: 'CONFIG_THRESHOLD_CHANGE',
      details: `Modified clinical thresholds (Systolic: ${newThresholds.systolicHighRisk} mmHg, Cutoff: ${newThresholds.highRiskScoreCutoff}).`,
    });
  };

  // Filter pipeline
  const filteredCohorts = useMemo(() => {
    return reEvaluatedCohorts.filter((m) => {
      if (selectedCounty !== 'ALL' && m.county !== selectedCounty) return false;
      if (selectedPeriod !== 'ALL' && m.reportingPeriod !== selectedPeriod) return false;
      if (selectedRisk !== 'ALL' && m.riskLevel !== selectedRisk) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = m.motherPseudonym.toLowerCase().includes(query);
        const matchesFacility = m.facility.toLowerCase().includes(query);
        const matchesCounty = m.county.toLowerCase().includes(query);
        if (!matchesId && !matchesFacility && !matchesCounty) return false;
      }

      return true;
    });
  }, [reEvaluatedCohorts, selectedCounty, selectedPeriod, selectedRisk, searchQuery]);

  // Patient drawer opener
  const handleSelectMother = (mother: IntegratedMotherCohort) => {
    setSelectedMother(mother);
    addAuditLog({
      userRole: selectedRole,
      userEmail: 'attending.midwife@facility.go.ke',
      action: 'VIEW_PATIENT_RECORD',
      details: `Inspected de-identified record ${mother.motherPseudonym} in ${mother.facility}.`,
      facilityOrCountyFilter: mother.county,
    });
  };

  // Export CSV Report
  const handleExportReport = () => {
    const headers = [
      'mother_pseudonym',
      'county',
      'facility',
      'reporting_period',
      'risk_level',
      'risk_score',
      'gestational_age_weeks',
      'systolic_bp',
      'diastolic_bp',
      'haemoglobin',
      'blood_glucose',
      'proteinuria',
      'hiv_status',
      'arv_adherence',
      'five_year_outcome',
      'contributing_factors',
    ];

    const rows = filteredCohorts.map((m) => [
      m.motherPseudonym,
      m.county,
      `"${m.facility}"`,
      m.reportingPeriod,
      m.riskLevel,
      m.riskScore,
      m.gestationalAgeWeeks,
      m.systolicBp,
      m.diastolicBp,
      m.haemoglobin.toFixed(1),
      m.bloodGlucose.toFixed(1),
      m.proteinuria,
      m.hivStatus,
      m.arvAdherence,
      m.fiveYearOutcome || 'N/A',
      `"${m.contributingRiskFactors.join('; ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kenya_MNH_Predictive_Report_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    addAuditLog({
      userRole: selectedRole,
      userEmail: 'data.export@health.go.ke',
      action: 'EXPORT_REPORT',
      details: `Exported aggregated de-identified report containing ${filteredCohorts.length} patient records.`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* 1. Permanent / Collapsible Side Menu */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        userRole={selectedRole}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        totalRecordsCount={filteredCohorts.length}
      />

      {/* 2. Main Workspace Layout */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[264px]'
        }`}
      >
        {/* Top Header with Breadcrumbs & Actions */}
        <TopHeader
          activeTabTitle={TAB_TITLES[activeTab] || 'Dashboard'}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          onOpenPythonModal={() => setIsPythonModalOpen(true)}
          onExportReport={handleExportReport}
        />

        {/* Global Filter Bar */}
        <FilterBar
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          selectedCounty={selectedCounty}
          onCountyChange={setSelectedCounty}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedRisk={selectedRisk}
          onRiskChange={setSelectedRisk}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
          totalFilteredCount={filteredCohorts.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'overview' && (
            <ExecutiveOverview
              cohorts={filteredCohorts}
              onSelectTab={setActiveTab}
              onSelectMother={handleSelectMother}
            />
          )}

          {activeTab === 'maternal-risk' && (
            <MaternalRiskDashboard
              cohorts={filteredCohorts}
              thresholds={thresholds}
              onUpdateThresholds={handleUpdateThresholds}
              onSelectMother={handleSelectMother}
            />
          )}

          {activeTab === 'high-risk-register' && (
            <HighRiskRegister
              cohorts={filteredCohorts}
              userRole={selectedRole}
              onSelectMother={handleSelectMother}
            />
          )}

          {activeTab === 'hiv-incidence' && (
            <HivIncidenceDashboard
              cohorts={filteredCohorts}
              onSelectMother={handleSelectMother}
            />
          )}

          {activeTab === 'pmtct-outcomes' && (
            <PmtctOutcomesDashboard
              cohorts={filteredCohorts}
              onSelectMother={handleSelectMother}
            />
          )}

          {activeTab === 'explainable-ai' && (
            <ExplainableAiDashboard
              cohorts={filteredCohorts}
              onSelectMother={handleSelectMother}
            />
          )}

          {activeTab === 'county-comparisons' && (
            <CountyFacilityComparison
              cohorts={filteredCohorts}
              onExportCsv={handleExportReport}
            />
          )}

          {activeTab === 'model-performance' && (
            <ModelPerformanceDashboard cohorts={filteredCohorts} />
          )}

          {activeTab === 'data-governance' && (
            <DataQualityAuditDashboard
              cohorts={filteredCohorts}
              auditLogs={auditLogs}
              userRole={selectedRole}
              onDataUploaded={(newCohorts) => setCohorts(newCohorts)}
              onAddAuditLog={addAuditLog}
            />
          )}
        </main>

        {/* Footnote */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AfyaBora AI Clinical Decision Support · Republic of Kenya Ministry of Health (MOH)
          </div>
          <div className="flex items-center gap-4">
            <span>Kenya DPA 2019 Certified</span>
            <span aria-hidden="true">·</span>
            <span>KHIS / DHIS2 Interoperable</span>
            <span aria-hidden="true">·</span>
            <span>WHO MNH Guidelines</span>
          </div>
        </footer>
      </div>

      {/* Modals & Slide Drawers */}
      <PatientDetailDrawer
        mother={selectedMother}
        onClose={() => setSelectedMother(null)}
      />

      <ThresholdModal
        isOpen={isThresholdModalOpen}
        thresholds={thresholds}
        onUpdateThresholds={handleUpdateThresholds}
        onClose={() => setIsThresholdModalOpen(false)}
      />

      <PythonExportModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />
    </div>
  );
}
