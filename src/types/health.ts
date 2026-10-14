/**
 * Core clinical and health data types for Kenya Maternal & Neonatal Health Dashboard
 * Compatible with Kenya Health Information System (KHIS) / DHIS2 and MOH Registers:
 * - MOH 405: Antenatal Care (ANC) Register
 * - MOH 333: Maternity Register
 * - MOH 406: Postnatal Care (PNC) Register
 * - MOH 206: PMTCT / Exposed Infant Cohort Register
 */

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export type UserRole =
  | 'MOH_POLICY_MAKER'       // Kenya MOH National Directorate (aggregates, policy, national KPIs)
  | 'COUNTY_HEALTH_DIRECTOR' // County Department of Health (county-level drilldown, facility comparisons)
  | 'FACILITY_CLINICIAN'     // Facility Nurse/Midwife/Obstetrician (individual pseudonymous patient follow-up)
  | 'RESEARCHER_EPIDEMIOLOGIST'; // Epidemiological research & model auditing

export interface AncRecord {
  ancId: string;
  motherPseudonym: string;
  county: string;
  facility: string;
  facilityLevel: 'Level 3 Health Centre' | 'Level 4 Sub-County Hospital' | 'Level 5 County Referral Hospital' | 'Level 6 National Hospital';
  reportingPeriod: string; // e.g. "2024-Q1"
  maternalAge: number;
  gravida: number;
  parity: number;
  gestationalAgeWeeks: number;
  totalAncVisits: number;
  systolicBp: number;
  diastolicBp: number;
  haemoglobin: number; // g/dL
  bloodGlucose: number; // mmol/L
  diabetesStatus: 'Normal' | 'Gestational DM' | 'Pre-existing DM';
  proteinuria: 'Negative' | 'Trace' | '1+' | '2+' | '3+';
  hivStatusAtEnrolment: 'Negative' | 'Positive' | 'Unknown';
  artStatusAtEnrolment: 'Not Applicable' | 'On ART prior to pregnancy' | 'Initiated ART in ANC' | 'Not on ART';
  arvAdherenceDocumented: 'Good' | 'Fair' | 'Poor' | 'Not Applicable';
  syphilisTest: 'Negative' | 'Positive' | 'Not Done';
  malariaIptpDoses: number;
  ifasSupplementsGiven: boolean;
}

export interface MaternityRecord {
  deliveryId: string;
  motherPseudonym: string;
  deliveryDate: string;
  gestationalAgeAtDelivery: number;
  deliveryMode: 'Spontaneous Vertex' | 'Assisted Vacuum' | 'Elective CS' | 'Emergency CS';
  maternalComplications: string[]; // e.g. ["Pre-eclampsia", "PPH", "None"]
  hivRetestAtDelivery: 'Negative' | 'Positive' | 'Not Done' | 'Known Positive';
  deliveryOutcome: 'Live birth' | 'Fresh stillbirth' | 'Macerated stillbirth';
  birthWeightKg: number;
  apgarScore5Min: number;
  neonatalResuscitationDone: boolean;
  infantNvpGiven: boolean;
}

export interface PncRecord {
  pncId: string;
  motherPseudonym: string;
  pncVisitTime: 'Within 48 hours' | '1-2 weeks' | '6 weeks' | '6 months';
  maternalComplicationsPostpartum: string[];
  hivRetestPostpartum: 'Negative' | 'Positive' | 'Not Done' | 'Known Positive';
  artRetainedPostpartum: boolean;
  infantFeedingMethod: 'Exclusive Breastfeeding' | 'Replacement Feeding' | 'Mixed Feeding';
  infantImmunizationUpToDate: boolean;
  maternalSurvival: 'Alive' | 'Deceased' | 'Lost to Follow-up';
  childSurvival: 'Alive' | 'Deceased' | 'Lost to Follow-up';
}

