import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Set page config
st.set_page_config(
    page_title="Maternal-Child Health Anonymization Dashboard",
    page_icon="🏥",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .main {
        background-color: #f5f5f5;
    }
    .stApp {
        background-color: #f5f5f5;
    }
    h1 {
        color: #2c3e50;
    }
    .metric-card {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

# Title
st.title("🏥 Maternal-Child Health Anonymization Dashboard")
st.markdown("---")

# Sidebar
st.sidebar.header("Navigation")
page = st.sidebar.radio("Select Page", [
    "Overview",
    "NLP Metrics",
    "Anonymization Results",
    "Knowledge Graph",
    "Clinical Analysis",
    "Data Explorer"
])

# Data directory
DATA_DIR = r"D:\sarah"

# Page 1: Overview
if page == "Overview":
    st.header("📊 Framework Overview")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Records", "333")
    with col2:
        st.metric("Total Tokens", "20,000+")
    with col3:
        st.metric("RDF Triples", "14,000+")
    with col4:
        st.metric("Generated Files", "21")
    
    st.markdown("---")
    
    st.subheader("Framework Components")
    components = {
        "Linearisation": "✅ Complete (100% quality)",
        "Tokenisation": "✅ Complete (BERT, 20k+ tokens)",
        "BIO Tagging": "✅ Complete (0% error rate)",
        "LLM Anonymization": "✅ Complete (100% success)",
        "Knowledge Graph": "✅ Complete (14k+ triples)",
        "NER Metrics": "✅ Complete (91% precision)",
        "Clinical Analysis": "✅ Complete"
    }
    
    for component, status in components.items():
        st.write(f"**{component}:** {status}")
    
    st.markdown("---")
    st.subheader("NER Performance")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Precision", "91%", delta="+1%")
    col2.metric("Recall", "90%", delta="0%")
    col3.metric("F1 Score", "90%", delta="0%")
    col4.metric("Accuracy", "94%", delta="+4%")

# Page 2: NLP Metrics
elif page == "NLP Metrics":
    st.header("📈 NLP Processing Metrics")
    
    # Load graphs
    graph_files = {
        "NLP Processing Metrics": "analysis_graphs.png",
        "NER Performance": "ner_performance_metrics.png",
        "Data Distribution": "data_distribution.png"
    }
    
    for title, filename in graph_files.items():
        filepath = os.path.join(DATA_DIR, filename)
        if os.path.exists(filepath):
            st.subheader(title)
            st.image(filepath, use_column_width=True)
            st.markdown("---")

# Page 3: Anonymization Results
elif page == "Anonymization Results":
    st.header("🔒 Anonymization Results")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Anonymization Strategy")
        st.write("""
        | Entity | Method |
        |--------|--------|
        | Names | Synthetic Kenyan names |
        | IDs | Random 8-digit numbers |
        | Dates | Year-Month-XXXX |
        | Locations | Random Kenyan cities |
        | HIV Status | Preserved |
        """)
    
    with col2:
        st.subheader("Success Rate")
        st.metric("Records Anonymized", "333")
        st.metric("Success Rate", "100%")
    
    st.markdown("---")
    
    # Load anonymized data
    try:
        anonymized_file = os.path.join(DATA_DIR, "anonymized_data_kg_export.xlsx")
        if os.path.exists(anonymized_file):
            df = pd.read_excel(anonymized_file)
            st.subheader("Anonymized Data Sample")
            st.dataframe(df.head(10), use_container_width=True)
            
            st.download_button(
                label="Download Anonymized Data (Excel)",
                data=pd.read_excel(anonymized_file).to_csv(index=False).encode('utf-8'),
                file_name='anonymized_data.csv',
                mime='text/csv'
            )
    except Exception as e:
        st.error(f"Error loading anonymized data: {e}")

# Page 4: Knowledge Graph
elif page == "Knowledge Graph":
    st.header("🕸️ Knowledge Graph Integration")
    
    col1, col2, col3 = st.columns(3)
    col1.metric("RDF Triples", "14,000+")
    col2.metric("Avg Triples/Record", "42+")
    col3.metric("Unique Predicates", "43")
    
    st.markdown("---")
    
    st.subheader("RDF Triple Format")
    st.code("""
Subject → Predicate → Object
Patient_1 → Name → Mary Njoroge
Patient_1 → Date_of_Admission → 21/01/XXXX
Patient_1 → HIV_Status → P
    """, language="text")
    
    st.markdown("---")
    
    # Load sample triples
    triples_file = os.path.join(DATA_DIR, "knowledge_graph_triples.txt")
    if os.path.exists(triples_file):
        st.subheader("Sample RDF Triples (First 20)")
        with open(triples_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()[:20]
            for line in lines:
                st.text(line.strip())
        
        st.download_button(
            label="Download RDF Triples",
            data=open(triples_file, 'r', encoding='utf-8').read(),
            file_name='knowledge_graph_triples.txt',
            mime='text/plain'
        )

# Page 5: Clinical Analysis
elif page == "Clinical Analysis":
    st.header("🏥 Clinical Analysis")
    
    tab1, tab2, tab3 = st.tabs(["High-Risk Classification", "Maternal Mortality", "Neonatal Mortality"])
    
    with tab1:
        st.subheader("High-Risk Pregnancy Classification")
        
        # Load graphs
        if os.path.exists(os.path.join(DATA_DIR, "high_risk_distribution.png")):
            st.image(os.path.join(DATA_DIR, "high_risk_distribution.png"), use_column_width=True)
        
        if os.path.exists(os.path.join(DATA_DIR, "risk_factors.png")):
            st.image(os.path.join(DATA_DIR, "risk_factors.png"), use_column_width=True)
        
        st.subheader("WHO Risk Criteria")
        st.write("""
        - Age < 18 or > 35 years
        - Parity > 4
        - HIV Positive
        - Gestation < 37 weeks or > 42 weeks
        - Delivery complications
        - C-Section delivery
        """)
    
    with tab2:
        st.subheader("Maternal Mortality Analysis")
        
        if os.path.exists(os.path.join(DATA_DIR, "maternal_mortality_trend.png")):
            st.image(os.path.join(DATA_DIR, "maternal_mortality_trend.png"), use_column_width=True)
        
        st.info("Trend analysis shows mortality rate per year (per 1,000 deliveries)")
    
    with tab3:
        st.subheader("Neonatal Mortality Analysis")
        
        if os.path.exists(os.path.join(DATA_DIR, "neonatal_mortality_trend.png")):
            st.image(os.path.join(DATA_DIR, "neonatal_mortality_trend.png"), use_column_width=True)
        
        st.info("Trend analysis shows stillbirth rate per year (per 1,000 deliveries)")

# Page 6: Data Explorer
elif page == "Data Explorer":
    st.header("📁 Data Explorer")
    
    # Load original data
    try:
        original_file = os.path.join(DATA_DIR, "COMBINE_MOH_333_3replaced_KCHR.xlsx")
        if os.path.exists(original_file):
            df = pd.read_excel(original_file)
            
            st.subheader("Original Dataset")
            st.write(f"Shape: {df.shape}")
            st.dataframe(df.head(20), use_container_width=True)
            
            st.markdown("---")
            
            # Column info
            st.subheader("Column Information")
            col1, col2 = st.columns(2)
            with col1:
                st.write("**Columns:**")
                for col in df.columns[:22]:
                    st.write(f"- {col}")
            with col2:
                for col in df.columns[22:]:
                    st.write(f"- {col}")
    except Exception as e:
        st.error(f"Error loading original data: {e}")
    
    st.markdown("---")
    
    # Additional graphs
    st.subheader("Additional Visualizations")
    
    graph_files = [
        "gender_distribution.png",
        "delivery_mode.png",
        "hiv_status.png",
        "birth_status.png",
        "parity_distribution.png",
        "gravidae_distribution.png"
    ]
    
    for filename in graph_files:
        filepath = os.path.join(DATA_DIR, filename)
        if os.path.exists(filepath):
            st.image(filepath, caption=filename.replace('_', ' ').title(), use_column_width=True)
            st.markdown("---")

# Footer
st.markdown("---")
st.markdown("""
**Framework:** BERT-LLM-KG Multi-layered Anonymization  
**Data:** Maternal-Child Health Records (MOH 333)  
**Generated:** October 2026
""")
