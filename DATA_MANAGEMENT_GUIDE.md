# Data Management Guide

## Current Data Files

Your dashboard currently has **5 data files** in the main directory:

1. **COMBINE_MOH_333_3replaced_KCHR.xlsx** (4.53 MB)
   - Maternity Register (MOH 333)
   - Primary dataset for analysis

2. **MOH_405_ANC final JAN 2026.xlsx** (2.12 MB)
   - ANC Register (MOH 405)
   - Antenatal care data

3. **MOH_405_ANC_20 version 2.xlsx** (2.12 MB)
   - ANC Register (alternative version)
   - Antenatal care data

4. **MOH_204A_UNDER5 revised version on jan 2026.xlsx** (1.13 MB)
   - Under-5 Register (MOH 204A)
   - Child health data

5. **anonymized_data_kg_export.xlsx** (2.26 MB)
   - Anonymized output from processing
   - Knowledge graph export

## Data Management in Data Explorer

I've integrated the data management features into the **Data Explorer** page with 4 tabs:

### 1. Upload Data Tab
- **Multiple file upload**: Upload CSV or Excel files at once
- **File preview**: See data shape, columns, and sample rows
- **Register type detection**: Automatically identifies MOH register type
- **Storage**: Files saved to `data_uploads/` directory
- **File size limit**: 200MB per file

### 2. Manage Files Tab
- **List all uploaded files**: See file names and sizes
- **Remove files**: Delete unwanted uploads
- **File management**: Keep your data organized

### 3. Data Summary Tab
- **View all data files**: Both main directory and uploads
- **File statistics**: Count and size information
- **Location tracking**: Know where each file is stored

### 4. View Data Tab
- **Select data source**: Main Directory or Uploads Directory
- **Browse and explore**: View full datasets
- **Column information**: See all columns in the dataset
- **Download as CSV**: Export data for offline use

## How to Use

### Step 1: Start the Dashboard
```bash
cd D:\sarah\dashboard
streamlit run app.py
```

### Step 2: Navigate to Data Explorer
- Click "Data Explorer" in the sidebar

### Step 3: Upload New Files
- Go to "Upload Data" tab
- Click "Upload Health Data Files"
- Select one or more CSV/Excel files
- Files will be saved to `data_uploads/` directory

### Step 4: Manage Files
- Go to "Manage Files" tab
- See all uploaded files
- Select and remove unwanted files

### Step 5: View Summary
- Go to "Data Summary" tab
- See all data files in both directories
- Check file counts and sizes

### Step 6: Explore Data
- Go to "View Data" tab
- Select data source (Main Directory or Uploads)
- Choose a file to view
- Browse full dataset and columns
- Download as CSV if needed

## Deployment Considerations

### Option 1: Pre-load Data (Recommended for Production)
- Keep your 5 Excel files in the main directory
- They will be automatically loaded when the dashboard starts
- No user action needed after deployment

### Option 2: User Uploads (Recommended for Multi-User)
- Users can upload their own files via the dashboard
- Files stored in `data_uploads/` directory
- Each user can manage their own uploads
- Good for sharing data between teams

### Option 3: Hybrid Approach (Best of Both)
- Pre-load core datasets (like MOH 333, MOH 405) in main directory
- Allow users to upload additional files as needed
- Pipeline checks both directories for data files

## File Locations

### Main Directory (Pre-loaded Data)
```
D:\sarah\
├── COMBINE_MOH_333_3replaced_KCHR.xlsx
├── MOH_405_ANC final JAN 2026.xlsx
├── MOH_405_ANC_20 version 2.xlsx
├── MOH_204A_UNDER5 revised version on jan 2026.xlsx
└── anonymized_data_kg_export.xlsx
```

### Uploads Directory (User Uploads)
```
D:\sarah\data_uploads\
├── (new uploads will appear here)
└── (users can add/remove files)
```

## Pipeline Integration

The pipeline (`run_notebook.py`) has been updated to:
1. Check main directory for data files
2. Check `data_uploads/` directory for uploaded files
3. Load data from both locations
4. Process all available datasets

## Supported File Formats

- **CSV files** (.csv) - Recommended for compatibility
- **Excel files** (.xlsx, .xls) - Good for complex formatting

## Supported Register Types

The dashboard automatically detects:
- MOH 333 (Maternity Register)
- MOH 405 (ANC Register)
- MOH 406 (PNC Register)
- MOH 204A (Under-5 Register)
- MOH 206 (PMTCT Register)

## Data Manager Script

Run the data manager to check your current files:
```bash
cd D:\sarah\dashboard\python_pipeline
python data_manager.py
```

This will show:
- All data files in main directory
- All uploaded files
- File sizes
- Deployment status

## Best Practices

1. **Backup before uploading**: Always keep backup copies of important data
2. **Use consistent naming**: Follow MOH naming conventions
3. **Check file format**: Ensure files are valid CSV/Excel
4. **Test after upload**: Verify data loads correctly in dashboard
5. **Remove old files**: Keep the uploads directory clean
6. **Monitor storage**: Check file sizes to avoid storage issues

## Troubleshooting

### File not loading?
- Check file format (CSV/Excel only)
- Verify file is not corrupted
- Ensure file is in correct directory
- Check file permissions

### Upload failed?
- Check file size (large files may timeout)
- Verify file extension (.csv, .xlsx, .xls)
- Ensure sufficient disk space
- Try uploading one file at a time

### Can't remove file?
- File may be in use by the pipeline
- Check file permissions
- Try stopping the dashboard first
- Delete manually from `data_uploads/` directory

## Summary

✅ **You have 5 data files** already in the main directory
✅ **Data management integrated** into Data Explorer page
✅ **4 tabs** for upload, manage, summary, and view
✅ **Multiple file upload** supported
✅ **File management** (add/remove) implemented
✅ **Pipeline integration** with both directories
✅ **Deployment ready** - no manual data addition needed

Your dashboard is now ready for deployment with full data management capabilities!

