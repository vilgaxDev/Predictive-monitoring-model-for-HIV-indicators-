# Predictive monitoring model for HIV indicators,

A secure, ethical, explainable AI dashboard built for the Kenya Ministry of Health (MOH), County Health Management Teams (CHMT), researchers, and healthcare professionals to predict maternal and neonatal health risks, monitor HIV seroconversion, and evaluate PMTCT longitudinal outcomes.

---

## 1. Quickstart: Windows PowerShell Commands

To run the Python Streamlit & Machine Learning backend locally in VS Code or PowerShell:

```powershell
# 1. Navigate to the python_pipeline directory
cd python_pipeline

# 2. Create a virtual environment
python -m venv venv

# 3. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# (If script execution is disabled in PowerShell, run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process)

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the automated test suite
pytest test_pipeline.py

# 6. Launch the Streamlit Dashboard
streamlit run app.py
```

To run the interactive React/Vite dashboard:
```powershell
# From the project root:
npm install
npm run dev
```

---

## 2. Integrated Kenyan Health Registers (Schemas & Mapping)

The application models and ingests data from four official Kenya Ministry of Health registers:

| Register | Name | Key Variables Ingested |
| :--- | :--- | :--- |
| **MOH 405** | Antenatal Care (ANC) Register | Pseudonym (`KEN-MOM-XXXX`), Maternal Age, Gravida, Parity, Gestational Age, ANC Visit Count, Systolic/Diastolic BP, Haemoglobin (Hb g/dL), Blood Glucose, Proteinuria Dipstick, Baseline HIV Status, ART Status at Enrolment, ARV Adherence, Syphilis, IPTp Malaria, IFAS Supplements. |
| **MOH 333** | Maternity Register | Delivery Date, Gestational Age at Delivery, Delivery Mode (SVD, Vacuum, Elective CS, Emergency CS), Complications (Pre-eclampsia, PPH, Obstructed Labour), Maternal HIV Retest at Delivery, Delivery Outcome, Birth Weight (kg), APGAR 5min, Resuscitation. |
| **MOH 406** | Postnatal Care (PNC) Register | PNC Visit Timing (48h, 1-2w, 6w, 6m), Maternal Complications, Maternal HIV Retest at 6w/6m, Infant Feeding Method (EBF), Immunization Status, Maternal & Child Survival. |
| **MOH 206** | PMTCT / Exposed Infant Register | Infant Pseudonym (`KEN-INF-XXXX`), Incident Seroconversion Period, Viral Load (copies/mL), Suppression Tier, 6-Week HEI DNA-PCR, 9-Month Rapid Test, 18-Month Final Diagnosis, 5-Year Child Survival & HIV Status, Loss to Follow-Up (LTFU) tracking. |

---

## 3. Clinical Pregnancy Risk Classification Architecture

The machine learning classification engine stratifies mothers into three clinical tiers:

- **HIGH RISK**:
  - Severe Hypertension (Systolic $\ge 160$ or Diastolic $\ge 110$ mmHg) or Moderate HTN with significant proteinuria (Pre-eclampsia).
  - Severe Anaemia ($\text{Hb} < 7.0$ g/dL).
  - Gestational or Pre-existing Diabetes Mellitus ($\text{Glucose} \ge 7.8$ mmol/L).
  - HIV-Positive status with clinical risk factors, documented ARV non-adherence, or unsuppressed viral load ($\ge 1000$ copies/mL).
  - Incident Maternal HIV Seroconversion during pregnancy or lactation.
  - Critical ANC under-attendance ($<2$ visits by 28 weeks).
- **MODERATE RISK**:
  - Mild anaemia ($\text{Hb } 10.0 - 10.9$ g/dL).
  - Age extremes ($<18$ or $>35$ years) without severe acute organ dysfunction.
  - Grand multiparity ($\ge 5$ deliveries) or elderly primigravida.
  - Well-managed HIV positive on ART with suppressed viral load ($<200$ copies/mL) and verified adherence.
- **LOW RISK**:
  - Normotensive, physiological Hb, adherent to ANC schedule, uncomplicated singleton pregnancy.

> **Clinical Governance Principle**: HIV status alone NEVER automatically classifies a pregnancy as high risk. Missing data is NEVER interpreted as a negative clinical finding; an explicit Data Completeness Score is calculated.

---

## 4. Explainable AI (SHAP)

Feature attribution is computed using **TreeSHAP** (Shapley Additive Explanations):
$$\sum_{i=1}^M \phi_i = f(x) - E[f(x)]$$
- **Global Feature Importance**: Mean $|SHAP|$ across the patient cohort.
- **Local Waterfall / Force Breakdown**: Shows positive and negative risk attributions for each patient.
- **Causal Disclaimer**: SHAP highlights statistical associations within observational health data and does not imply direct clinical causality without controlled clinical trials.

---

## 5. Security, Ethics, and Small-Cell Suppression

- **Data Minimization**: Complete de-identification of patient names, phone numbers, and national IDs.
- **Small-Cell Privacy Rule**: Any aggregate count where $0 < N < 5$ is automatically masked as `<5 (Suppressed)` to prevent deductive re-identification per the Kenya Data Protection Act 2019.
- **Role-Based Access Control (RBAC)**: Supports 4 authenticated roles: National Policy Maker, County Health Director, Facility Clinician, and Epidemiologist/Researcher.
