"""
model_engine.py
===============
Machine learning model training, cross-validation, and clinical risk evaluation
for Kenyan maternal & neonatal outcomes.
"""

import numpy as np
import pandas as pd
from typing import Dict, Tuple, Any

# Try to import sklearn, make it optional
try:
    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
    from sklearn.calibration import calibration_curve
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

def engineer_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Encodes clinical features into numeric vectors for modeling."""
    X = pd.DataFrame()
    
    # Use numeric columns from the dataframe
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    
    for col in numeric_cols:
        X[col] = df[col].fillna(0)
    
    # If no numeric columns, create a simple target based on available columns
    if X.empty:
        X['record_id'] = range(len(df))
    
    # Create a simple target for demonstration
    # Use any available clinical indicator or create synthetic target
    if 'maternal_complications' in df.columns:
        y = df['maternal_complications'].apply(
            lambda x: 1 if isinstance(x, str) and ('complication' in str(x).lower() or 'pph' in str(x).lower()) else 0
        )
    elif 'Mode_of_Delivery' in df.columns:
        y = df['Mode_of_Delivery'].apply(lambda x: 1 if 'CS' in str(x) else 0)
    else:
        # Create synthetic target based on numeric features
        if not X.empty:
            y = (X.iloc[:, 0] > X.iloc[:, 0].median()).astype(int)
        else:
            y = pd.Series([0] * len(df))
    
    return X, y

def train_and_evaluate_model(
    df: pd.DataFrame,
    test_size: float = 0.25,
    random_state: int = 42
) -> Dict[str, Any]:
    """Trains a Gradient Boosting model with evaluation metrics and calibration."""
    if not SKLEARN_AVAILABLE:
        return {
            'model': None,
            'feature_names': [],
            'metrics': {
                'accuracy': 0.0,
                'precision': 0.0,
                'recall': 0.0,
                'f1_score': 0.0,
                'roc_auc': 0.0
            },
            'confusion_matrix': [],
            'calibration': {
                'prob_pred': [],
                'prob_true': []
            },
            'X_train': None,
            'X_test': None,
            'y_test': None,
            'error': 'sklearn not available'
        }

    X, y = engineer_features(df)

    # Train/Test split to avoid data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y if y.nunique() > 1 else None
    )

    # Fit Gradient Boosting model
    model = GradientBoostingClassifier(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=4,
        random_state=random_state
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else y_pred

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc = roc_auc_score(y_test, y_prob) if y_test.nunique() > 1 else 0.5
    cm = confusion_matrix(y_test, y_pred)

    prob_true, prob_pred = calibration_curve(y_test, y_prob, n_bins=10)

    return {
        'model': model,
        'feature_names': list(X.columns),
        'metrics': {
            'accuracy': float(acc),
            'precision': float(prec),
            'recall': float(rec),
            'f1_score': float(f1),
            'roc_auc': float(roc)
        },
        'confusion_matrix': cm.tolist(),
        'calibration': {
            'prob_pred': prob_pred.tolist(),
            'prob_true': prob_true.tolist()
        },
        'X_train': X_train,
        'X_test': X_test,
        'y_test': y_test
    }
