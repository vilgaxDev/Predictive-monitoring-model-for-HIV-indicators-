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

# Helper function to display mortality drivers
def display_mortality_drivers(drivers_data, mortality_type):
    """Display mortality drivers with interventions."""
    if drivers_data:
        # Display drivers table
        drivers_df = pd.DataFrame(drivers_data)
        st.dataframe(drivers_df[['cause', 'frequency', 'percentage', 'evidence_level']], 
                     use_container_width=True, hide_index=True)
        
        st.markdown("---")
        
        # Detailed interventions for each driver
        st.subheader("🎯 Targeted Interventions by Cause")
        
        for driver in drivers_data:
            with st.expander(f"{driver['cause']} - {driver['percentage']:.1f}%"):
                st.write(f"**Frequency:** {driver['frequency']} cases")
                st.write(f"**Evidence Level:** {driver['evidence_level']}")
                if driver['expected_reduction']:
                    st.write(f"**Expected Reduction:** {driver['expected_reduction'][0]}-{driver['expected_reduction'][1]}%")
                
                st.write("**Recommended Interventions:**")
                for i, intervention in enumerate(driver['interventions'], 1):
                    st.write(f"{i}. {intervention}")
                
                if driver['evidence_level'] == 'Strong':
                    st.success("✅ Strong evidence - High priority for implementation")
                elif driver['evidence_level'] == 'Moderate':
                    st.warning("⚠️ Moderate evidence - Consider with local context")
                else:
                    st.info("ℹ️ Limited evidence - May need additional research")
        
        st.markdown("---")
        
        # Overall intervention recommendations
        st.subheader("📋 Priority Intervention Recommendations")
        
        st.info("""
        **Implementation Priority:**
        1. Focus on interventions with **Strong evidence** and **High expected reduction**
        2. Consider resource availability and local context
        3. Monitor implementation and measure impact
        4. Adapt interventions based on ongoing evaluation
        """)
        
        # Top 3 priority interventions
        sorted_drivers = sorted(drivers_data, key=lambda x: x['expected_reduction'][0] if x['expected_reduction'] else 0, reverse=True)
        
        st.write("🎯 **Top 3 Priority Interventions:**")
        for i, driver in enumerate(sorted_drivers[:3], 1):
            st.write(f"{i}. **{driver['cause']}** - Expected reduction: {driver['expected_reduction'][0]}-{driver['expected_reduction'][1]}%")
            st.write(f"   - First intervention: {driver['interventions'][0]}")
            st.write("")
    else:
        st.info(f"No {mortality_type.lower()} mortality data available for analysis")

# Title
st.title("🏥 Maternal-Child Health Anonymization Dashboard")
st.markdown("---")

# Sidebar
st.sidebar.header("Navigation")
page = st.sidebar.radio("Select Page", [
    "Overview",
    "Risk Classification",
    "Trend Analysis",
    "Mortality Analysis",
    "Anonymization Results",
    "Knowledge Graph",
    "Clinical Analysis"
])

# Data directory
DATA_DIR = r"D:\sarah"

