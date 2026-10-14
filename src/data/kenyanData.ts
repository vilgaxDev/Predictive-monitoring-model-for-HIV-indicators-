import {
  AncRecord,
  IntegratedMotherCohort,
  MaternityRecord,
  Moh206PmtctRecord,
  PncRecord,
} from '../types/health';
import { DEFAULT_THRESHOLDS, evaluateMotherRisk } from '../utils/mlEngine';

export const KENYAN_COUNTIES = [
  { county: 'Nairobi', facilities: ['Pumwani Maternity Hospital', 'Mbagathi County Hospital', 'Mama Lucy Kibaki Hospital'] },
  { county: 'Kisumu', facilities: ['JOOTRH Referral Hospital', 'Kisumu County Hospital', 'Lumumba Sub-County Hospital'] },
  { county: 'Kilifi', facilities: ['Kilifi County Referral Hospital', 'Malindi Sub-County Hospital', 'Mariakani Sub-County Hospital'] },
  { county: 'Nakuru', facilities: ['Nakuru Level 5 Hospital', 'Naivasha Sub-County Hospital', 'Molo Sub-County Hospital'] },
  { county: 'Mombasa', facilities: ['Coast General Teaching & Referral Hospital', 'Port Reitz Sub-County Hospital'] },
  { county: 'Uasin Gishu', facilities: ['Moi Teaching & Referral Hospital (MTRH)', 'Huruma Sub-County Hospital'] },
  { county: 'Garissa', facilities: ['Garissa County Referral Hospital', 'Madogo Sub-County Hospital'] },
  { county: 'Turkana', facilities: ['Lodwar County Referral Hospital', 'Kakuma Sub-County Hospital'] },
  { county: 'Kiambu', facilities: ['Thika Level 5 Hospital', 'Kiambu Level 5 Hospital', 'Gatundu Level 4 Hospital'] },
  { county: 'Machakos', facilities: ['Machakos Level 5 Hospital', 'Kangundo Level 4 Hospital'] },
];

export const REPORTING_PERIODS = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4'];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates an integrated longitudinal dataset of Kenyan mother-infant pairs
 * matching Kenya MOH 405 (ANC), MOH 333 (Maternity), MOH 406 (PNC), and MOH 206 (PMTCT).
 */