export interface Moh206PmtctRecord {
  pmtctId: string;
  motherPseudonym: string;
  infantPseudonym: string;
  baselineHivStatus: 'Negative' | 'Positive';
  seroconversionStatus: 'Confirmed Seroconversion' | 'Suspected / Discordant' | 'Negative Maintained' | 'Known Positive at Baseline';
  seroconversionDetectionPeriod?: 'ANC Retest (3rd Trimester)' | 'Maternity Labour Retest' | 'PNC 6-Week Retest' | 'PNC 6-Month Retest';
  maternalViralLoadCopies?: number; // copies/mL
  viralSuppressionCategory?: 'Suppressed (<200)' | 'Low Viremia (200-999)' | 'Unsuppressed (>=1000)' | 'Not Done';
  infantDnaPcr6Weeks: 'Negative' | 'Positive' | 'Indeterminate' | 'Pending / Missed';
  infantRapidTest9Months: 'Negative' | 'Positive' | 'Pending / Missed';
  infantRapidTest18Months: 'Negative' | 'Positive' | 'Pending / Missed';
  // Long-term 5-year pediatric tracking
  fiveYearChildHivStatus: 'Confirmed HIV-Negative' | 'Confirmed HIV-Positive' | 'Lost to Follow-up' | 'Child Deceased' | 'Cohort In-Progress';
  fiveYearMaternalSurvival: 'Alive' | 'Deceased' | 'Lost to Follow-up';
  fiveYearChildSurvival: 'Alive' | 'Deceased' | 'Lost to Follow-up';
  retainedInCare5Years: boolean;
}

export interface IntegratedMotherCohort {
  motherPseudonym: string;
  county: string;
  facility: string;
  facilityLevel: 'Level 3 Health Centre' | 'Level 4 Sub-County Hospital' | 'Level 5 County Referral Hospital' | 'Level 6 National Hospital';
  reportingPeriod: string;
  maternalAge: number;
  gravida: number;
  parity: number;
  gestationalAgeWeeks: number;
  totalAncVisits: number;
  systolicBp: number;
  diastolicBp: number;
  haemoglobin: number;
  bloodGlucose: number;
  diabetesStatus: 'Normal' | 'Gestational DM' | 'Pre-existing DM';
  proteinuria: 'Negative' | 'Trace' | '1+' | '2+' | '3+';
  hivStatus: 'Negative' | 'Positive' | 'Seroconverted';
  arvAdherence: 'Good' | 'Fair' | 'Poor' | 'Not Applicable';
  viralSuppression: 'Suppressed (<200)' | 'Low Viremia (200-999)' | 'Unsuppressed (>=1000)' | 'Not Applicable';
  deliveryMode?: string;
  birthWeightKg?: number;
  maternalComplications: string[];
  
  // Model prediction outputs
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  contributingRiskFactors: string[];
  recommendedActions: string[];
  dataCompletenessScore: number; // percentage of critical vitals present
  isDataSufficient: boolean;
  
  // SHAP local explanations for this specific patient
  shapValues: {
    feature: string;
    impact: number; // positive increases risk, negative decreases risk
    valueDescription: string;
  }[];

  // Longitudinal PMTCT linkage
  pmtctRecord?: Moh206PmtctRecord;
  hasSeroconverted: boolean;
  isConfirmedSeroconversion: boolean;
  
  // 5-year child outcome
  fiveYearOutcome?: 'Confirmed HIV-Negative & Survived' | 'Pediatric HIV Transmission' | 'Child Deceased' | 'Lost to Follow-up' | 'In-Progress Cohort';
}

export interface ShapGlobalFeature {
  featureName: string;
  label: string;
  meanAbsShap: number;
  category: 'Clinical Vitals' | 'Obstetric History' | 'Infectious / HIV' | 'Health System / ANC Attendance';
  clinicalDescription: string;
}

export interface ModelValidationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  calibrationDeciles: {
    predictedMean: number;
    observedFraction: number;
    sampleCount: number;
  }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userEmail: string;
  action: 'DATA_INGESTION' | 'VIEW_PATIENT_RECORD' | 'EXPORT_REPORT' | 'CONFIG_THRESHOLD_CHANGE' | 'MODEL_AUDIT_RUN';
  details: string;
  facilityOrCountyFilter?: string;
}
