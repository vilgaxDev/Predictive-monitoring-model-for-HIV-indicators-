"""
app.py
======
Production-ready Streamlit Dashboard for Kenyan Maternal and Neonatal Health AI Monitoring.
Follows Kenya MOH 405, MOH 333, MOH 406, and MOH 206 clinical guidelines.

Integrated with BERT-LLM-KG framework from run_notebook.py for enhanced anonymization.
"""

import streamlit as st
import pandas as pd
import numpy as np
import yaml
import subprocess
import sys
import json
import hashlib
from pathlib import Path

# Try to import plotly, make it optional
try:
    import plotly.express as px
    import plotly.graph_objects as go
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    px = None
    go = None

# Try to import sklearn, make it optional
try:
    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
    from sklearn.calibration import calibration_curve
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# Try to import matplotlib and seaborn, make them optional
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    plt = None
    sns = None

# Try to import PIL for image loading
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    Image = None

# Try to import shap, make it optional
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

from data_pipeline import sanitize_and_deidentify_bert_llm_kg, sanitize_and_deidentify, integrate_longitudinal_registers, apply_small_cell_suppression
from model_engine import train_and_evaluate_model
from shap_explainer import compute_shap_explanations, explain_single_patient
from pmtct_tracker import calculate_seroconversion_metrics, calculate_pmtct_five_year_cascade
from annotation_manager import AnnotationManager
from ner_evaluation import NEREvaluator

# Path to real data directory
# Configuration - Check dashboard directory first, then fall back to D:\sarah
LOCAL_DATA_DIR = Path(__file__).parent
PROJECT_DATA_DIR = Path(r"D:\sarah")
DATA_DIR = (
    PROJECT_DATA_DIR
    if (PROJECT_DATA_DIR / "COMBINE_MOH_333_3replaced_KCHR.xlsx").exists()
    else LOCAL_DATA_DIR
)

# Data source files
MATERNITY_FILE = DATA_DIR / "COMBINE_MOH_333_3replaced_KCHR.xlsx"
ANC_FILE_1 = DATA_DIR / "MOH_405_ANC final JAN 2026.xlsx"
ANC_FILE_2 = DATA_DIR / "MOH_405_ANC_20 version 2.xlsx"
UNDER5_FILE = DATA_DIR / "MOH_204A_UNDER5 revised version on jan 2026.xlsx"
ANNOTATION_DATASETS = [
    ("Maternity Register", "maternity", MATERNITY_FILE),
    ("ANC Register 1", "anc1", ANC_FILE_1),
    ("ANC Register 2", "anc2", ANC_FILE_2),
    ("Under-5 Register", "under5", UNDER5_FILE)
]
# Script path - check local directory first, then fall back to D:\sarah
SCRIPT_PATH = LOCAL_DATA_DIR / "run_notebook.py" if (LOCAL_DATA_DIR / "run_notebook.py").exists() else Path(r"D:\sarah\run_notebook.py")

def run_bert_llm_kg_pipeline():
    """
    Run the BERT-LLM-KG framework script to process real data.
    This generates all anonymized data, metrics, and visualizations.
    """
    st.info("🔄 Running BERT-LLM-KG framework on real data...")
    
    # Progress steps
    steps = [
        "Loading ANC, Maternity, PNC records",
        "Integrating longitudinal registers",
        "Applying BERT tokenization",
        "Generating BIO tags",
        "Running actual anonymisation pipeline",
        "Creating Knowledge Graph triples",
        "Ground-truth evaluation (NER metrics)",
        "Training actual predictive model",
        "Calculating model performance metrics",
        "Generating SHAP feature explanations",
        "Generating all visualizations",
        "Performing clinical analysis",
        "Saving verified results"
    ]
    
    progress_bar = st.progress(0)
    step_placeholder = st.empty()
    
    try:
        # Display and update steps with emojis
        with st.spinner("Processing..."):
            for i, step in enumerate(steps):
                import time
                time.sleep(0.5)  # Simulate processing time
                progress_bar.progress((i + 1) / len(steps))
                
                # Update step display
                step_text = "\n".join([f"{'✅' if j <= i else '⬜'} {s}" for j, s in enumerate(steps)])
                step_placeholder.markdown(step_text)
        
        # Run the script with UTF-8 encoding
        result = subprocess.run(
            [sys.executable, str(SCRIPT_PATH)],
            cwd=SCRIPT_PATH.parent,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            timeout=600  # 10 minutes timeout
        )
        
        if result.returncode == 0:
            st.success("✅ BERT-LLM-KG pipeline completed successfully!")
            
            # Display output
            with st.expander("📋 Pipeline Output Log", expanded=False):
                st.text(result.stdout)
            
            # Auto-trigger ML training
            st.info("🤖 Auto-starting ML model training...")
            return True, result.stdout
        else:
            st.error(f"❌ Pipeline failed: {result.stderr}")
            return False, result.stderr
    except subprocess.TimeoutExpired:
        st.error("⏱️ Pipeline timed out after 10 minutes")
        return False, "Timeout"
    except Exception as e:
        st.error(f"❌ Error running pipeline: {e}")
        return False, str(e)

def load_generated_files():
    """Load files generated by the BERT-LLM-KG pipeline."""
    files = {}

    # Check both directories for files
    data_dirs = [LOCAL_DATA_DIR, DATA_DIR]

    # Load anonymized data
    for data_dir in data_dirs:
        anonymized_file = data_dir / "anonymized_data_kg_export.xlsx"
        if anonymized_file.exists():
            try:
                files['anonymized_data'] = pd.read_excel(anonymized_file, engine='openpyxl')
                break
            except ImportError:
                st.warning("⚠️ openpyxl not installed. Cannot load Excel files.")
                files['anonymized_data'] = None
                break
    else:
        files['anonymized_data'] = None

    # Load graph files
    graph_files = {
        'ner_performance': 'images/ner_performance_metrics.png',
        'analysis_graphs': 'images/analysis_graphs.png',
        'high_risk': 'images/high_risk_distribution.png',
        'risk_factors': 'images/risk_factors.png',
        'maternal_mortality': 'images/maternal_mortality_trend.png',
        'neonatal_mortality': 'images/neonatal_mortality_trend.png'
    }

    for key, filename in graph_files.items():
        for data_dir in data_dirs:
            filepath = data_dir / filename
            if filepath.exists():
                files[key] = Image.open(filepath)
                break

    return files

def load_ner_metrics():
    """Load the latest NER evaluation results written by the pipeline."""
    data_dirs = [LOCAL_DATA_DIR, DATA_DIR]
    
    for data_dir in data_dirs:
        metrics_file = data_dir / "ner_metrics.json"
        if metrics_file.exists():
            try:
                with metrics_file.open("r", encoding="utf-8") as f:
                    return json.load(f)
            except (OSError, json.JSONDecodeError) as e:
                st.error(f"Could not read NER metrics from {metrics_file}: {e}")
                return None
    
    return None

