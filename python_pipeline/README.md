# Predictive Monitoring Model for HIV Indicators, High-Risk Pregnancies, Maternal and Neonatal Mortality Rates

A comprehensive predictive monitoring system for maternal-child health, including HIV indicators, high-risk pregnancy detection, and mortality rate prediction.

## Features

- **BERT-based NER** for PII detection
- **Manual annotation workflow** for ground-truth NER evaluation
- **Entity-level evaluation** with exact-span matching
- **LLM-style synthetic data generation** 
- **Knowledge Graph integration** with RDF triples
- **Clinical analysis** and risk stratification
- **ML model training** with SHAP explainability
- **Interactive dashboard** for data exploration

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Local Run

```bash
streamlit run app.py
```

### Deploy to Streamlit Cloud

1. Push this repository to GitHub
2. Go to [Streamlit Cloud](https://share.streamlit.io)
3. Connect your GitHub repository
4. Deploy the app

## Data Upload

The dashboard supports:
- **Upload Custom Dataset** - Upload your own CSV/Excel files
- **Use Sample Data** - Demonstrates functionality with sample data

## Privacy & Security

- No patient data is stored permanently
- Data is processed in session only
- Results are downloaded by the user
- PII is anonymized using BERT-based NER

## Workflow

1. **Upload your dataset** (CSV/Excel)
2. **Run BERT-LLM-KG Pipeline** to anonymize data
3. **Annotate PII entities** using the Annotation Workflow tab
4. **Run NER evaluation** to measure actual performance
5. **View evaluation metrics** (Precision, Recall, F1, Accuracy)
6. **Explore Knowledge Graph** with interactive visualizations
7. **Train ML model** on anonymized data
8. **View SHAP explanations** for feature importance

**Note**: NER evaluation requires manual annotations. See `NER_EVALUATION_GUIDE.md` for detailed instructions.

## License

This project is for research and educational purposes.

## Citation

If you use this framework, please cite the original research paper.

## Documentation

- **NER_EVALUATION_GUIDE.md** - Detailed guide for annotation workflow and NER evaluation
- **AUDIT_REPORT.md** - Scientific audit of evaluation pipeline
- **IMPLEMENTATION_DOCUMENTATION.md** - Technical implementation details
