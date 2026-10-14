# Predictive Monitoring Model for HIV Indicators, High-Risk Pregnancies, Maternal and Neonatal Mortality Rates

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
pytest tests/test_ner_evaluation.py

# 6. Launch the Streamlit Dashboard
streamlit run app.py
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
- **Privacy-Preserving AI**: All PII is anonymized using BERT-based NER before any ML processing.
- **Session-Only Processing**: No patient data is stored permanently; data is processed in session only.
- **Compliance**: Compliant with Kenya Data Protection Act 2019 & MOH Health Information Systems Policy.

---

## 6. Key Features

### Privacy & Anonymization
- **BERT-based NER** for PII detection (names, IDs, dates, locations)
- **Manual annotation workflow** for ground-truth NER evaluation
- **Entity-level evaluation** with exact-span matching
- **LLM-style synthetic data generation** 
- **Knowledge Graph integration** with RDF triples

### Clinical Analysis
- **High-Risk Pregnancy Register** with clinical recommendations
- **HIV Seroconversion** tracking and analysis
- **PMTCT 5-Year Cascade** outcomes monitoring
- **Maternal and Neonatal Mortality** trend analysis
- **Delivery Mode Analysis** with real data

### Machine Learning
- **ML model training** with Gradient Boosting
- **SHAP explainability** for feature importance
- **Confusion Matrix** visualization
- **Detailed metrics dashboard** with interactive charts
- **Per-entity NER evaluation** (Precision, Recall, F1)

### Data Management
- **Upload Custom Dataset** (CSV/Excel)
- **Use Sample Data** for demonstration
- **County filtering** for regional analysis
- **Active Role (RBAC)** for access control

---

## 7. Installation

```bash
pip install -r requirements.txt
```

### Dependencies
- streamlit
- pandas
- numpy
- scikit-learn
- transformers
- plotly
- shap
- matplotlib
- seaborn
- openpyxl
- pytest

---

## 8. Usage

### Local Run

```bash
streamlit run app.py
```

### Deploy to Streamlit Cloud

1. Push this repository to GitHub
2. Go to [Streamlit Cloud](https://share.streamlit.io)
3. Connect your GitHub repository
4. Deploy the app

---

## 9. Workflow

1. **Upload your dataset** (CSV/Excel) or use sample data
2. **Run BERT-LLM-KG Pipeline** to anonymize data and generate metrics
3. **View Detailed Metrics** - BERT training, BIO tagging, NER evaluation
4. **Annotate PII entities** using Annotation Workflow (for ground-truth evaluation)
5. **Run NER evaluation** to measure actual performance
   - Choose "Rule-Based Detection (Baseline)" for quick assessment
   - Choose "Manual Annotation (Ground Truth)" for accurate evaluation
6. **View Knowledge Graph** with interactive visualizations
7. **Train ML model** on anonymized data
8. **View SHAP explanations** for feature importance
9. **Explore High-Risk Register** with clinical recommendations
10. **Monitor HIV Indicators** and PMTCT outcomes

---

## 10. Dashboard Navigation

1. **📊 Executive Overview** - Dataset fingerprint and key metrics
2. **🤖 BERT-LLM-KG Pipeline** - Run anonymization pipeline
3. **⚠️ High-Risk Register** - Risk stratification with clinical recommendations
4. **🧬 HIV Seroconversion** - HIV status analysis
5. **📈 PMTCT 5-Year Cascade** - PMTCT outcomes monitoring
6. **🔍 Explainable AI (SHAP)** - Feature importance explanations
7. **📊 Matrix** - Confusion matrix and knowledge graph visualizations
8. **📈 Detailed Metrics** - Comprehensive BERT, BIO, and NER metrics with charts
9. **✅ Model Validation** - NER evaluation and ML model training

---

## 11. Documentation

- **NER_EVALUATION_GUIDE.md** - Detailed guide for annotation workflow and NER evaluation
- **AUDIT_REPORT.md** - Scientific audit of evaluation pipeline
- **DEPLOYMENT_SUMMARY.md** - Deployment instructions and project structure
- **IMPLEMENTATION_DOCUMENTATION.md** - Technical implementation details

---

## 12. Testing

Run the automated test suite:

```bash
pytest tests/test_ner_evaluation.py
```

Current test results: 27 tests passing

---

## 13. License

This project is for research and educational purposes.

---

## 14. Citation

If you use this framework, please cite the original research paper.

---

## 15. Support

For issues or questions, please refer to the documentation files or create an issue in the repository.
