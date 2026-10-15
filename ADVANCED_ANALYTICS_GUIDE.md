# Advanced Maternal, Neonatal, and HIV Health Analytics Dashboard

## Overview

This dashboard has been expanded to comprehensively capture critical HIV indicators, alongside maternal and neonatal mortality rates. The system handles fully anonymized data to ensure patient privacy while delivering actionable insights through three core functionalities.

## New Features

### 1. Risk Classification & Actionable Insights

**Purpose**: Automatically categorizes pregnancies into High, Moderate, or Low risk with evidence-based interventions.

**Features**:
- **WHO Risk Criteria**: Uses 9 evidence-based risk factors:
  - Age extremes (< 18 or > 35 years)
  - High parity (> 4)
  - HIV Positive status
  - Preterm birth (< 37 weeks)
  - Post-term birth (> 42 weeks)
  - Delivery complications
  - C-Section delivery
  - Low birth weight (< 2500g)
  - Poor ANC visits (< 4 visits)

- **Risk Levels**:
  - **High Risk** (3+ factors): Critical priority, immediate action required
  - **Moderate Risk** (2 factors): High priority, enhanced monitoring
  - **Low Risk** (0-1 factors): Medium priority, routine care

- **Actionable Insights**:
  - For High/Moderate risk: Detailed breakdown of risk factors with specific interventions
  - Evidence-based action steps for each risk factor
  - Priority-based recommendations
  - Follow-up scheduling guidance

**Dashboard Page**: "Risk Classification"

**Key Outputs**:
- Risk distribution summary (counts and percentages)
- Visual risk distribution chart
- Top risk factors ranking
- Detailed action steps for high/moderate risk cases
- Critical priority case alerts

---

### 2. Time-Series Trend Analysis

**Purpose**: Track pregnancy patterns, risk distributions, and health outcomes over specific months using advanced time-series modeling.

**Features**:
- **Flexible Time Periods**: Monthly, quarterly, or yearly analysis
- **Multiple Metrics**: Analyze trends for:
  - Age
  - Birth weight
  - Gestation
  - ANC visits
  - Other numeric health indicators

- **Trend Detection**:
  - Increasing trend (⚠️ potential concern)
  - Decreasing trend (✅ improvement)
  - Stable trend (📊 no significant change)

- **Statistical Significance**: Flags trends as significant or not based on sample size

**Dashboard Page**: "Trend Analysis"

**Key Outputs**:
- Trend data table with period, value, and trend direction
- Visual trend line chart with color-coded indicators
- Trend summary statistics (increasing/decreasing/stable counts)
- Insights on intervention impact over time

**Use Cases**:
- Assess the impact of new interventions
- Monitor long-term health outcomes
- Identify emerging patterns or concerns
- Evaluate program effectiveness

---

### 3. Mortality Root-Cause Analysis & Interventions

**Purpose**: Explicitly identify and classify major drivers of maternal and neonatal mortality with targeted, actionable solutions.

**Features**:
- **Maternal Mortality Drivers**:
  - Postpartum hemorrhage
  - Hypertensive disorders
  - Infection/sepsis
  - Obstructed labor
  - Anemia

- **Neonatal Mortality Drivers**:
  - Preterm birth
  - Birth asphyxia
  - Infection
  - Congenital anomalies

- **Evidence-Based Interventions**:
  - Each driver includes specific interventions
  - Evidence level rating (Strong, Moderate, Limited)
  - Expected reduction percentage (when available)

- **Actionable Solutions**:
  - Targeted interventions for each cause
  - Priority recommendations based on evidence
  - Implementation guidance

**Dashboard Page**: "Mortality Analysis"

**Key Outputs**:
- Mortality driver frequency table
- Percentage contribution of each driver
- Evidence level indicators
- Expected reduction estimates
- Detailed intervention lists for each driver
- Priority intervention recommendations
- Mortality rate calculations (per 1,000)

**Use Cases**:
- Identify primary causes of mortality
- Prioritize intervention implementation
- Understand evidence base for interventions
- Plan targeted quality improvement initiatives

---

## Implementation Details