export function generateSyntheticKenyanCohorts(totalRecords: number = 620): {
  ancRecords: AncRecord[];
  maternityRecords: MaternityRecord[];
  pncRecords: PncRecord[];
  pmtctRecords: Moh206PmtctRecord[];
  integratedCohorts: IntegratedMotherCohort[];
} {
  const ancRecords: AncRecord[] = [];
  const maternityRecords: MaternityRecord[] = [];
  const pncRecords: PncRecord[] = [];
  const pmtctRecords: Moh206PmtctRecord[] = [];
  const integratedCohorts: IntegratedMotherCohort[] = [];

  let idCounter = 1001;

  for (let i = 0; i < totalRecords; i++) {
    const seed = i * 17 + 43;
    const motherId = `KEN-MOM-${idCounter + i}`;
    const infantId = `KEN-INF-${idCounter + i}`;

    const countyObj = KENYAN_COUNTIES[Math.floor(pseudoRandom(seed) * KENYAN_COUNTIES.length)];
    const county = countyObj.county;
    const facility = countyObj.facilities[Math.floor(pseudoRandom(seed + 1) * countyObj.facilities.length)];
    const period = REPORTING_PERIODS[Math.floor(pseudoRandom(seed + 2) * REPORTING_PERIODS.length)];

    let facilityLevel: 'Level 3 Health Centre' | 'Level 4 Sub-County Hospital' | 'Level 5 County Referral Hospital' | 'Level 6 National Hospital' = 'Level 4 Sub-County Hospital';
    if (facility.includes('Teaching') || facility.includes('MTRH') || facility.includes('Pumwani')) {
      facilityLevel = 'Level 6 National Hospital';
    } else if (facility.includes('Level 5') || facility.includes('Referral')) {
      facilityLevel = 'Level 5 County Referral Hospital';
    } else if (facility.includes('Health Centre')) {
      facilityLevel = 'Level 3 Health Centre';
    }

    // Demographics
    const ageRoll = pseudoRandom(seed + 3);
    let maternalAge = 26;
    if (ageRoll < 0.12) maternalAge = 16 + Math.floor(pseudoRandom(seed + 4) * 2); // Adolescent 16-17
    else if (ageRoll < 0.22) maternalAge = 36 + Math.floor(pseudoRandom(seed + 4) * 8); // Advanced 36-43
    else maternalAge = 19 + Math.floor(pseudoRandom(seed + 4) * 16); // 19-34

    const gravida = maternalAge < 18 ? 1 : 1 + Math.floor(pseudoRandom(seed + 5) * 5);
    const parity = Math.max(0, gravida - (pseudoRandom(seed + 6) < 0.2 ? 1 : 0));
    const gestationalAgeWeeks = 16 + Math.floor(pseudoRandom(seed + 7) * 24); // 16 - 39 weeks
    const totalAncVisits = Math.min(8, Math.max(1, Math.floor(gestationalAgeWeeks / 5.5) + (pseudoRandom(seed + 8) < 0.25 ? -1 : 0)));

    // Clinical Vitals with realistic co-occurrence
    const clinicalArchetype = pseudoRandom(seed + 9);
    let systolicBp = 115 + Math.floor(pseudoRandom(seed + 10) * 15);
    let diastolicBp = 74 + Math.floor(pseudoRandom(seed + 11) * 12);
    let haemoglobin = 11.2 + (pseudoRandom(seed + 12) * 2.8 - 0.5); // 10.7 - 13.5
    let bloodGlucose = 4.8 + pseudoRandom(seed + 13) * 1.6; // 4.8 - 6.4
    let diabetesStatus: 'Normal' | 'Gestational DM' | 'Pre-existing DM' = 'Normal';
    let proteinuria: 'Negative' | 'Trace' | '1+' | '2+' | '3+' = 'Negative';
    let hivStatusAtEnrolment: 'Negative' | 'Positive' | 'Unknown' = 'Negative';
    let artStatusAtEnrolment: 'Not Applicable' | 'On ART prior to pregnancy' | 'Initiated ART in ANC' | 'Not on ART' = 'Not Applicable';
    let arvAdherence: 'Good' | 'Fair' | 'Poor' | 'Not Applicable' = 'Not Applicable';
    let viralSuppression: 'Suppressed (<200)' | 'Low Viremia (200-999)' | 'Unsuppressed (>=1000)' | 'Not Applicable' = 'Not Applicable';
    let isSeroconverter = false;
    let isConfirmedSeroconverter = false;
    let seroPeriod: 'ANC Retest (3rd Trimester)' | 'Maternity Labour Retest' | 'PNC 6-Week Retest' | 'PNC 6-Month Retest' | undefined = undefined;

    // Archetype 1: Severe Pre-eclampsia / Hypertension (approx 8%)
    if (clinicalArchetype < 0.08) {
      systolicBp = 145 + Math.floor(pseudoRandom(seed + 14) * 28); // 145 - 172
      diastolicBp = 94 + Math.floor(pseudoRandom(seed + 15) * 22); // 94 - 115
      proteinuria = pseudoRandom(seed + 16) < 0.6 ? '2+' : '3+';
      if (pseudoRandom(seed + 17) < 0.3) haemoglobin = 9.4;
    }
    // Archetype 2: Severe / Moderate Anaemia (approx 10%)
    else if (clinicalArchetype < 0.18) {
      haemoglobin = pseudoRandom(seed + 18) < 0.25 ? 6.4 + pseudoRandom(seed + 19) * 0.5 : 8.2 + pseudoRandom(seed + 19) * 1.5;
      if (pseudoRandom(seed + 20) < 0.35) {
        systolicBp = 100;
        diastolicBp = 62;
      }
    }
    // Archetype 3: Diabetes Mellitus (Gestational or Pre-existing) (approx 6%)
    else if (clinicalArchetype < 0.24) {
      bloodGlucose = 8.4 + pseudoRandom(seed + 21) * 4.2;
      diabetesStatus = pseudoRandom(seed + 22) < 0.4 ? 'Pre-existing DM' : 'Gestational DM';
    }
    // Archetype 4: HIV-Positive Cohort (approx 14% reflecting high burden regions like Kisumu/Mombasa)
    else if (clinicalArchetype < 0.38) {
      hivStatusAtEnrolment = 'Positive';
      artStatusAtEnrolment = pseudoRandom(seed + 23) < 0.7 ? 'On ART prior to pregnancy' : 'Initiated ART in ANC';
      const adhRoll = pseudoRandom(seed + 24);
      if (adhRoll < 0.18) {
        // Poor adherence / unsuppressed
        arvAdherence = 'Poor';
        viralSuppression = 'Unsuppressed (>=1000)';
      } else if (adhRoll < 0.35) {
        arvAdherence = 'Fair';
        viralSuppression = 'Low Viremia (200-999)';
      } else {
        arvAdherence = 'Good';
        viralSuppression = 'Suppressed (<200)';
      }
    }
    // Archetype 5: Maternal HIV Seroconversion (approx 3% of cohort: Enrolled negative -> converted later)
    else if (clinicalArchetype < 0.41) {
      hivStatusAtEnrolment = 'Negative';
      isSeroconverter = true;
      const confRoll = pseudoRandom(seed + 25);
      isConfirmedSeroconverter = confRoll < 0.78; // 78% confirmed, 22% suspected/discordant
      const periodRoll = pseudoRandom(seed + 26);
      if (periodRoll < 0.45) seroPeriod = 'ANC Retest (3rd Trimester)';
      else if (periodRoll < 0.75) seroPeriod = 'Maternity Labour Retest';
      else seroPeriod = 'PNC 6-Week Retest';

      arvAdherence = 'Good';
      viralSuppression = 'Low Viremia (200-999)';
    }

    // Incomplete data simulation (missing values in ~4% of records)
    if (pseudoRandom(seed + 27) < 0.04) {
      systolicBp = 0;
      diastolicBp = 0;
    }
    if (pseudoRandom(seed + 28) < 0.03) {
      haemoglobin = 0;
    }

    // Construct ANC record
    const ancRec: AncRecord = {
      ancId: `ANC-${10000 + i}`,
      motherPseudonym: motherId,
      county,
      facility,
      facilityLevel,
      reportingPeriod: period,
      maternalAge,
      gravida,
      parity,
      gestationalAgeWeeks,
      totalAncVisits,
      systolicBp,
      diastolicBp,
      haemoglobin,
      bloodGlucose,
      diabetesStatus,
      proteinuria,
      hivStatusAtEnrolment,
      artStatusAtEnrolment,
      arvAdherenceDocumented: arvAdherence,
      syphilisTest: pseudoRandom(seed + 29) < 0.02 ? 'Positive' : 'Negative',
      malariaIptpDoses: Math.min(3, Math.floor(pseudoRandom(seed + 30) * 4)),
      ifasSupplementsGiven: pseudoRandom(seed + 31) > 0.08,
    };
    ancRecords.push(ancRec);

    // Delivery & Maternity outcomes
    const complications: string[] = [];
    if (systolicBp >= 140 && proteinuria !== 'Negative') complications.push('Pre-eclampsia');
    if (systolicBp >= 165 && diastolicBp >= 110) complications.push('Eclampsia');
    if (haemoglobin > 0 && haemoglobin < 7.5) complications.push('Postpartum Haemorrhage (PPH)');
    if (maternalAge < 17 && parity === 0) complications.push('Obstructed Labour / CPD');
    if (complications.length === 0) complications.push('None');

    const isEmergencyCs = complications.includes('Pre-eclampsia') || complications.includes('Eclampsia') || complications.includes('Obstructed Labour / CPD');
    const deliveryMode: 'Spontaneous Vertex' | 'Assisted Vacuum' | 'Elective CS' | 'Emergency CS' =
      isEmergencyCs ? 'Emergency CS' : (pseudoRandom(seed + 32) < 0.12 ? 'Elective CS' : 'Spontaneous Vertex');

    const birthWeightKg = Number((2.4 + pseudoRandom(seed + 33) * 1.5).toFixed(2));
    const apgar5 = complications.includes('Eclampsia') ? 6 : Math.min(10, 8 + Math.floor(pseudoRandom(seed + 34) * 3));

    const matRec: MaternityRecord = {
      deliveryId: `MAT-${20000 + i}`,
      motherPseudonym: motherId,
      deliveryDate: `2024-${String(1 + Math.floor(pseudoRandom(seed + 35) * 12)).padStart(2, '0')}-15`,
      gestationalAgeAtDelivery: Math.min(41, Math.max(34, gestationalAgeWeeks + 4)),
      deliveryMode,
      maternalComplications: complications,
      hivRetestAtDelivery: isSeroconverter && seroPeriod === 'Maternity Labour Retest'
        ? (isConfirmedSeroconverter ? 'Positive' : 'Positive')
        : (hivStatusAtEnrolment === 'Positive' ? 'Known Positive' : 'Negative'),
      deliveryOutcome: complications.includes('Eclampsia') && pseudoRandom(seed + 36) < 0.08 ? 'Fresh stillbirth' : 'Live birth',
      birthWeightKg,
      apgarScore5Min: apgar5,
      neonatalResuscitationDone: apgar5 < 7,
      infantNvpGiven: hivStatusAtEnrolment === 'Positive' || isSeroconverter,
    };
    maternityRecords.push(matRec);

    // PNC Record
    const pncRec: PncRecord = {
      pncId: `PNC-${30000 + i}`,
      motherPseudonym: motherId,
      pncVisitTime: pseudoRandom(seed + 37) < 0.5 ? '6 weeks' : '6 months',
      maternalComplicationsPostpartum: complications.includes('Pre-eclampsia') ? ['Hypertension monitoring'] : [],
      hivRetestPostpartum: isSeroconverter && seroPeriod === 'PNC 6-Week Retest' ? 'Positive' : (hivStatusAtEnrolment === 'Positive' ? 'Known Positive' : 'Negative'),
      artRetainedPostpartum: hivStatusAtEnrolment === 'Positive' || isSeroconverter,
      infantFeedingMethod: 'Exclusive Breastfeeding',
      infantImmunizationUpToDate: pseudoRandom(seed + 38) > 0.06,
      maternalSurvival: 'Alive',
      childSurvival: matRec.deliveryOutcome === 'Live birth' ? 'Alive' : 'Deceased',
    };
    pncRecords.push(pncRec);

    // PMTCT longitudinal 5-year records for HIV-exposed or seroconverted pairs
    let pmtctRec: Moh206PmtctRecord | undefined = undefined;
    let fiveYearOutcome: 'Confirmed HIV-Negative & Survived' | 'Pediatric HIV Transmission' | 'Child Deceased' | 'Lost to Follow-up' | 'In-Progress Cohort' | undefined = undefined;

    if (hivStatusAtEnrolment === 'Positive' || isSeroconverter) {
      const pmtctRoll = pseudoRandom(seed + 39);
      let pcr6w: 'Negative' | 'Positive' | 'Indeterminate' | 'Pending / Missed' = 'Negative';
      let rapid9m: 'Negative' | 'Positive' | 'Pending / Missed' = 'Negative';
      let rapid18m: 'Negative' | 'Positive' | 'Pending / Missed' = 'Negative';
      let fiveYearStatus: 'Confirmed HIV-Negative' | 'Confirmed HIV-Positive' | 'Lost to Follow-up' | 'Child Deceased' | 'Cohort In-Progress' = 'Confirmed HIV-Negative';
      let matSurv5: 'Alive' | 'Deceased' | 'Lost to Follow-up' = 'Alive';
      let childSurv5: 'Alive' | 'Deceased' | 'Lost to Follow-up' = 'Alive';
      let retained = true;

      // Transmission happens primarily if unsuppressed viral load or poor adherence or incident seroconversion
      const transmissionVulnerable = (arvAdherence === 'Poor') || (viralSuppression === 'Unsuppressed (>=1000)') || isSeroconverter;

      if (transmissionVulnerable && pmtctRoll < 0.22) {
        // Vertical transmission documented
        pcr6w = 'Positive';
        rapid9m = 'Positive';
        rapid18m = 'Positive';
        fiveYearStatus = 'Confirmed HIV-Positive';
        fiveYearOutcome = 'Pediatric HIV Transmission';
      } else if (pmtctRoll < 0.09) {
        // Lost to follow-up (explicitly separated from death or negative status)
        pcr6w = 'Negative';
        rapid9m = 'Pending / Missed';
        rapid18m = 'Pending / Missed';
        fiveYearStatus = 'Lost to Follow-up';
        childSurv5 = 'Lost to Follow-up';
        matSurv5 = 'Lost to Follow-up';
        retained = false;
        fiveYearOutcome = 'Lost to Follow-up';
      } else if (pmtctRoll < 0.13) {
        // Child deceased
        pcr6w = 'Negative';
        rapid9m = 'Pending / Missed';
        rapid18m = 'Pending / Missed';
        fiveYearStatus = 'Child Deceased';
        childSurv5 = 'Deceased';
        fiveYearOutcome = 'Child Deceased';
      } else if (pmtctRoll < 0.25) {
        // In-progress recent cohort (not reached 5 years yet)
        pcr6w = 'Negative';
        rapid9m = 'Negative';
        rapid18m = 'Pending / Missed';
        fiveYearStatus = 'Cohort In-Progress';
        fiveYearOutcome = 'In-Progress Cohort';
      } else {
        // Confirmed HIV-Negative and Survived 5 Years! (PMTCT Success Gold Standard)
        pcr6w = 'Negative';
        rapid9m = 'Negative';
        rapid18m = 'Negative';
        fiveYearStatus = 'Confirmed HIV-Negative';
        fiveYearOutcome = 'Confirmed HIV-Negative & Survived';
      }

      pmtctRec = {
        pmtctId: `PMTCT-${40000 + i}`,
        motherPseudonym: motherId,
        infantPseudonym: infantId,
        baselineHivStatus: hivStatusAtEnrolment === 'Positive' ? 'Positive' : 'Negative',
        seroconversionStatus: isSeroconverter
          ? (isConfirmedSeroconverter ? 'Confirmed Seroconversion' : 'Suspected / Discordant')
          : (hivStatusAtEnrolment === 'Positive' ? 'Known Positive at Baseline' : 'Negative Maintained'),
        seroconversionDetectionPeriod: seroPeriod,
        maternalViralLoadCopies: viralSuppression === 'Suppressed (<200)' ? 40 : (viralSuppression === 'Unsuppressed (>=1000)' ? 24500 : 450),
        viralSuppressionCategory: viralSuppression === 'Not Applicable' ? 'Suppressed (<200)' : viralSuppression,
        infantDnaPcr6Weeks: pcr6w,
        infantRapidTest9Months: rapid9m,
        infantRapidTest18Months: rapid18m,
        fiveYearChildHivStatus: fiveYearStatus,
        fiveYearMaternalSurvival: matSurv5,
        fiveYearChildSurvival: childSurv5,
        retainedInCare5Years: retained,
      };
      pmtctRecords.push(pmtctRec);
    }

    // Evaluate Risk using clinical ML engine
    const effectiveHiv: 'Negative' | 'Positive' | 'Seroconverted' = isSeroconverter
      ? 'Seroconverted'
      : (hivStatusAtEnrolment === 'Positive' ? 'Positive' : 'Negative');

    const evalResult = evaluateMotherRisk({
      maternalAge,
      gravida,
      parity,
      gestationalAgeWeeks,
      totalAncVisits,
      systolicBp,
      diastolicBp,
      haemoglobin,
      bloodGlucose,
      diabetesStatus,
      proteinuria,
      hivStatus: effectiveHiv,
      arvAdherence,
      viralSuppression,
    }, DEFAULT_THRESHOLDS);

    const cohortItem: IntegratedMotherCohort = {
      motherPseudonym: motherId,
      county,
      facility,
      facilityLevel,
      reportingPeriod: period,
      maternalAge,
      gravida,
      parity,
      gestationalAgeWeeks,
      totalAncVisits,
      systolicBp,
      diastolicBp,
      haemoglobin,
      bloodGlucose,
      diabetesStatus,
      proteinuria,
      hivStatus: effectiveHiv,
      arvAdherence,
      viralSuppression,
      deliveryMode,
      birthWeightKg,
      maternalComplications: complications,
      riskScore: evalResult.riskScore,
      riskLevel: evalResult.riskLevel,
      contributingRiskFactors: evalResult.contributingRiskFactors,
      recommendedActions: evalResult.recommendedActions,
      dataCompletenessScore: evalResult.dataCompletenessScore,
      isDataSufficient: evalResult.isDataSufficient,
      shapValues: evalResult.shapValues,
      pmtctRecord: pmtctRec,
      hasSeroconverted: isSeroconverter,
      isConfirmedSeroconversion: isConfirmedSeroconverter,
      fiveYearOutcome,
    };

    integratedCohorts.push(cohortItem);
  }

  return {
    ancRecords,
    maternityRecords,
    pncRecords,
    pmtctRecords,
    integratedCohorts,
  };
}