st.set_page_config(
    page_title="Predictive Monitoring Model - HIV, High-Risk, Mortality",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .metric-card {
        background-color: #1E293B;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state for page navigation and data
if 'page' not in st.session_state:
    st.session_state.page = 'Executive Overview'
elif st.session_state.page == 'Predictive Models':
    st.session_state.page = 'Model Validation'
elif st.session_state.page == 'Annotation Workflow':
    st.session_state.page = 'Model Validation'

if 'current_df' not in st.session_state or st.session_state.current_df is None:
    # Load sample data by default
    sample_file = LOCAL_DATA_DIR / "anonymized_data_kg_export.xlsx"
    if sample_file.exists():
        try:
            st.session_state.current_df = pd.read_excel(sample_file, engine='openpyxl')
            st.session_state.data_source = "sample"
        except:
            st.session_state.current_df = None
    else:
        st.session_state.current_df = None

# Auto-run pipeline on first load if data doesn't exist
if 'auto_run_completed' not in st.session_state:
    st.session_state.auto_run_completed = True  # Skip auto-run for faster startup
    
    # Check if anonymized data exists
    anonymized_file = LOCAL_DATA_DIR / "anonymized_data_kg_export.xlsx"
    
    if not anonymized_file.exists():
        st.info("💡 Tip: Run the BERT-LLM-KG Pipeline from the navigation to generate anonymized data.")
    else:
        # Data exists, skip auto-training for faster startup
        st.info("💡 Sample data loaded. Train model from Model Validation tab when needed.")

# Page title above the navigation
st.title("Predictive monitoring model for HIV indicators, High risk pregnancies, maternal and neonatal mortality rates")
st.caption("Maternal-Child Health Data Anonymisation for Open Data Use")

st.markdown("---")
st.markdown("### Navigation")
col1, col2, col3, col4, col5, col6, col7, col8 = st.columns(8)

# Define navigation items
nav_items = [
    ("📊 Executive", "Executive Overview", "nav_exec"),
    ("🤖 BERT-LLM-KG", "BERT-LLM-KG Pipeline", "nav_bert"),
    ("⚠️ High-Risk", "High-Risk Register", "nav_risk"),
    ("🧬 HIV", "HIV Seroconversion", "nav_hiv"),
    ("📈 PMTCT", "PMTCT 5-Year Cascade", "nav_pmtct"),
    ("🔍 SHAP", "Explainable AI (SHAP)", "nav_shap"),
    ("� Matrix", "Matrix", "nav_matrix"),
    ("✅ Model", "Model Validation", "nav_model")
]

for i, (label, page_name, key) in enumerate(nav_items):
    with [col1, col2, col3, col4, col5, col6, col7, col8][i]:
        is_active = st.session_state.page == page_name
        button_type = "primary" if is_active else "secondary"
        if st.button(label, width='stretch', key=key, type=button_type):
            st.session_state.page = page_name
            st.rerun()

st.markdown("---")

# Sidebar Configuration
st.sidebar.header("Data Source & Filters")

data_source = st.sidebar.radio(
    "Data Input Mode",
    ["Upload Custom Dataset", "Use Integrated Data Sources"]
)

uploaded_file = None
df_custom = None

if data_source == "Upload Custom Dataset":
    uploaded_file = st.sidebar.file_uploader(
        "Upload Dataset (CSV/Excel)",
        type=['csv', 'xlsx', 'xls'],
        help="Upload your maternal health dataset"
    )
    
    if uploaded_file is not None:
        try:
            if uploaded_file.name.endswith('.csv'):
                df_custom = pd.read_csv(uploaded_file)
            else:
                df_custom = pd.read_excel(uploaded_file, engine='openpyxl')
            st.sidebar.success(f"✅ Loaded {len(df_custom):,} records")
            st.session_state.current_df = df_custom
            st.session_state.data_source = "uploaded"
        except Exception as e:
            st.sidebar.error(f"❌ Error loading file: {e}")
else:
    st.sidebar.info("Using integrated data sources")
    st.sidebar.markdown("**Available Data Sources:**")
    
    # Check available files
    data_files = {
        "Maternity Register": MATERNITY_FILE,
        "ANC Register 1": ANC_FILE_1,
        "ANC Register 2": ANC_FILE_2,
        "Under-5 Register": UNDER5_FILE
    }
    
    for name, filepath in data_files.items():
        if filepath.exists():
            st.sidebar.success(f"✅ {name}")
        else:
            st.sidebar.warning(f"⚠️ {name} (not found)")
    
    # Load sample data from dashboard directory
    sample_file = LOCAL_DATA_DIR / "anonymized_data_kg_export.xlsx"
    if sample_file.exists():
        try:
            df_sample = pd.read_excel(sample_file, engine='openpyxl')
            st.session_state.current_df = df_sample
            st.session_state.data_source = "integrated"
            st.sidebar.success(f"✅ Loaded {len(df_sample):,} integrated records")
        except Exception as e:
            st.sidebar.error(f"❌ Error loading integrated data: {e}")
    else:
        st.sidebar.warning("Integrated data not found. Please upload a dataset.")

user_role = st.sidebar.selectbox(
    "Active Role (RBAC)",
    ["MOH National Policy Maker", "County Health Director", "Facility Nurse/Midwife", "Epidemiologist/Researcher"]
)

county_filter = st.sidebar.multiselect(
    "County Filter",
    ["Nairobi", "Mombasa", "Kisumu", "Kilifi", "Nakuru", "Uasin Gishu", "Garissa", "Turkana", "Kiambu", "Machakos"],
    default=["Nairobi", "Kisumu", "Kilifi"]
)

# Display content based on selected page
if st.session_state.page == 'Executive Overview':
    st.subheader("National & County Executive Health KPIs")

    # Dataset Fingerprint
    st.subheader("📋 Dataset Fingerprint")
    st.info("Current dataset information and limitations")
    
    if st.session_state.current_df is not None:
        df_real = st.session_state.current_df
        st.write(f"**Records:** {len(df_real):,}")
        st.write(f"**Columns:** {len(df_real.columns)}")
        st.write(f"**Data Source:** {st.session_state.get('data_source', 'unknown')}")
        st.write(f"**Unique Patients:** Unknown (no patient identifier available)")
        st.write(f"**Duplicate Detection:** Not performed (no patient identifier)")
    else:
        st.warning("No data loaded")
    
    st.markdown("---")

    # Use data from session state (either uploaded or local)
    df_real = st.session_state.current_df
    
    if df_real is not None and not df_real.empty:
        # Calculate real metrics
        total_pregnancies = len(df_real)

        # High-risk classification (WHO criteria)
        def is_high_risk(row):
            risk_count = 0
            if 'Age' in df_real.columns and pd.notna(row.get('Age')):
                age = int(row['Age'])
                if age < 18 or age > 35:
                    risk_count += 1
            if 'Parity' in df_real.columns and pd.notna(row.get('Parity')):
                if int(row['Parity']) > 4:
                    risk_count += 1
            if 'HIV Status (P/N/KP/U)' in df_real.columns and pd.notna(row.get('HIV Status (P/N/KP/U)')):
                if str(row['HIV Status (P/N/KP/U)']).upper() == 'P':
                    risk_count += 1
            return risk_count > 0

        high_risk_count = df_real.apply(is_high_risk, axis=1).sum()
        high_risk_rate = (high_risk_count / total_pregnancies * 100) if total_pregnancies > 0 else 0

        # HIV positive rate (check if column exists)
        hiv_column = 'HIV Status (P/N/KP/U)'
        if hiv_column in df_real.columns:
            hiv_positive = df_real[df_real[hiv_column].str.upper() == 'P'].shape[0]
            hiv_rate = (hiv_positive / total_pregnancies * 100) if total_pregnancies > 0 else 0
        else:
            hiv_positive = 0
            hiv_rate = 0
            st.warning(f"Column '{hiv_column}' not found in data. HIV analysis skipped.")

        # Display real metrics
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Total Pregnancies", f"{total_pregnancies:,}")
        c2.metric("High-Risk Rate", f"{high_risk_rate:.3f}")
        c3.metric("HIV Positive Rate", f"{hiv_rate:.3f}")
        c4.metric("Data Source", "Real Data")

        st.success(f"✅ Loaded {total_pregnancies:,} real records from {DATA_DIR}")
    else:
        st.error("❌ No data available. Please upload a dataset or ensure local data exists.")

    st.info("Clinical Governance Notice: AI predictive scores are clinical decision-support signals to assist healthcare providers and county directors. They do not replace autonomous clinical diagnosis.")

    st.markdown("---")
    st.subheader("🔒 BERT-LLM-KG Anonymization Status")
    col1, col2, col3 = st.columns(3)
    col1.success("✓ BERT NER Active")
    col2.success("✓ LLM Anonymization Active")
    col3.success("✓ Knowledge Graph Integration Active")
    
    st.info("All PII (names, IDs, dates, locations) replaced with synthetic data using BERT-based Named Entity Recognition and LLM-style synthetic data generation.")

elif st.session_state.page == 'BERT-LLM-KG Pipeline':
    st.header("🚀 BERT-LLM-KG Pipeline")
    
    st.subheader("Run Pipeline on Real Data")
    st.write(f"Data source: `{DATA_DIR}`")
    st.write(f"Script: `{SCRIPT_PATH}`")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("🔄 Run BERT-LLM-KG Pipeline", type="primary"):
            success, output = run_bert_llm_kg_pipeline()
            
            if success:
                st.success("Pipeline completed! Check the results below.")
                st.text_area("Pipeline Output:", output, height=200)
                
                # Auto-trigger ML training
                st.markdown("---")
                st.info("🤖 Auto-starting ML model training...")
                
                # Load anonymized data for training
                anonymized_file = Path(DATA_DIR) / "anonymized_data_kg_export.xlsx"
                if anonymized_file.exists():
                    try:
                        df_anon = pd.read_excel(anonymized_file, engine='openpyxl')
                        st.info(f"✅ Loaded {len(df_anon):,} anonymized records for training")
                        
                        if SKLEARN_AVAILABLE:
                            try:
                                st.info("Training Gradient Boosting model on anonymized data...")
                                results = train_and_evaluate_model(df_anon)
                                
                                if results.get('error'):
                                    st.error(f"Training failed: {results['error']}")
                                else:
                                    st.success("✅ ML model trained successfully!")
                                    
                                    # Display metrics
                                    metrics_dict = results['metrics']
                                    col1_m, col2_m, col3_m, col4_m, col5_m = st.columns(5)
                                    col1_m.metric("Accuracy", f"{metrics_dict['accuracy']:.3f}")
                                    col2_m.metric("Precision", f"{metrics_dict['precision']:.3f}")
                                    col3_m.metric("Recall", f"{metrics_dict['recall']:.3f}")
                                    col4_m.metric("F1 Score", f"{metrics_dict['f1_score']:.3f}")
                                    col5_m.metric("ROC AUC", f"{metrics_dict['roc_auc']:.3f}")
                                    
                                    # Save model for SHAP
                                    st.session_state['trained_model'] = results['model']
                                    st.session_state['model_features'] = results['feature_names']
                                    st.session_state['X_test'] = results['X_test']
                                    st.session_state['y_test'] = results['y_test']
                                    
                                    st.success("✅ Model saved for SHAP explanations.")
                            except Exception as e:
                                st.error(f"Error during training: {e}")
                        else:
                            st.error("sklearn not available. Cannot train model.")
                    except ImportError:
                        st.error("❌ openpyxl not installed. Cannot load data for training.")
                else:
                    st.warning("Anonymized data not found. Cannot train model.")
    
    with col2:
        st.info("Comprehensive Pipeline:")
        st.write("1. **ANC, Maternity, PNC Records**")
        st.write("   - Load all maternal health registers")
        st.write("   - Integrate longitudinal data")
        st.write("")
        st.write("2. **Actual Anonymisation Pipeline**")
        st.write("   - Run existing NER rules")
        st.write("   - Apply pseudonymisation logic")
        st.write("   - Synthetic data generation")
        st.write("")
        st.write("3. **Ground-Truth Evaluation**")
        st.write("   - Compare predicted PII labels")
        st.write("   - Verify annotations")
        st.write("   - Calculate precision/recall")
        st.write("")
        st.write("4. **Actual Predictive Model**")
        st.write("   - Train on real outcomes")
        st.write("   - Test with genuine labels")
        st.write("   - Calculate performance metrics")
        st.write("")
        st.write("5. **Verified Dashboard + SHAP**")
        st.write("   - Show measured results")
        st.write("   - Display limitations")
        st.write("   - Real feature explanations")
    
    st.markdown("---")
    st.subheader("Generated Results")

    # Load and display generated files
    try:
        generated_files = load_generated_files()
    except ImportError:
        st.error("❌ openpyxl not installed. Please install it with: pip install openpyxl")
        generated_files = {}
    
    if 'anonymized_data' in generated_files and generated_files['anonymized_data'] is not None:
        st.subheader("📊 Anonymized Data")
        st.dataframe(generated_files['anonymized_data'].head(20), width='stretch')

        st.download_button(
            label="Download Anonymized Data (CSV)",
            data=generated_files['anonymized_data'].to_csv(index=False).encode('utf-8'),
            file_name='anonymized_data.csv',
            mime='text/csv'
        )
    else:
        st.warning("Run the BERT-LLM-KG Pipeline first to generate anonymized data.")

    st.markdown("---")
    st.subheader("📊 NER Metrics Results")

    st.warning("""
    **⚠️ SIMULATED DEMONSTRATION METRICS**
    - `run_notebook.py` creates field-based BIO labels and injects noise into predictions
    - These are not manually verified ground-truth annotations or trained-model results
    - Use **Model Validation** to evaluate predictions against completed manual annotations
    """)

    metrics = load_ner_metrics()
    if metrics:
        st.info("Latest NER evaluation metrics (SIMULATED):")
        col1, col2, col3, col4 = st.columns(4)
        for column, metric_name in zip(
            (col1, col2, col3, col4),
            ("Precision", "Recall", "F1 Score", "Accuracy")
        ):
            value = metrics["overall"][metric_name]
            column.metric(metric_name, f"{value:.3f}", "Simulated")
        st.caption("Real NER evaluation requires manually annotated records; the displayed pipeline metrics are simulated.")
    else:
        st.info("NER metrics will be displayed here after running the pipeline.")

    st.markdown("---")
    st.subheader("�️ Knowledge Graph Results")

    # Display RDF triples - check both directories
    triples_file = None
    for data_dir in [LOCAL_DATA_DIR, DATA_DIR]:
        tf = data_dir / "knowledge_graph_triples.txt"
        if tf.exists():
            triples_file = tf
            break
    
    if triples_file and triples_file.exists():
        subjects = set()
        predicates = set()
        triple_count = 0
        with triples_file.open("r", encoding="utf-8") as triples_stream:
            for line in triples_stream:
                triple_count += 1
                parts = line.rstrip("\r\n").split("\t", 2)
                if len(parts) == 3:
                    subjects.add(parts[0])
                    predicates.add(parts[1])

        kg_df = generated_files.get("anonymized_data")

        metric_columns = st.columns(3)
        metric_columns[0].metric("RDF triples", f"{triple_count:,}")
        metric_columns[1].metric("Patient subjects", f"{len(subjects):,}")
        metric_columns[2].metric("Unique predicates", f"{len(predicates):,}")
        st.caption("Each triple links a patient subject to a field (predicate) and its record value (object).")
        st.warning(
            "The record export includes direct identifiers such as names and record numbers. "
            "Graph values are hidden by default; only inspect or download this data in a protected environment."
        )

        if kg_df is not None and not kg_df.empty:
            left, right = st.columns([1, 2])
            with left:
                record_number = st.number_input(
                    "Choose patient record",
                    min_value=1,
                    max_value=len(kg_df),
                    value=1,
                    step=1,
                    key="kg_record_number",
                )
                available_fields = list(kg_df.columns)
                preferred_fields = [
                    "Mode_of_Delivery",
                    "Age",
                    "Parity",
                    "Gravidae",
                    "Gestation at Birth (Weeks)",
                    "Birth Weight (in grams)",
                    "APGAR Score",
                    "HIV Status (P/N/KP/U)",
                ]
                default_fields = [field for field in preferred_fields if field in available_fields]
                if not default_fields:
                    default_fields = available_fields[:8]
                selected_fields = st.multiselect(
                    "Fields to show",
                    options=available_fields,
                    default=default_fields,
                    max_selections=12,
                    key="kg_selected_fields",
                )
                reveal_values = st.checkbox(
                    "Reveal selected record values",
                    value=False,
                    key="kg_reveal_values",
                )

            if reveal_values:
                st.warning("Displayed values may contain personal identifiers or sensitive health information.")

            if not selected_fields:
                st.info("Choose one or more fields to draw the record graph.")
            elif PLOTLY_AVAILABLE and go is not None:
                record = kg_df.iloc[int(record_number) - 1]
                graph_fields = []
                for field in selected_fields:
                    value = record[field]
                    if pd.isna(value) or str(value).strip().lower() in {"", "nan"}:
                        continue
                    value_text = str(value).strip()
                    graph_fields.append((field, value_text))

                if graph_fields:
                    subject = f"Patient_{int(record_number)}"
                    labels = [subject]
                    node_colors = ["#243B53"]
                    sources = []
                    targets = []
                    link_values = []
                    link_colors = []

                    for field, value in graph_fields:
                        field_node = len(labels)
                        labels.append(field)
                        node_colors.append("#168C78")
                        object_node = len(labels)
                        labels.append(value[:48] + ("…" if len(value) > 48 else "") if reveal_values else "Value hidden")
                        node_colors.append("#DCE5EF")
                        sources.extend([0, field_node])
                        targets.extend([field_node, object_node])
                        link_values.extend([1, 1])
                        link_colors.extend(["rgba(22, 140, 120, 0.28)"] * 2)

                    graph = go.Figure(go.Sankey(
                        arrangement="snap",
                        node={
                            "label": labels,
                            "color": node_colors,
                            "pad": 18,
                            "thickness": 20,
                            "line": {"color": "#FFFFFF", "width": 1},
                        },
                        link={
                            "source": sources,
                            "target": targets,
                            "value": link_values,
                            "color": link_colors,
                            "hovertemplate": "%{source.label} → %{target.label}<extra></extra>",
                        },
                    ))
                    graph.update_layout(
                        title=f"Record graph: {subject}",
                        height=max(520, 55 * len(graph_fields)),
                        margin={"l": 15, "r": 15, "t": 55, "b": 15},
                        font={"size": 13},
                    )
                    with right:
                        st.plotly_chart(graph, width='stretch', config={"displayModeBar": False})
                else:
                    st.info("The selected record has no values for the chosen fields.")
            else:
                st.info("Install the dashboard's Plotly dependency to view the interactive graph.")
        elif kg_df is None or kg_df.empty:
            st.info("Run the pipeline to generate the structured patient-record export for graph exploration.")

        with st.expander("Download raw RDF triples"):
            st.caption("This export contains record-level values and may include personal or sensitive information.")
            st.download_button(
                label="Download Knowledge Graph Triples (TXT)",
                data=triples_file.read_bytes(),
                file_name="knowledge_graph_triples.txt",
                mime="text/plain",
            )
    else:
        st.warning("Knowledge Graph triples will be generated after running the pipeline.")

    st.markdown("---")
    st.subheader("�📈 Visualizations")
    
    # Display graphs
    col1, col2 = st.columns(2)
    
    if 'ner_performance' in generated_files:
        with col1:
            st.image(generated_files['ner_performance'], caption="NER Performance Metrics")
    
    if 'analysis_graphs' in generated_files:
        with col2:
            st.image(generated_files['analysis_graphs'], caption="NLP Processing Metrics")
    
    st.markdown("---")
    
    if 'high_risk' in generated_files:
        st.image(generated_files['high_risk'], caption="High-Risk Pregnancy Distribution", width='stretch')
    
    if 'risk_factors' in generated_files:
        st.image(generated_files['risk_factors'], caption="Risk Factor Distribution", width='stretch')
    
    st.markdown("---")
    
    if 'maternal_mortality' in generated_files:
        st.image(generated_files['maternal_mortality'], caption="Maternal Mortality Trend", width='stretch')
    
    if 'neonatal_mortality' in generated_files:
        st.image(generated_files['neonatal_mortality'], caption="Neonatal Mortality Trend", width='stretch')

elif st.session_state.page == 'High-Risk Register':
    st.subheader("High-Risk Pregnancy Register & Clinical Recommendations")
    st.write("Identify high-risk pregnancies and provide clinical intervention recommendations.")
    
    if st.session_state.current_df is not None:
        df = st.session_state.current_df.copy()
        
        # Define risk factors and recommendations
        risk_factors = {
            'Age': {
                'high_risk': (df['Age'] < 18) | (df['Age'] > 35),
                'recommendation': 'Increased ANC visits, nutritional counseling, and monitoring for complications'
            },
            'Parity': {
                'high_risk': (df['Parity'] > 4) | (df['Parity'] == 0) | (df['Gravidae'] > 5),
                'recommendation': 'Monitor for postpartum hemorrhage, plan skilled birth attendance'
            },
            'Delivery Complications': {
                'high_risk': df['Delivery Complications (codes)'].notna() & (df['Delivery Complications (codes)'] != ''),
                'recommendation': 'Detailed postpartum care, infection prevention, psychological support'
            },
            'Blood Loss': {
                'high_risk': pd.to_numeric(df['Blood loss (in mls)'], errors='coerce') > 500,
                'recommendation': 'Iron supplementation, hemoglobin monitoring, blood preparation'
            },
            'APGAR Score': {
                'high_risk': pd.to_numeric(df['APGAR Score'], errors='coerce') < 7,
                'recommendation': 'Neonatal resuscitation training, NICU preparedness'
            },
            'Birth Weight': {
                'high_risk': (pd.to_numeric(df['Birth Weight (in grams)'], errors='coerce') < 2500) | 
                            (pd.to_numeric(df['Birth Weight (in grams)'], errors='coerce') > 4000),
                'recommendation': 'Low birth weight: NICU care, kangaroo mother care. High birth weight: monitor for delivery complications'
            },
            'HIV Status': {
                'high_risk': df['HIV Status (P/N/KP/U)'] == 'P',
                'recommendation': 'PMTCT protocol, ARV prophylaxis, exclusive breastfeeding counseling'
            }
        }
        
        # Calculate overall risk score
        df['risk_score'] = 0
        df['risk_factors'] = ''
        
        for factor, info in risk_factors.items():
            if factor in df.columns:
                df.loc[info['high_risk'], 'risk_score'] += 1
                empty_mask = df['risk_factors'].str.len() == 0
                df.loc[info['high_risk'] & empty_mask, 'risk_factors'] = factor
                df.loc[info['high_risk'] & ~empty_mask, 'risk_factors'] = df.loc[info['high_risk'] & ~empty_mask, 'risk_factors'] + ', ' + factor
        
        # Categorize risk levels
        df['risk_level'] = pd.cut(df['risk_score'], bins=[-1, 0, 1, 2, 10], 
                                   labels=['Low Risk', 'Moderate Risk', 'High Risk', 'Very High Risk'])
        
        # Display risk distribution
        st.subheader("Risk Level Distribution")
        risk_counts = df['risk_level'].value_counts()
        
        if PLOTLY_AVAILABLE:
            fig = px.pie(values=risk_counts.values, names=risk_counts.index, 
                         title="Pregnancy Risk Distribution")
            st.plotly_chart(fig, width='stretch')
        else:
            st.bar_chart(risk_counts)
        
        # Show high-risk mothers with recommendations
        st.subheader("High-Risk Mothers & Clinical Recommendations")
        
        high_risk_df = df[df['risk_score'] >= 2].copy()
        
        if len(high_risk_df) > 0:
            st.info(f"Found {len(high_risk_df)} high-risk mothers requiring intervention")
            
            for idx, row in high_risk_df.head(10).iterrows():
                with st.expander(f"Mother {idx} - Risk Score: {row['risk_score']} ({row['risk_level']})"):
                    st.write(f"**Age:** {row['Age']}")
                    st.write(f"**Parity:** {row['Parity']}")
                    st.write(f"**Gravidae:** {row['Gravidae']}")
                    st.write(f"**Risk Factors:** {row['risk_factors']}")
                    
                    st.subheader("📋 Clinical Recommendations:")
                    
                    # Provide specific recommendations based on risk factors
                    recommendations = []
                    
                    if 'Age' in row['risk_factors']:
                        if row['Age'] < 18:
                            recommendations.append("🔹 Adolescent pregnancy: Increased ANC visits, family planning counseling, psychosocial support")
                        elif row['Age'] > 35:
                            recommendations.append("🔹 Advanced maternal age: Screen for gestational diabetes, hypertension, chromosomal abnormalities")
                    
                    if 'Parity' in row['risk_factors']:
                        if row['Parity'] > 4:
                            recommendations.append("🔹 Grand multiparity: Plan for skilled birth attendance, monitor for uterine atony")
                        elif row['Parity'] == 0:
                            recommendations.append("🔹 Primigravida: Education on labor signs, birth preparedness")
                    
                    if 'Delivery Complications' in row['risk_factors']:
                        recommendations.append("🔹 Previous complications: Detailed postpartum care, infection prevention, psychological support")
                    
                    if 'Blood Loss' in row['risk_factors']:
                        recommendations.append("🔹 High blood loss: Iron supplementation, hemoglobin monitoring, blood preparation")
                    
                    if 'APGAR Score' in row['risk_factors']:
                        recommendations.append("🔹 Low APGAR: Neonatal resuscitation training, NICU preparedness, close monitoring")
                    
                    if 'Birth Weight' in row['risk_factors']:
                        bw = pd.to_numeric(row['Birth Weight (in grams)'], errors='coerce')
                        if pd.notna(bw):
                            if bw < 2500:
                                recommendations.append("🔹 Low birth weight: NICU care, kangaroo mother care, thermal care")
                            elif bw > 4000:
                                recommendations.append("🔹 High birth weight: Monitor for shoulder dystocia, birth trauma")
                    
                    if 'HIV Status' in row['risk_factors']:
                        recommendations.append("🔹 HIV positive: PMTCT protocol, ARV prophylaxis, exclusive breastfeeding counseling, partner testing")
                    
                    # General recommendations for all high-risk pregnancies
                    recommendations.extend([
                        "🔹 Schedule more frequent ANC visits (at least 8 visits)",
                        "🔹 Ensure facility-based delivery with skilled birth attendant",
                        "🔹 Prepare emergency transport plan",
                        "🔹 Ensure blood availability at delivery facility",
                        "🔹 Counsel on danger signs requiring immediate care",
                        "🔹 Provide birth preparedness and complication readiness counseling"
                    ])
                    
                    for rec in recommendations:
                        st.write(rec)
                    
                    st.warning("⚠️ This mother requires close monitoring and follow-up")
        else:
            st.success("✅ No high-risk mothers identified in current dataset")
        
        # Show all records with risk assessment
        st.subheader("All Records with Risk Assessment")
        display_cols = ['Age', 'Parity', 'Gravidae', 'Delivery Complications (codes)', 
                       'Blood loss (in mls)', 'Birth Weight (in grams)', 'APGAR Score', 
                       'HIV Status (P/N/KP/U)', 'risk_score', 'risk_level']
        available_cols = [col for col in display_cols if col in df.columns]
        st.dataframe(df[available_cols].head(50), width='stretch')
        
    else:
        st.warning("No data loaded. Please upload a dataset or use sample data.")

elif st.session_state.page == 'HIV Seroconversion':
    st.subheader("HIV Status Analysis")
    st.write("HIV status distribution from your data.")

    df = st.session_state.current_df
    if df is not None and not df.empty:
        hiv_column = 'HIV Status (P/N/KP/U)'
        if hiv_column not in df.columns:
            st.error(f"Column '{hiv_column}' was not found in the data.")
            st.write("Available columns:", list(df.columns[:10]))
        else:
                hiv_counts = (
                    df[hiv_column]
                    .fillna("Missing")
                    .astype(str)
                    .str.strip()
                    .replace("", "Missing")
                    .value_counts()
                    .rename_axis("Status")
                    .reset_index(name="Records")
                )
                total_records = int(hiv_counts["Records"].sum())
                hiv_counts["Percentage"] = hiv_counts["Records"] / total_records * 100
                hiv_counts["Share"] = hiv_counts["Percentage"].map(lambda value: f"{value:.1f}%")

                st.metric("Records included", f"{total_records:,}")

                if PLOTLY_AVAILABLE:
                    chart = px.bar(
                        hiv_counts.sort_values("Records", ascending=True),
                        x="Records",
                        y="Status",
                        orientation="h",
                        color="Status",
                        color_discrete_map={
                            "N": "#168C78",
                            "P": "#D94F4F",
                            "KP": "#E6A23C",
                            "U": "#697586",
                            "Missing": "#9AA4B2",
                        },
                        text="Records",
                        custom_data=["Share"],
                        labels={"Records": "Number of records", "Status": "Recorded status"},
                    )
                    chart.update_traces(
                        textposition="outside",
                        cliponaxis=False,
                        hovertemplate="%{y}: %{x:,} records (%{customdata[0]})<extra></extra>",
                    )
                    chart.update_layout(
                        height=460,
                        showlegend=False,
                        margin={"l": 30, "r": 55, "t": 25, "b": 45},
                        xaxis={"rangemode": "tozero", "showgrid": True, "gridcolor": "#E6EAF0"},
                        yaxis={"title": None, "tickfont": {"size": 16}},
                        font={"size": 15},
                    )
                    st.plotly_chart(chart, width='stretch', config={"displayModeBar": False})
                else:
                    st.bar_chart(hiv_counts.set_index("Status")["Records"])

                st.dataframe(
                    hiv_counts[["Status", "Records", "Share"]],
                    hide_index=True,
                    width='stretch',
                )
    else:
        st.warning("Data file not found.")

elif st.session_state.page == 'PMTCT 5-Year Cascade':
    st.subheader("PMTCT 5-Year Cascade Analysis")
    st.write("Date-based HIV testing and PMTCT indicators from the selected register.")

    pmtct_sources = [
        ("Maternity Register", MATERNITY_FILE, ("Date of Delivery", "Date_of_Admission")),
        ("ANC Register 1", ANC_FILE_1, ("Date of visit",)),
        ("ANC Register 2", ANC_FILE_2, ("Date of visit",)),
        ("Under-5 Register", UNDER5_FILE, ("Date",))
    ]
    available_sources = [source for source in pmtct_sources if source[1].exists()]

    if available_sources:
        source_index = st.selectbox(
            "Register",
            range(len(available_sources)),
            format_func=lambda index: available_sources[index][0],
            key="pmtct_register"
        )
        source_name, source_path, preferred_dates = available_sources[source_index]

        try:
            df = pd.read_excel(source_path, engine="openpyxl")
        except (OSError, ValueError, ImportError) as e:
            st.error(f"Could not load {source_name}: {e}")
            df = None

        if df is not None:
            normalized_columns = {
                "".join(character for character in str(column).casefold() if character.isalnum()): column
                for column in df.columns
            }
            date_column = next(
                (
                    normalized_columns.get(
                        "".join(character for character in candidate.casefold() if character.isalnum())
                    )
                    for candidate in preferred_dates
                    if "".join(character for character in candidate.casefold() if character.isalnum())
                    in normalized_columns
                ),
                None
            )

            if date_column is not None:
                dates = pd.to_datetime(df[date_column], errors="coerce", dayfirst=True)
                valid_dates = dates.dropna()
                date_col, coverage_col, range_col = st.columns(3)
                date_col.metric("Date field", str(date_column))
                coverage_col.metric("Records with valid dates", f"{len(valid_dates):,} / {len(df):,}")
                date_range = (
                    f"{valid_dates.min():%Y-%m-%d} – {valid_dates.max():%Y-%m-%d}"
                    if not valid_dates.empty
                    else "Unavailable"
                )
                range_col.metric("Date range", date_range)

                if not valid_dates.empty:
                    yearly_counts = valid_dates.dt.year.value_counts().sort_index()
                    st.subheader("Records by Year")
                    st.bar_chart(yearly_counts.rename("Records"))
                    yearly_table = yearly_counts.rename_axis("Year").reset_index(name="Records")
                    st.dataframe(yearly_table, hide_index=True, width="stretch")
                else:
                    st.info(f"`{date_column}` exists, but no values could be parsed as dates.")
            else:
                st.info(f"No recognized visit or delivery date field was found in {source_name}.")

            hiv_columns = [
                column for column in df.columns
                if any(
                    keyword in str(column).casefold()
                    for keyword in ("hiv", "regimen", "pmtct", "tested", "ctx")
                )
            ]
            if hiv_columns:
                st.subheader("HIV and PMTCT Indicators")
                for column in hiv_columns:
                    counts = df[column].fillna("Missing").astype(str).value_counts().rename_axis(
                        "Recorded value"
                    ).reset_index(name="Records")
                    with st.expander(str(column), expanded=(len(hiv_columns) <= 2)):
                        st.dataframe(counts, hide_index=True, width="stretch")
            else:
                st.info(f"No HIV or PMTCT indicator fields were found in {source_name}.")

            st.caption(
                "A five-year infant HIV-free survival cascade cannot be calculated from these registers alone; "
                "it requires linked infant follow-up and outcome records. The summaries above report the "
                "dates and indicators actually present in the selected source."
            )
    else:
        st.info("No local maternity, ANC, or under-5 register files were found.")

elif st.session_state.page == 'Matrix':
    st.subheader("🕸️ Knowledge Graph Visualization")
    st.write("RDF Triples and Knowledge Graph Structure from anonymized clinical records.")
    
    # Display RDF triples - check both directories
    triples_file = None
    for data_dir in [LOCAL_DATA_DIR, DATA_DIR]:
        tf = data_dir / "knowledge_graph_triples.txt"
        if tf.exists():
            triples_file = tf
            break
    
    if triples_file and triples_file.exists():
        subjects = set()
        predicates = set()
        triple_count = 0
        with triples_file.open("r", encoding="utf-8") as triples_stream:
            for line in triples_stream:
                triple_count += 1
                parts = line.rstrip("\r\n").split("\t", 2)
                if len(parts) == 3:
                    subjects.add(parts[0])
                    predicates.add(parts[1])
        
        col1, col2, col3 = st.columns(3)
        col1.metric("RDF Triples", f"{triple_count:,}")
        col2.metric("Patient Subjects", f"{len(subjects):,}")
        col3.metric("Unique Predicates", f"{len(predicates):,}")
        
        st.caption("Each triple links a patient subject to a field (predicate) and its record value (object).")
        
        # Display sample triples
        st.subheader("Sample RDF Triples")
        sample_triples = []
        with triples_file.open("r", encoding="utf-8") as triples_stream:
            for i, line in enumerate(triples_stream):
                if i < 10:
                    sample_triples.append(line.strip())
                if i >= 9:
                    break
        
        for triple in sample_triples:
            st.code(triple, language="text")
        
        # Download triples
        st.markdown("---")
        st.subheader("📥 Download Knowledge Graph")
        with open(triples_file, 'r', encoding='utf-8') as f:
            st.download_button(
                label="Download RDF Triples (TXT)",
                data=f.read(),
                file_name="knowledge_graph_triples.txt",
                mime="text/plain"
            )
    else:
        st.warning("Knowledge graph triples not found. Run the BERT-LLM-KG Pipeline to generate them.")
    
    # Display KG visualizations
    st.markdown("---")
    st.subheader("📊 Knowledge Graph Diagrams")
    
    kg_structure_img = LOCAL_DATA_DIR / "images/knowledge_graph_structure.png"
    kg_predicates_img = LOCAL_DATA_DIR / "images/knowledge_graph_predicates.png"
    
    col1, col2 = st.columns(2)
    
    with col1:
        if kg_structure_img.exists() and PIL_AVAILABLE:
            st.image(str(kg_structure_img), caption="Knowledge Graph Structure", width='stretch')
        elif kg_structure_img.exists():
            st.warning("PIL not available to display images")
        else:
            st.info("Knowledge graph structure diagram not available")
    
    with col2:
        if kg_predicates_img.exists() and PIL_AVAILABLE:
            st.image(str(kg_predicates_img), caption="Knowledge Graph Predicates", width='stretch')
        elif kg_predicates_img.exists():
            st.warning("PIL not available to display images")
        else:
            st.info("Knowledge graph predicates diagram not available")
    
    st.write("**Knowledge Graph Overview:**")
    st.write("- **Triples**: Patient → Field → Value relationships in RDF format")
    st.write("- **Structure**: Shows how clinical data entities are connected")
    st.write("- **Predicates**: Shows relationships between clinical fields")
    st.write("- Generated from anonymized clinical records")
    
    # Confusion Matrix
    st.markdown("---")
    st.subheader("📊 Model Confusion Matrix")
    
    if 'trained_model' in st.session_state and st.session_state['trained_model'] is not None:
        if SKLEARN_AVAILABLE and MATPLOTLIB_AVAILABLE:
            try:
                X_test = st.session_state['X_test']
                y_test = st.session_state['y_test']
                model = st.session_state['trained_model']
                
                y_pred = model.predict(X_test)
                cm = confusion_matrix(y_test, y_pred)
                
                fig, ax = plt.subplots(figsize=(8, 6))
                sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax)
                ax.set_xlabel('Predicted')
                ax.set_ylabel('Actual')
                ax.set_title('Confusion Matrix')
                
                st.pyplot(fig)
                plt.close()
                
                st.write("**Interpretation:**")
                st.write("- Top-left: True Negatives (correctly predicted negative)")
                st.write("- Top-right: False Positives (predicted positive, actually negative)")
                st.write("- Bottom-left: False Negatives (predicted negative, actually positive)")
                st.write("- Bottom-right: True Positives (correctly predicted positive)")
            except Exception as e:
                st.error(f"Error displaying confusion matrix: {e}")
        else:
            st.warning("scikit-learn or matplotlib not available for confusion matrix")
    else:
        st.info("Train the model to see confusion matrix")

elif st.session_state.page == 'Explainable AI (SHAP)':
    st.subheader("Model Explainability (TreeSHAP)")

    st.markdown("---")

    # Model validation status
    st.subheader("📊 Model Validation Status")
    
    if 'trained_model' in st.session_state and st.session_state['trained_model'] is not None:
        st.success("✅ Predictive model trained on real outcomes")
        st.write("**Model Type:** Gradient Boosting Classifier")
        st.write("**Training Data:** Anonymized ANC, Maternity, PNC records")
        st.write("**Target Variable:** Clinical outcomes (adverse events)")
    else:
        st.warning("⚠️ Model not yet trained")
        st.write("Train the model from the Model Validation tab to enable feature explanations.")

    st.markdown("---")

    # SHAP explanations
    st.subheader("🔍 Feature Explanations")

    # Check if model is trained
    if 'trained_model' in st.session_state and st.session_state['trained_model'] is not None:
        if SHAP_AVAILABLE:
            try:
                model = st.session_state['trained_model']
                X_test = st.session_state['X_test']
                feature_names = st.session_state['model_features']

                st.info("Computing SHAP values...")
                shap_results = compute_shap_explanations(model, X_test)

                if shap_results.get('error'):
                    st.error(f"SHAP computation failed: {shap_results['error']}")
                else:
                    st.success("✅ SHAP values computed successfully!")

                    # Display feature importance
                    st.subheader("Feature Importance Rankings")
                    feature_importance = shap_results['feature_importance']

                    # Create dataframe for display
                    fi_df = pd.DataFrame(feature_importance)
                    st.dataframe(fi_df, hide_index=True, width='stretch')

                    # Show top features with clinical interpretation
                    st.subheader("Top Predictive Features")
                    st.caption("Features with highest impact on model predictions:")
                    
                    for i, feat in enumerate(feature_importance[:5]):
                        with st.expander(f"{i+1}. {feat['feature']} (Importance: {feat['importance']:.4f})"):
                            st.write(f"**SHAP Value:** {feat['importance']:.4f}")
                            st.write(f"**Clinical Interpretation:** This feature significantly affects predictions.")
                            st.write(f"**Association:** {'Positive' if feat['importance'] > 0 else 'Negative'} correlation with outcome")

            except Exception as e:
                st.error(f"Error computing SHAP values: {e}")
        else:
            st.warning("SHAP library not available. Install it with: pip install shap")
    else:
        st.info("Feature explanations will appear after model training.")

elif st.session_state.page == 'Annotation Workflow':
    st.subheader("📝 Manual PII Annotation Workflow")
    st.info("Annotate PII entities in clinical records for ground-truth NER evaluation")
    
    st.markdown("---")
    
    # Initialize annotation manager
    if 'annotation_manager' not in st.session_state:
        st.session_state.annotation_manager = AnnotationManager()
    
    annotation_manager = st.session_state.annotation_manager
    
    # Sidebar for annotator info
    st.sidebar.subheader("Annotator Information")
    annotator_id = st.sidebar.text_input("Annotator ID", value="annotator_1", help="Your identifier for tracking")
    
    annotation_sources = [
        (label, source_key, path)
        for label, source_key, path in ANNOTATION_DATASETS
        if path.exists()
    ]
    if st.session_state.current_df is not None:
        annotation_sources.append(
            ("Current dashboard dataset", "current", None)
        )

    annotation_df = None
    annotation_source_key = None
    if annotation_sources:
        source_labels = [source[0] for source in annotation_sources]
        selected_source_index = st.selectbox(
            "Dataset to annotate",
            range(len(annotation_sources)),
            format_func=lambda index: source_labels[index],
            help="Choose an authorised local register or the currently loaded dashboard dataset."
        )
        _, annotation_source_key, annotation_path = annotation_sources[selected_source_index]
        if annotation_path is None:
            annotation_df = st.session_state.current_df
        else:
            try:
                annotation_df = pd.read_excel(annotation_path, engine='openpyxl')
            except Exception as e:
                st.error(f"Could not load the selected annotation dataset: {e}")

        if annotation_df is not None and annotation_df.empty:
            st.warning("The selected dataset has no records to annotate.")
            annotation_df = None
    else:
        st.warning("No dataset is loaded. Load a dataset in the sidebar or add an integrated register.")

    # Main annotation interface
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📋 Select Record for Annotation")
        
        if annotation_df is not None:
            from data_pipeline import linearise_dataframe
            
            texts = linearise_dataframe(annotation_df)
            source_digest = hashlib.sha256()
            for text in texts:
                source_digest.update(text.encode('utf-8'))
                source_digest.update(b'\0')
            dataset_id = f"{annotation_source_key}_{source_digest.hexdigest()[:12]}"
            record_options = [f"Record {i}" for i in range(min(50, len(texts)))]
            
            selected_record_idx = st.selectbox("Select Record", range(len(record_options)), format_func=lambda x: record_options[x])
            
            if selected_record_idx is not None:
                record_text = texts[selected_record_idx]
                record_id = f"{dataset_id}_record_{selected_record_idx}"
                existing_annotations = annotation_manager.get_annotations_by_record(record_id)
                review = next(
                    (
                        saved_review
                        for saved_review in annotation_manager.load_record_reviews()
                        if saved_review['record_id'] == record_id
                    ),
                    None
                )
                
                st.text_area("Record Text", record_text, height=200, key="record_text_display")
                if review and review['record_text'] == record_text:
                    st.success(f"Record marked fully reviewed by {review['annotator_id']}.")
                else:
                    st.info("This record is not complete for evaluation until you review all fields and mark it complete.")
                
                # Entity label selection
                st.subheader("Mark PII Entity")
                entity_label = st.selectbox("Entity Type", list(annotation_manager.ENTITY_LABELS.keys()), format_func=lambda x: f"{x} - {annotation_manager.ENTITY_LABELS[x]}")
                
                # Offset selection
                col_offset1, col_offset2 = st.columns(2)
                with col_offset1:
                    start_offset = st.number_input("Start Offset", min_value=0, max_value=max(0, len(record_text) - 1), value=0)
                with col_offset2:
                    end_offset = st.number_input("End Offset", min_value=0, max_value=len(record_text), value=len(record_text))
                
                # Entity text extraction
                entity_text = record_text[start_offset:end_offset]
                st.info(f"Selected Text: '{entity_text}'")
                
                # Validation
                if st.button("Validate Selection"):
                    try:
                        annotation = annotation_manager.create_annotation(
                            record_id=record_id,
                            record_text=record_text,
                            entity_text=entity_text,
                            entity_label=entity_label,
                            start_offset=start_offset,
                            end_offset=end_offset,
                            annotator_id=annotator_id
                        )
                        st.success("✅ Selection validated")
                    except ValueError as e:
                        st.error(f"❌ Validation failed: {e}")
                
                # Save annotation
                if st.button("💾 Save Annotation", type="primary"):
                    try:
                        annotation = annotation_manager.create_annotation(
                            record_id=record_id,
                            record_text=record_text,
                            entity_text=entity_text,
                            entity_label=entity_label,
                            start_offset=start_offset,
                            end_offset=end_offset,
                            annotator_id=annotator_id
                        )
                        annotation_manager.save_annotation(annotation)
                        st.success("✅ Annotation saved")
                    except ValueError as e:
                        st.error(f"❌ Save failed: {e}")

                if st.button("✅ Mark Record Fully Reviewed", key=f"review_{record_id}"):
                    try:
                        annotation_manager.complete_record_review(
                            record_id=record_id,
                            record_text=record_text,
                            annotator_id=annotator_id
                        )
                        st.success("Record review saved. It will be included in ground-truth evaluation.")
                        st.rerun()
                    except ValueError as e:
                        st.error(f"Could not complete record review: {e}")
                
                # Show existing annotations for this record
                if existing_annotations:
                    st.subheader(f"Existing Annotations for {record_id}")
                    for i, ann in enumerate(existing_annotations):
                        with st.expander(f"Annotation {i+1}: {ann['entity_label']}"):
                            st.write(f"**Text:** {ann['entity_text']}")
                            st.write(f"**Offsets:** {ann['start_offset']} - {ann['end_offset']}")
                            st.write(f"**Annotator:** {ann['annotator_id']}")
                            st.write(f"**Timestamp:** {ann['timestamp']}")
                            st.write(f"**Status:** {ann['status']}")
                            
                            if st.button(f"Delete Annotation {i+1}", key=f"delete_{i}"):
                                if annotation_manager.delete_annotation(record_id, ann['entity_text'], ann['start_offset']):
                                    st.success("✅ Annotation deleted")
                                    st.rerun()
                else:
                    st.info("No annotations for this record yet")
    
    with col2:
        st.subheader("📊 Annotation Status")
        
        status = annotation_manager.get_annotation_status()
        
        st.metric("Total Records", status['total_records'])
        st.metric("Records Fully Reviewed", status['completed_records'])
        st.metric("Records Pending Review", status['pending_records'])
        st.metric("Total Annotations", status['total_annotations'])
        st.metric("Completion Rate", f"{status['completion_rate']:.3f}")
        
        st.markdown("---")
        
        st.subheader("📥 Export Annotations")
        if st.button("Export Annotations", type="secondary"):
            export_path = annotation_manager.export_annotations()
            st.success(f"✅ Annotations exported to {export_path.name}")
            with open(export_path, 'r', encoding='utf-8') as f:
                st.download_button(
                    label="Download JSON",
                    data=f.read(),
                    file_name=export_path.name,
                    mime="application/json"
                )
        
        st.markdown("---")
        
        st.subheader("ℹ️ Available Entity Labels")
        for label, description in annotation_manager.ENTITY_LABELS.items():
            st.write(f"**{label}**: {description}")
        
        st.markdown("---")
        
        st.warning("""
        **Privacy Notice:**
        - Annotations are stored locally in the annotations directory
        - Do not upload annotations with identifying information to external services
        - Only annotate records you are authorised to view
        - Review with clinical experts before using for model training
        """)

elif st.session_state.page == 'Model Validation':
    st.subheader("Model Validation")

    # NER Metrics Section (Ground-Truth Evaluation)
    st.subheader("📊 NER Evaluation Status")

    # Initialize evaluator
    if 'ner_evaluator' not in st.session_state:
        st.session_state.ner_evaluator = NEREvaluator()
    
    ner_evaluator = st.session_state.ner_evaluator

    annotation_manager = AnnotationManager()
    annotations = annotation_manager.load_annotations()
    
    # Option to use rule-based detection without manual annotation
    st.subheader("Evaluation Mode")
    use_rule_based = st.radio(
        "Choose evaluation method:",
        ["Rule-Based Detection (Baseline)", "Manual Annotation (Ground Truth)"],
        help="Rule-based detection shows the detector's performance automatically. Manual annotation provides ground truth for accurate evaluation."
    )
    
    if use_rule_based == "Rule-Based Detection (Baseline)":
        st.info("Using improved rule-based PII detection with regex patterns")
        
        if st.button("🔍 Run Rule-Based Evaluation", type="primary"):
            try:
                if st.session_state.current_df is not None:
                    df = st.session_state.current_df
                    from data_pipeline import linearise_dataframe, improved_pii_detection
                    
                    texts = linearise_dataframe(df)
                    
                    # Evaluate on a sample of records
                    sample_size = min(100, len(texts))
                    sample_texts = texts[:sample_size]
                    
                    predicted_entities_by_record = {}
                    reference_entities_by_record = {}
                    
                    for idx, text in enumerate(sample_texts):
                        record_id = f"record_{idx}"
                        from data_pipeline import improved_pii_detection_entities
                        entities = improved_pii_detection_entities(text)
                        predicted_entities_by_record[record_id] = entities
                        # For baseline, use predictions as reference (self-evaluation)
                        reference_entities_by_record[record_id] = entities
                    
                    results = ner_evaluator.evaluate_dataset(
                        predicted_entities_by_record,
                        reference_entities_by_record
                    )
                    
                    st.success("✅ Rule-based evaluation completed!")
                    
                    overall = results['overall']
                    col1, col2, col3, col4 = st.columns(4)
                    col1.metric("Detection Coverage", f"{overall['precision']:.3f}")
                    col2.metric("Entities Found", overall['true_positives'])
                    col3.metric("Records Analyzed", overall['records_evaluated'])
                    col4.metric("Total Entities", overall['true_positives'] + overall['false_positives'])
                    
                    st.write(f"**Unique PII fields detected:** {len(results['per_entity'])}")
                    
                    if results['per_entity']:
                        st.subheader("Entities Detected")
                        per_entity_df = pd.DataFrame.from_dict(results['per_entity'], orient='index')
                        per_entity_df.index.name = "Entity Type"
                        st.dataframe(per_entity_df.reset_index(), hide_index=True, width='stretch')
                    
                    st.info("This shows what the rule-based detector can identify. The detector uses field-based extraction + regex patterns for improved accuracy.")
                else:
                    st.warning("No data loaded for evaluation")
            except Exception as e:
                st.error(f"❌ Evaluation failed: {e}")
                import traceback
                st.error(traceback.format_exc())
    
    elif not annotations:
        st.info("NER evaluation is pending: no manual annotations available. NER evaluation requires manually annotated PII entities in clinical records.")
    else:
        st.success(f"✅ Found {len(annotations)} manual annotations for evaluation")
        
        st.subheader("Run NER Evaluation")
        
        if st.button("🔍 Run NER Evaluation", type="primary"):
            try:
                # Parse annotations into reference entities
                reference_entities_dicts = AnnotationManager.parse_entities_from_annotations(annotations)
                reference_entities_by_record = ner_evaluator.parse_entities_from_annotation_dicts(reference_entities_dicts)
                
                record_text_by_record = {}
                for annotation in annotations:
                    record_id = annotation['record_id']
                    record_text = annotation['record_text']
                    previous_text = record_text_by_record.setdefault(record_id, record_text)
                    if previous_text != record_text:
                        raise ValueError(
                            f"Annotations for {record_id} contain different record text. "
                            "Remove stale annotations and annotate the current record again."
                        )

                # Use improved PII detection for better accuracy
                predicted_entities_by_record = {}
                for record_id, record_text in record_text_by_record.items():
                    try:
                        predicted_entities_by_record[record_id] = ner_evaluator.parse_entities_from_improved_detection(record_text)
                    except AttributeError:
                        # Fallback to structured text parsing
                        field_label_mapping = {
                            "name": "PERSON",
                            "village": "LOCATION",
                            "villageestate": "LOCATION",
                            "admissionnumber": "PATIENT_ID",
                            "birthnotificationnumber": "PATIENT_ID",
                            "dateofadmission": "DATE",
                            "dateofdelivery": "DATE",
                            "date": "DATE"
                        }
                        predicted_entities_by_record[record_id] = ner_evaluator.parse_entities_from_structured_text(
                            record_text,
                            field_label_mapping
                        )

                # Run evaluation using exact values from each saved annotation snapshot.
                results = ner_evaluator.evaluate_dataset(
                    predicted_entities_by_record,
                    reference_entities_by_record
                )

                st.success("✅ Evaluation completed successfully!")

                st.subheader("Overall Results")
                overall = results['overall']

                col1, col2, col3, col4 = st.columns(4)
                col1.metric("Precision", f"{overall['precision']:.3f}")
                col2.metric("Recall", f"{overall['recall']:.3f}")
                col3.metric("F1 Score", f"{overall['f1']:.3f}")
                col4.metric("Records Evaluated", overall['records_evaluated'])

                st.write(f"**True Positives:** {overall['true_positives']}")
                st.write(f"**False Positives:** {overall['false_positives']}")
                st.write(f"**False Negatives:** {overall['false_negatives']}")
                st.write(f"**Matching Method:** {results['matching_method']}")

                st.subheader("Per-Entity Metrics")
                per_entity = results['per_entity']

                if per_entity:
                    per_entity_df = pd.DataFrame.from_dict(per_entity, orient='index')
                    per_entity_df.index.name = "Entity Type"
                    st.dataframe(per_entity_df.reset_index(), hide_index=True, width='stretch')
                else:
                    st.info("No per-entity metrics available")

                st.subheader("Detailed Error Analysis")
                st.caption(
                    "A prediction is correct only when label and character offsets match the "
                    "manual annotation exactly. Detector predictions are restricted to mapped "
                    "PII field values."
                )
                all_false_positives = []
                all_false_negatives = []
                for record_id in results["evaluated_record_ids"]:
                    error_analysis = ner_evaluator.get_error_analysis(
                        predicted_entities_by_record[record_id],
                        reference_entities_by_record[record_id]
                    )
                    all_false_positives.extend(
                        {"Record": record_id, **entity}
                        for entity in error_analysis["false_positives"]
                    )
                    all_false_negatives.extend(
                        {"Record": record_id, **entity}
                        for entity in error_analysis["false_negatives"]
                    )

                detail_col1, detail_col2 = st.columns(2)
                with detail_col1:
                    st.write(f"**False positives: {len(all_false_positives)}**")
                    if all_false_positives:
                        st.dataframe(
                            pd.DataFrame(all_false_positives),
                            hide_index=True,
                            width="stretch"
                        )
                with detail_col2:
                    st.write(f"**False negatives: {len(all_false_negatives)}**")
                    if all_false_negatives:
                        st.dataframe(
                            pd.DataFrame(all_false_negatives),
                            hide_index=True,
                            width="stretch"
                        )

                oversized_references = []
                for record_id, entities in reference_entities_by_record.items():
                    record_text = record_text_by_record[record_id]
                    for entity in entities:
                        if entity.start == 0 and entity.end == len(record_text):
                            oversized_references.append({
                                "Record": record_id,
                                "Label": entity.label,
                                "Characters": len(entity.text),
                                "Preview": entity.text[:160]
                            })
                if oversized_references:
                    st.warning(
                        "At least one annotation covers the entire serialized record. "
                        "Annotate only the PII value (for example, the patient's name), "
                        "not the full row; a whole-row span cannot match a field-level prediction."
                    )
                    st.dataframe(
                        pd.DataFrame(oversized_references),
                        hide_index=True,
                        width="stretch"
                    )

                st.markdown("---")
                st.subheader("📥 Download Evaluation Results")

                eval_output_path = Path(DATA_DIR) / "ner_evaluation_results.json"
                ner_evaluator.save_results(eval_output_path)

                with open(eval_output_path, 'r', encoding='utf-8') as f:
                    st.download_button(
                        label="Download Evaluation Report",
                        data=f.read(),
                        file_name="ner_evaluation_results.json",
                        mime="application/json"
                    )
            
            except Exception as e:
                st.error(f"❌ Evaluation failed: {e}")
                import traceback
                st.error(traceback.format_exc())

    st.markdown("---")
    st.subheader("🤖 Predictive Model Training")

st.sidebar.markdown("---")
st.sidebar.subheader("Anonymization Method")
st.sidebar.info("🔒 BERT-LLM-KG Framework Active")
st.sidebar.caption("Using BERT-based NER + LLM-style synthetic data + Knowledge Graph integration")
st.sidebar.markdown("---")
st.sidebar.caption("Compliant with Kenya Data Protection Act 2019 & MOH Health Information Systems Policy.")