### File Structure

```
D:\sarah\dashboard\
├── app.py                                    # Main dashboard (updated)
├── python_pipeline\
│   ├── advanced_analytics.py               # Core analytics engine (NEW)
│   ├── test_advanced_analytics.py          # Test suite (NEW)
│   ├── data_pipeline.py                    # Data processing (updated)
│   ├── run_notebook.py                     # Pipeline execution (updated)
│   └── ner_metrics.json                    # Metrics output (updated)
```

### How to Use

#### 1. Run the Analytics Pipeline

```bash
cd D:\sarah\dashboard\python_pipeline
python run_notebook.py
```

This will:
- Process the data
- Generate NER metrics (98% recall target)
- Save metrics to `ner_metrics.json`

#### 2. Start the Dashboard

```bash
cd D:\sarah\dashboard
streamlit run app.py
```

The dashboard will be available at `http://localhost:8501`

#### 3. Navigate to New Features

- **Risk Classification**: View risk categories and action steps
- **Trend Analysis**: Analyze time-series trends
- **Mortality Analysis**: Review mortality drivers and interventions

#### 4. Test the Analytics (Optional)

```bash
cd D:\sarah\dashboard\python_pipeline
python test_advanced_analytics.py
```

### Data Requirements

The analytics require the following columns in your dataset:

**For Risk Classification**:
- Age
- Parity
- HIV Status (P/N/KP/U)
- Gestation at Birth (Weeks)
- Delivery Complications (codes)
- Mode_of_Delivery
- Birth Weight (in grams)
- No. of ANC Visits

**For Trend Analysis**:
- Date columns (Date of Delivery, Date_of_Admission, Date of LMP)
- Numeric metric columns (Age, Birth Weight, Gestation, ANC Visits)

**For Mortality Analysis**:
- Mother's Status after Delivery (for maternal mortality)
- Live Birth / FSB / MSB (for neonatal mortality)

### Privacy Protection

All analytics work on **anonymized data**:
- Names replaced with synthetic data
- IDs randomized
- Dates generalized (day hidden)
- Locations anonymized
- No re-identification risk

## Testing Results

All advanced analytics features have been tested and validated:

```
✅ Risk Classification: PASSED
✅ Trend Analysis: PASSED
✅ Mortality Analysis: PASSED
```

Test output confirms:
- Risk classification correctly identifies risk factors
- Trend analysis processes time-series data
- Mortality analysis identifies drivers and provides interventions

## Dashboard Navigation

Updated navigation includes:
1. **Overview**: Framework summary and NER metrics
2. **NLP Metrics**: Detailed NER performance (98% recall target)
3. **Risk Classification**: NEW - Risk categorization and interventions
4. **Trend Analysis**: NEW - Time-series trend analysis
5. **Mortality Analysis**: NEW - Root-cause analysis and interventions
6. **Anonymization Results**: Anonymization strategy and results
7. **Knowledge Graph**: RDF triples and KG statistics
8. **Clinical Analysis**: High-risk classification and mortality trends
9. **Data Explorer**: Original data and visualizations

## Key Benefits

1. **Evidence-Based**: All risk criteria and interventions based on WHO guidelines
2. **Actionable**: Provides specific, implementable recommendations
3. **Privacy-First**: Works with fully anonymized data
4. **Comprehensive**: Covers maternal, neonatal, and HIV indicators
5. **User-Friendly**: Clear visualizations and intuitive interface
6. **Scalable**: Handles large datasets efficiently

## Future Enhancements

Potential future improvements:
- Machine learning-based risk prediction
- Real-time alert system for high-risk cases
- Integration with electronic health records
- Predictive analytics for mortality risk
- Automated intervention tracking
- Multi-facility comparison
- Geographic risk mapping

## Support

For issues or questions:
1. Check the test suite: `python test_advanced_analytics.py`
2. Review data requirements in this guide
3. Ensure dataset has required columns
4. Verify anonymization pipeline has run successfully

---

**Generated**: October 2026
**Version**: 1.0
**Framework**: BERT-LLM-KG Multi-layered Anonymization + Advanced Analytics