# Page 1: Overview
if page == "Overview":
    st.header("📊 Advanced Maternal, Neonatal, and HIV Health Analytics Dashboard")
    
    # Pipeline Runner Section
    st.markdown("---")
    st.subheader("🔄 BERT-LLM-KG Pipeline Execution")
    
    # Check if pipeline has been run
    pipeline_status_file = os.path.join(DATA_DIR, "python_pipeline", "pipeline_status.json")
    
    # Initialize session state to track if pipeline has run this session
    if 'pipeline_run_this_session' not in st.session_state:
        st.session_state.pipeline_run_this_session = False
    
    # Check status file
    pipeline_status = 'not_run'
    last_run = 'Never'
    
    if os.path.exists(pipeline_status_file):
        import json
        with open(pipeline_status_file, 'r', encoding='utf-8') as f:
            status_data = json.load(f)
            pipeline_status = status_data.get('status', 'not_run')
            last_run = status_data.get('last_run', 'Never')
    
    # Auto-run on first load of Overview page if not run this session
    if not st.session_state.pipeline_run_this_session:
        st.info("🔄 Running BERT-LLM-KG Pipeline on Real Data...")
        st.session_state.pipeline_run_this_session = True
        
        # Run the pipeline
        import subprocess
        import sys
        pipeline_script = os.path.join(DATA_DIR, "python_pipeline", "run_notebook.py")
        
        try:
            with st.spinner("Processing data with BERT-LLM-KG Pipeline... This may take a few minutes."):
                result = subprocess.run(
                    [sys.executable, pipeline_script],
                    cwd=os.path.join(DATA_DIR, "python_pipeline"),
                    capture_output=True,
                    text=True,
                    timeout=600  # 10 minutes timeout
                )
            
            if result.returncode == 0:
                st.success("✅ BERT-LLM-KG Pipeline completed successfully!")
                pipeline_status = 'completed'
                
                # Update status file
                status_data = {
                    'last_run': pd.Timestamp.now().isoformat(),
                    'status': 'completed'
                }
                with open(pipeline_status_file, 'w', encoding='utf-8') as f:
                    json.dump(status_data, f, indent=2)
                
                # Show some output
                if result.stdout:
                    with st.expander("View Pipeline Output"):
                        st.text(result.stdout[-2000:])  # Last 2000 chars
            else:
                st.error("❌ BERT-LLM-KG Pipeline encountered errors")
                pipeline_status = 'error'
                if result.stderr:
                    with st.expander("View Error Details"):
                        st.text(result.stderr[-2000:])
        except subprocess.TimeoutExpired:
            st.error("⏱️ Pipeline timed out after 10 minutes")
            pipeline_status = 'timeout'
        except Exception as e:
            st.error(f"❌ Error running pipeline: {e}")
            pipeline_status = 'error'
    
    # Manual run button
    col1, col2 = st.columns([1, 3])
    with col1:
        if st.button("🔄 Run BERT-LLM-KG Pipeline", type="primary"):
            # Force rerun by deleting status file
            if os.path.exists(pipeline_status_file):
                os.remove(pipeline_status_file)
            st.session_state.pipeline_run_this_session = False
            st.rerun()
    
    with col2:
        if pipeline_status == 'completed':
            st.success(f"✅ Last run: {last_run}")
        elif pipeline_status == 'error':
            st.error(f"❌ Last run: {last_run} (failed)")
        elif pipeline_status == 'timeout':
            st.warning(f"⏱️ Last run: {last_run} (timeout)")
        else:
            st.info(f"Last run: {last_run}")
    
    st.markdown("---")
    
    st.markdown("""
    **AI-driven explanatory dashboard for comprehensive health analytics**
    
    This dashboard provides three core functionalities for anonymized maternal and neonatal health data:
    - ⚠️ **Risk Classification & Actionable Insights**: Automatic categorization with evidence-based interventions
    - 📈 **Time-Series Trend Analysis**: Track patterns and assess intervention impact over time
    - 💀 **Mortality Root-Cause Analysis**: Identify drivers and prescribe targeted solutions
    """)
    
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
    
    # Processing Metrics
    st.subheader("📊 Processing Metrics")
    col1, col2, col3 = st.columns(3)
    col1.metric("Linearisation Quality", "100%")
    col2.metric("Tokenisation", "BERT")
    col3.metric("BIO Tagging", "Rule-Based")
    
    st.markdown("---")
    
    st.subheader("🎯 Core Features")
    
    st.info("""
    **Risk Classification & Actionable Insights**
    
    The system automatically categorizes pregnancies into High, Moderate, or Low risk based on WHO criteria:
    - Age extremes (< 18 or > 35 years)
    - High parity (> 4)
    - HIV Positive status
    - Preterm/post-term birth
    - Delivery complications
    - C-Section delivery
    - Low birth weight
    - Poor ANC visits
    
    For high and moderate risk pregnancies, the AI provides:
    - Detailed breakdown of primary risk factors
    - Evidence-based action steps
    - Priority-based recommendations
    """)
    
    st.markdown("---")
    
    st.info("""
    **Time-Series Trend Analysis**
    
    Utilizing advanced time-series modeling, users can:
    - Track pregnancy patterns over months
    - Monitor risk distributions
    - Analyze health outcomes
    - Assess intervention impact over time
    
    Features:
    - Monthly, quarterly, yearly analysis
    - Multiple metrics (Age, Birth Weight, Gestation, ANC Visits)
    - Trend detection (Increasing/Decreasing/Stable)
    - Statistical significance assessment
    """)
    
    st.markdown("---")
    
    st.info("""
    **Mortality Root-Cause Analysis & Interventions**
    
    The dashboard identifies and classifies major drivers:
    
    **Maternal Mortality:**
    - Postpartum hemorrhage
    - Hypertensive disorders
    - Infection/sepsis
    - Obstructed labor
    - Anemia
    
    **Neonatal Mortality:**
    - Preterm birth
    - Birth asphyxia
    - Infection
    - Congenital anomalies
    
    For each driver, the dashboard provides:
    - Frequency and percentage
    - Evidence level (Strong/Moderate/Limited)
    - Expected reduction estimates
    - Targeted intervention recommendations
    """)
    
    st.markdown("---")
    
    # Show data distribution graphs
    st.subheader("📊 Data Distribution Graphs")
    
    graph_files = [
        "analysis_graphs.png",
        "data_distribution.png",
        "gender_distribution.png",
        "delivery_mode.png",
        "hiv_status.png"
    ]
    
    graphs_found = False
    for filename in graph_files:
        filepath = os.path.join(DATA_DIR, filename)
        if os.path.exists(filepath):
            st.image(filepath, caption=filename.replace('_', ' ').title(), use_column_width=True)
            st.markdown("---")
            graphs_found = True
    
    if not graphs_found:
        st.info("No graphs available yet. Run the evaluation to generate graphs.")

