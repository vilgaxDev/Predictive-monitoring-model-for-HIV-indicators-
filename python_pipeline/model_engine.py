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
    """Trains a Gradient Boosting model with evaluation metrics and calibration.
    Optimized for high recall (target ~0.96) to minimize false negatives in clinical settings."""
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

    # Calculate class weights to improve recall
    from sklearn.utils.class_weight import compute_class_weight
    if y.nunique() > 1:
        classes = np.unique(y_train)
        weights = compute_class_weight('balanced', classes=classes, y=y_train)
        class_weight_dict = dict(zip(classes, weights))
    else:
        class_weight_dict = None

    # Fit Gradient Boosting model with class weights for better recall
    model = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        min_samples_split=5,
        min_samples_leaf=2,
        subsample=0.8,
        random_state=random_state
    )
    
    # For class weight support, we need to use sample weights
    if class_weight_dict:
        sample_weights = y_train.map(class_weight_dict)
        model.fit(X_train, y_train, sample_weight=sample_weights)
    else:
        model.fit(X_train, y_train)

    # Get probabilities and adjust threshold for higher recall
    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
    
    # Use lower threshold (0.3 instead of 0.5) to improve recall
    if y_prob is not None:
        threshold = 0.3
        y_pred = (y_prob >= threshold).astype(int)
    else:
        y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc = roc_auc_score(y_test, y_prob) if y_prob is not None and y_test.nunique() > 1 else 0.5
    cm = confusion_matrix(y_test, y_pred)

    prob_true, prob_pred = calibration_curve(y_test, y_prob, n_bins=10) if y_prob is not None else ([], [])

    return {
        'model': model,
        'feature_names': list(X.columns),
        'metrics': {
            'accuracy': round(float(acc), 2),
            'precision': round(float(prec), 2),
            'recall': round(float(rec), 2),
            'f1_score': round(float(f1), 2),
            'roc_auc': round(float(roc), 2)
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
