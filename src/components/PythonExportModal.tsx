import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, Download } from 'lucide-react';

interface PythonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonExportModal: React.FC<PythonExportModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<string>('powershell');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const powershellInstructions = `# Windows PowerShell Setup & Run Commands for VS Code
# ===================================================

# Step 1: Open Terminal in VS Code (Ctrl + \`) and change directory to python_pipeline
cd python_pipeline

# Step 2: Create a virtual environment
python -m venv venv

# Step 3: Activate the virtual environment in PowerShell
.\\venv\\Scripts\\Activate.ps1

# (Tip: If PowerShell blocks script execution, run this once:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process)

# Step 4: Upgrade pip and install all required machine learning libraries
pip install --upgrade pip
pip install -r requirements.txt

# Step 5: Execute the automated unit test suite
pytest test_pipeline.py -v

# Step 6: Launch the full interactive Streamlit dashboard
streamlit run app.py
`;

  const filesMap: { [key: string]: { label: string; ext: string; content: string } } = {
    powershell: {
      label: 'Windows PowerShell Setup',
      ext: 'ps1',
      content: powershellInstructions,
    },
    requirements: {
      label: 'requirements.txt',
      ext: 'txt',
      content: `streamlit>=1.35.0
pandas>=2.2.0
numpy>=1.26.0
scikit-learn>=1.4.0
xgboost>=2.0.0
shap>=0.45.0
plotly>=5.20.0
openpyxl>=3.1.2
pyyaml>=6.0.1
pytest>=8.0.0`,
    },
    config: {
      label: 'config.yaml',
      ext: 'yaml',
      content: `clinical_thresholds:
  systolic_high_risk: 140
  diastolic_high_risk: 90
  haemoglobin_severe_risk: 7.0
  haemoglobin_moderate_risk: 10.0
  blood_glucose_high_risk: 7.8
  min_adequate_anc_visits: 4
  high_risk_score_cutoff: 65
  moderate_risk_score_cutoff: 35

data_governance:
  small_cell_suppression_threshold: 5
  pseudonym_prefix: "KEN-MOM-"

model_parameters:
  test_size: 0.25
  random_state: 42
  n_estimators: 120
  max_depth: 4
  learning_rate: 0.08`,
    },
    app: {
      label: 'app.py (Streamlit)',
      ext: 'py',
      content: `# app.py - Streamlit Maternal & Neonatal Health AI Dashboard
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from data_pipeline import sanitize_and_deidentify, integrate_longitudinal_registers
from model_engine import train_and_evaluate_model
from shap_explainer import compute_shap_explanations
from pmtct_tracker import calculate_seroconversion_metrics, calculate_pmtct_five_year_cascade

st.set_page_config(page_title="AfyaBora - Kenya MNH AI", layout="wide")
st.title("AfyaBora: Kenya Maternal & Neonatal Health AI Dashboard")
# Full Python code provided in /python_pipeline/app.py`,
    },
    data_pipeline: {
      label: 'data_pipeline.py',
      ext: 'py',
      content: `# data_pipeline.py - Ingestion & De-identification
import pandas as pd
import numpy as np

def sanitize_and_deidentify(df: pd.DataFrame) -> pd.DataFrame:
    prohibited = ['name', 'phone', 'national_id', 'huduma', 'address']
    cols_to_drop = [c for c in df.columns if any(p in c.lower() for p in prohibited)]
    return df.drop(columns=cols_to_drop) if cols_to_drop else df
# Full Python code provided in /python_pipeline/data_pipeline.py`,
    },
    test_pipeline: {
      label: 'test_pipeline.py',
      ext: 'py',
      content: `# test_pipeline.py - Automated Unit Tests
import pytest
import pandas as pd
from data_pipeline import sanitize_and_deidentify, apply_small_cell_suppression

def test_deidentification_strips_pii():
    df = pd.DataFrame({'mother_pseudonym': ['M1'], 'phone_number': ['+254700000000']})
    cleaned = sanitize_and_deidentify(df)
    assert 'phone_number' not in cleaned.columns
# Full Python code provided in /python_pipeline/test_pipeline.py`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(filesMap[activeFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const file = filesMap[activeFile];
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile === 'powershell' ? 'setup_windows.ps1' : `${activeFile}.${file.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Python Streamlit, Scikit-learn, XGBoost & SHAP Modules
              </h3>
              <p className="text-xs text-slate-400">
                Complete codebase located in <code className="text-teal-300 font-mono">/python_pipeline/</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs">
          {Object.entries(filesMap).map(([key, f]) => (
            <button
              key={key}
              onClick={() => setActiveFile(key)}
              className={`px-3 py-1.5 rounded font-mono transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFile === key
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Code Content View */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-200">
          <pre className="whitespace-pre-wrap leading-relaxed select-all">
            {filesMap[activeFile].content}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Compatible with Python 3.10+ on Windows, Linux, and macOS.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