# Page 2: Risk Classification
elif page == "Risk Classification":
    st.header("⚠️ Risk Classification & Actionable Insights")
    
    # Try to load pre-computed risk summary first
    risk_summary_file = os.path.join(DATA_DIR, "python_pipeline", "risk_summary.json")
    
    if os.path.exists(risk_summary_file):
        import json
        with open(risk_summary_file, 'r', encoding='utf-8') as f:
            risk_summary = json.load(f)
        
        st.success("✅ Using pre-computed risk classification results")
        
        # Display summary
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Total Pregnancies", risk_summary['total_pregnancies'])
        col2.metric("High Risk", f"{risk_summary['high_risk_count']} ({risk_summary['high_risk_percentage']:.1f}%)")
        col3.metric("Moderate Risk", f"{risk_summary['moderate_risk_count']} ({risk_summary['moderate_risk_percentage']:.1f}%)")
        col4.metric("Low Risk", f"{risk_summary['low_risk_count']} ({risk_summary['low_risk_percentage']:.1f}%)")
        
        st.markdown("---")
        
        # Risk distribution chart
        st.subheader("Risk Distribution")
        import matplotlib.pyplot as plt
        
        fig, ax = plt.subplots(figsize=(10, 6))
        risk_counts = [risk_summary['low_risk_count'], risk_summary['moderate_risk_count'], risk_summary['high_risk_count']]
        risk_labels = ['Low Risk', 'Moderate Risk', 'High Risk']
        colors = ['#2ecc71', '#f39c12', '#e74c3c']
        
        bars = ax.bar(risk_labels, risk_counts, color=colors)
        ax.set_ylabel('Count')
        ax.set_title('Risk Classification Distribution')
        
        for bar, count in zip(bars, risk_counts):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{count}\n({count/risk_summary["total_pregnancies"]*100:.1f}%)',
                   ha='center', va='bottom', fontweight='bold')
        
        st.pyplot(fig)
        plt.close()
        
        st.markdown("---")
        
        # Top risk factors
        st.subheader("📊 Most Common Risk Factors")
        if risk_summary['top_risk_factors']:
            factors_df = pd.DataFrame(risk_summary['top_risk_factors'], columns=['Risk Factor', 'Count'])
            st.dataframe(factors_df, use_container_width=True, hide_index=True)
        
        st.markdown("---")
        
        # Load detailed risk-classified data
        risk_data_file = os.path.join(DATA_DIR, "python_pipeline", "risk_classified_data.xlsx")
        if os.path.exists(risk_data_file):
            df_with_risks = pd.read_excel(risk_data_file)
            
            # High and moderate risk cases with action steps
            st.subheader("🚨 High & Moderate Risk Cases with Action Steps")
            
            high_moderate = df_with_risks[df_with_risks['risk_level'].isin(['High', 'Moderate'])].copy()
            
            if len(high_moderate) > 0:
                # Show top 20 high/moderate risk cases
                display_cols = ['risk_level', 'risk_factors', 'priority', 'action_steps']
                available_cols = [col for col in display_cols if col in high_moderate.columns]
                
                st.dataframe(
                    high_moderate[available_cols].head(20),
                    use_container_width=True,
                    hide_index=True
                )
                
                st.info(f"Showing 20 of {len(high_moderate)} high/moderate risk cases")
                
                # Detailed action steps for critical cases
                st.markdown("---")
                st.subheader("🎯 Critical Priority Cases - Immediate Action Required")
                
                critical = high_moderate[high_moderate['priority'] == 'Critical']
                if len(critical) > 0:
                    for idx, row in critical.head(5).iterrows():
                        with st.expander(f"Case {idx + 1} - {row['risk_level']} Risk"):
                            st.write(f"**Risk Factors:** {row['risk_factors']}")
                            st.write(f"**Confidence:** {row['confidence']:.2%}")
                            st.write("**Action Steps:**")
                            for step in row['action_steps'].split(';'):
                                st.write(f"- {step.strip()}")
                else:
                    st.info("No critical priority cases")
            else:
                st.success("✅ No high or moderate risk cases detected")
        
        st.markdown("---")
        
        # WHO Risk Criteria Reference
        st.subheader("📋 WHO Risk Criteria Reference")
        st.info("""
        **High-Risk Pregnancy Criteria (WHO):**
        - Age < 18 or > 35 years
        - Parity > 4
        - HIV Positive
        - Gestation < 37 weeks (preterm) or > 42 weeks (post-term)
        - Delivery complications present
        - C-Section delivery
        - Birth weight < 2500g
        - Less than 4 ANC visits
        
        **Risk Levels:**
        - **High Risk**: 3+ risk factors - Immediate action required
        - **Moderate Risk**: 2 risk factors - Enhanced monitoring
        - **Low Risk**: 0-1 risk factors - Routine care
        """)
    
    else:
        # Fallback: run analytics live
        st.info("No pre-computed results found. Running live analysis...")
        
        # Load analytics module
        import sys
        sys.path.append(os.path.join(DATA_DIR, "python_pipeline"))
        from advanced_analytics import AdvancedHealthAnalytics
        
        # Load data
        try:
            data_file = os.path.join(DATA_DIR, "COMBINE_MOH_333_3replaced_KCHR.xlsx")
            if os.path.exists(data_file):
                df = pd.read_excel(data_file)
                
                # Initialize analytics
                analytics = AdvancedHealthAnalytics()
                
                # Classify risks
                st.subheader("🎯 Risk Classification Results")
                
                # Add risk classifications
                df_with_risks = analytics.classify_all_risks(df)
                
                # Summary statistics
                summary = analytics.generate_risk_summary(df_with_risks)
                
                col1, col2, col3, col4 = st.columns(4)
                col1.metric("Total Pregnancies", summary['total_pregnancies'])
                col2.metric("High Risk", f"{summary['high_risk_count']} ({summary['high_risk_percentage']:.1f}%)")
                col3.metric("Moderate Risk", f"{summary['moderate_risk_count']} ({summary['moderate_risk_percentage']:.1f}%)")
                col4.metric("Low Risk", f"{summary['low_risk_count']} ({summary['low_risk_percentage']:.1f}%)")
                
                st.markdown("---")
                
                # Risk distribution chart
                st.subheader("Risk Distribution")
                import matplotlib.pyplot as plt
                
                fig, ax = plt.subplots(figsize=(10, 6))
                risk_counts = [summary['low_risk_count'], summary['moderate_risk_count'], summary['high_risk_count']]
                risk_labels = ['Low Risk', 'Moderate Risk', 'High Risk']
                colors = ['#2ecc71', '#f39c12', '#e74c3c']
                
                bars = ax.bar(risk_labels, risk_counts, color=colors)
                ax.set_ylabel('Count')
                ax.set_title('Risk Classification Distribution')
                
                for bar, count in zip(bars, risk_counts):
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width()/2., height,
                           f'{count}\n({count/summary["total_pregnancies"]*100:.1f}%)',
                           ha='center', va='bottom', fontweight='bold')
                
                st.pyplot(fig)
                plt.close()
                
                st.markdown("---")
                
                # Top risk factors
                st.subheader("📊 Most Common Risk Factors")
                if summary['top_risk_factors']:
                    factors_df = pd.DataFrame(summary['top_risk_factors'], columns=['Risk Factor', 'Count'])
                    st.dataframe(factors_df, use_container_width=True, hide_index=True)
                
                st.markdown("---")
                
                # High and moderate risk cases with action steps
                st.subheader("🚨 High & Moderate Risk Cases with Action Steps")
                
                high_moderate = df_with_risks[df_with_risks['risk_level'].isin(['High', 'Moderate'])].copy()
                
                if len(high_moderate) > 0:
                    # Show top 20 high/moderate risk cases
                    display_cols = ['risk_level', 'risk_factors', 'priority', 'action_steps']
                    available_cols = [col for col in display_cols if col in high_moderate.columns]
                    
                    st.dataframe(
                        high_moderate[available_cols].head(20),
                        use_container_width=True,
                        hide_index=True
                    )
                    
                    st.info(f"Showing 20 of {len(high_moderate)} high/moderate risk cases")
                    
                    # Detailed action steps for critical cases
                    st.markdown("---")
                    st.subheader("🎯 Critical Priority Cases - Immediate Action Required")
                    
                    critical = high_moderate[high_moderate['priority'] == 'Critical']
                    if len(critical) > 0:
                        for idx, row in critical.head(5).iterrows():
                            with st.expander(f"Case {idx + 1} - {row['risk_level']} Risk"):
                                st.write(f"**Risk Factors:** {row['risk_factors']}")
                                st.write(f"**Confidence:** {row['confidence']:.2%}")
                                st.write("**Action Steps:**")
                                for step in row['action_steps'].split(';'):
                                    st.write(f"- {step.strip()}")
                    else:
                        st.info("No critical priority cases")
                else:
                    st.success("✅ No high or moderate risk cases detected")
                
                st.markdown("---")
                
                # WHO Risk Criteria Reference
                st.subheader("📋 WHO Risk Criteria Reference")
                st.info("""
                **High-Risk Pregnancy Criteria (WHO):**
                - Age < 18 or > 35 years
                - Parity > 4
                - HIV Positive
                - Gestation < 37 weeks (preterm) or > 42 weeks (post-term)
                - Delivery complications present
                - C-Section delivery
                - Birth weight < 2500g
                - Less than 4 ANC visits
                
                **Risk Levels:**
                - **High Risk**: 3+ risk factors - Immediate action required
                - **Moderate Risk**: 2 risk factors - Enhanced monitoring
                - **Low Risk**: 0-1 risk factors - Routine care
                """)
        
        except Exception as e:
            st.error(f"Error loading risk classification: {e}")
            st.info("Please ensure the data file is available and advanced_analytics.py is in the python_pipeline directory")

# Page 3: Trend Analysis
elif page == "Trend Analysis":
    st.header("📈 Time-Series Trend Analysis")
    
    # Load analytics module
    import sys
    sys.path.append(os.path.join(DATA_DIR, "python_pipeline"))
    from advanced_analytics import AdvancedHealthAnalytics
    
    try:
        data_file = os.path.join(DATA_DIR, "COMBINE_MOH_333_3replaced_KCHR.xlsx")
        if os.path.exists(data_file):
            df = pd.read_excel(data_file)
            
            # Initialize analytics
            analytics = AdvancedHealthAnalytics()
            
            st.subheader("🔍 Analyze Trends Over Time")
            
            # Select metric
            metric_options = {
                'Age': 'Age',
                'Birth Weight (in grams)': 'Birth Weight',
                'Gestation at Birth (Weeks)': 'Gestation',
                'No. of ANC Visits': 'ANC Visits'
            }
            
            selected_metric = st.selectbox("Select Metric to Analyze", list(metric_options.keys()))
            
            # Select period
            period = st.radio("Time Period", ['monthly', 'quarterly', 'yearly'])
            
            # Select date column
            date_column = st.selectbox(
                "Select Date Column",
                ['Date of Delivery', 'Date_of_Admission', 'Date of LMP']
            )
            
            if st.button("Analyze Trends"):
                with st.spinner("Analyzing trends..."):
                    # Ensure date column exists
                    if date_column in df.columns:
                        trends = analytics.analyze_time_series_trends(
                            df, date_column, selected_metric, period
                        )
                        
                        if trends:
                            # Display trend data
                            trend_df = pd.DataFrame([{
                                'Period': t.period,
                                'Metric': t.metric,
                                'Value': t.value,
                                'Trend': t.trend,
                                'Significance': t.significance
                            } for t in trends])
                            
                            st.dataframe(trend_df, use_container_width=True, hide_index=True)
                            
                            # Plot trends
                            fig, ax = plt.subplots(figsize=(12, 6))
                            
                            periods = [t.period for t in trends]
                            values = [t.value for t in trends]
                            
                            ax.plot(periods, values, marker='o', linewidth=2, markersize=8, color='#3498db')
                            ax.set_xlabel('Period')
                            ax.set_ylabel(metric_options[selected_metric])
                            ax.set_title(f'{metric_options[selected_metric]} Trend Over Time ({period.title()})')
                            ax.grid(True, alpha=0.3)
                            
                            # Color code trend
                            for i, t in enumerate(trends):
                                if t.trend == 'Increasing':
                                    ax.scatter(i, t.value, color='#e74c3c', s=100, zorder=5)
                                elif t.trend == 'Decreasing':
                                    ax.scatter(i, t.value, color='#2ecc71', s=100, zorder=5)
                                else:
                                    ax.scatter(i, t.value, color='#f39c12', s=100, zorder=5)
                            
                            # Add legend
                            from matplotlib.patches import Patch
                            legend_elements = [
                                Patch(facecolor='#e74c3c', label='Increasing'),
                                Patch(facecolor='#2ecc71', label='Decreasing'),
                                Patch(facecolor='#f39c12', label='Stable')
                            ]
                            ax.legend(handles=legend_elements)
                            
                            st.pyplot(fig)
                            plt.close()
                            
                            # Trend insights
                            st.markdown("---")
                            st.subheader("📊 Trend Insights")
                            
                            increasing = sum(1 for t in trends if t.trend == 'Increasing')
                            decreasing = sum(1 for t in trends if t.trend == 'Decreasing')
                            stable = sum(1 for t in trends if t.trend == 'Stable')
                            
                            col1, col2, col3 = st.columns(3)
                            col1.metric("Increasing", increasing)
                            col2.metric("Decreasing", decreasing)
                            col3.metric("Stable", stable)
                            
                            if increasing > decreasing:
                                st.warning(f"⚠️ Metric is showing an increasing trend in {increasing} periods")
                            elif decreasing > increasing:
                                st.success(f"✅ Metric is showing a decreasing trend in {decreasing} periods")
                            else:
                                st.info("📊 Metric is relatively stable over time")
                        else:
                            st.warning("No trend data available for the selected parameters")
                    else:
                        st.error(f"Date column '{date_column}' not found in dataset")
            
            st.markdown("---")
            st.info("""
            **Trend Analysis Guidelines:**
            - **Increasing Trend**: May indicate worsening condition or increased prevalence
            - **Decreasing Trend**: May indicate improvement or reduced prevalence
            - **Stable Trend**: No significant change over time
            - Use these trends to assess the impact of interventions over time
            """)
            
    except Exception as e:
        st.error(f"Error loading trend analysis: {e}")

# Page 4: Mortality Analysis
elif page == "Mortality Analysis":
    st.header("💀 Mortality Root-Cause Analysis & Interventions")
    
    # Try to load pre-computed mortality drivers
    maternal_file = os.path.join(DATA_DIR, "python_pipeline", "maternal_mortality_drivers.json")
    neonatal_file = os.path.join(DATA_DIR, "python_pipeline", "neonatal_mortality_drivers.json")
    
    # Select mortality type
    mortality_type = st.radio("Select Mortality Type", ['maternal', 'neonatal'])
    
    if mortality_type == 'maternal' and os.path.exists(maternal_file):
        import json
        with open(maternal_file, 'r', encoding='utf-8') as f:
            maternal_data = json.load(f)
        
        st.success("✅ Using pre-computed maternal mortality analysis")
        display_mortality_drivers(maternal_data, 'Maternal')
        
    elif mortality_type == 'neonatal' and os.path.exists(neonatal_file):
        import json
        with open(neonatal_file, 'r', encoding='utf-8') as f:
            neonatal_data = json.load(f)
        
        st.success("✅ Using pre-computed neonatal mortality analysis")
        display_mortality_drivers(neonatal_data, 'Neonatal')
        
    else:
        # Fallback: run analytics live
        st.info("No pre-computed results found. Running live analysis...")
        
        # Load analytics module
        import sys
        sys.path.append(os.path.join(DATA_DIR, "python_pipeline"))
        from advanced_analytics import AdvancedHealthAnalytics
        
        try:
            data_file = os.path.join(DATA_DIR, "COMBINE_MOH_333_3replaced_KCHR.xlsx")
            if os.path.exists(data_file):
                df = pd.read_excel(data_file)
                
                # Initialize analytics
                analytics = AdvancedHealthAnalytics()
                
                st.subheader(f"🔍 {mortality_type.title()} Mortality Root-Cause Analysis")
                
                # Analyze mortality drivers
                drivers = analytics.analyze_mortality_drivers(df, mortality_type)
            
                if drivers:
                    # Display drivers table
                    drivers_df = pd.DataFrame([{
                        'Cause': d.cause,
                        'Frequency': d.frequency,
                        'Percentage': f"{d.percentage:.1f}%",
                        'Evidence Level': d.evidence_level,
                        'Expected Reduction': f"{d.expected_reduction[0]}-{d.expected_reduction[1]}%" if d.expected_reduction else 'N/A'
                    } for d in drivers])
                    
                    st.dataframe(drivers_df, use_container_width=True, hide_index=True)
                    
                    st.markdown("---")
                    
                    # Detailed interventions for each driver
                    st.subheader("🎯 Targeted Interventions by Cause")
                    
                    for driver in drivers:
                        with st.expander(f"{driver.cause} - {driver.percentage:.1f}%"):
                            st.write(f"**Frequency:** {driver.frequency} cases")
                            st.write(f"**Evidence Level:** {driver.evidence_level}")
                            st.write(f"**Expected Reduction:** {driver.expected_reduction[0]}-{driver.expected_reduction[1]}%" if driver.expected_reduction else "N/A")
                            
                            st.write("**Recommended Interventions:**")
                            for i, intervention in enumerate(driver.interventions, 1):
                                st.write(f"{i}. {intervention}")
                            
                            if driver.evidence_level == 'Strong':
                                st.success("✅ Strong evidence - High priority for implementation")
                            elif driver.evidence_level == 'Moderate':
                                st.warning("⚠️ Moderate evidence - Consider with local context")
                            else:
                                st.info("ℹ️ Limited evidence - May need additional research")
                    
                    st.markdown("---")
                    
                    # Overall intervention recommendations
                    st.subheader("📋 Priority Intervention Recommendations")
                    
                    # Sort by expected reduction
                    prioritized = sorted(drivers, key=lambda x: x.expected_reduction[0] if x.expected_reduction else 0, reverse=True)
                    
                    st.info("""
                    **Implementation Priority:**
                    1. Focus on interventions with **Strong evidence** and **High expected reduction**
                    2. Consider resource availability and local context
                    3. Monitor implementation and measure impact
                    4. Adapt interventions based on ongoing evaluation
                    """)
                    
                    # Top 3 priority interventions
                    st.write("🎯 **Top 3 Priority Interventions:**")
                    for i, driver in enumerate(prioritized[:3], 1):
                        st.write(f"{i}. **{driver.cause}** - Expected reduction: {driver.expected_reduction[0]}-{driver.expected_reduction[1]}%")
                        st.write(f"   - First intervention: {driver.interventions[0]}")
                        st.write("")
                
                else:
                    st.info(f"No {mortality_type} mortality data available for analysis")
                    st.write("This could indicate:")
                    st.write("- No mortality events recorded in the dataset")
                    st.write("- Data may not contain mortality status information")
                    st.write("- Column names may need to be adjusted for your dataset")
                
                st.markdown("---")
                
                # Mortality rate calculation
                st.subheader("📊 Mortality Rate Calculation")
                
                if mortality_type == 'maternal':
                    deaths = df[df["Mother's Status after Delivery"].str.contains(
                        'D|Deceased|Dead', case=False, na=False, regex=True
                    )]
                    total = len(df)
                    rate = (len(deaths) / total) * 1000 if total > 0 else 0
                    
                    col1, col2, col3 = st.columns(3)
                    col1.metric("Total Deliveries", total)
                    col2.metric("Maternal Deaths", len(deaths))
                    col3.metric("Mortality Rate", f"{rate:.2f} per 1,000")
                    
                else:
                    deaths = df[df['Live Birth / FSB / MSB'].str.contains(
                        'FSB|MSB|Stillbirth|Dead', case=False, na=False, regex=True
                    )]
                    total = len(df)
                    rate = (len(deaths) / total) * 1000 if total > 0 else 0
                    
                    col1, col2, col3 = st.columns(3)
                    col1.metric("Total Births", total)
                    col2.metric("Neonatal Deaths", len(deaths))
                    col3.metric("Mortality Rate", f"{rate:.2f} per 1,000")
                
                st.markdown("---")
                st.info("""
                **Mortality Analysis Guidelines:**
                - Mortality rates are expressed per 1,000 deliveries/births
                - Root-cause analysis identifies primary drivers of mortality
                - Interventions are evidence-based with expected impact estimates
                - Implement interventions with strongest evidence first
                - Monitor and evaluate intervention effectiveness
                """)
        
        except Exception as e:
            st.error(f"Error loading mortality analysis: {e}")
            st.info("Please ensure the data file is available and advanced_analytics.py is in the python_pipeline directory")

# Page 5: Anonymization Results
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

# Page 6: Knowledge Graph
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

# Page 7: Clinical Analysis
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

# Footer
st.markdown("---")
st.markdown("""
**Framework:** BERT-LLM-KG Multi-layered Anonymization  
**Data:** Maternal-Child Health Records (MOH 333)  
**Generated:** October 2026
""")
