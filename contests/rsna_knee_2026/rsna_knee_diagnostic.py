import os
import sys
import pandas as pd

try:
    import pydicom
    HAS_PYDICOM = True
except ImportError:
    HAS_PYDICOM = False

def run_diagnostic():
    print("=" * 65)
    print("RSNA Knee 2026 — DICOM Data Ingestion & Decompression Diagnostic")
    print("=" * 65)
    
    # 1. Paths and environment check
    input_dir = '/kaggle/input/rsna-knee-abnormality-detection'
    if not os.path.exists(input_dir):
        input_dir = 'contests/rsna_knee_2026'
        
    print(f"pydicom installed: {HAS_PYDICOM}")
    print(f"Input directory path: {input_dir}")
    print(f"Input directory exists: {os.path.exists(input_dir)}")
    
    train_series_path = os.path.join(input_dir, 'train_series.csv')
    if not os.path.exists(train_series_path):
        print(f"[ERROR] train_series.csv not found at {train_series_path}")
        return
        
    df = pd.read_csv(train_series_path)
    print(f"Loaded train_series.csv: {len(df)} rows")
    
    # Get a few sample rows
    samples = df.head(5)
    
    for idx, row in samples.iterrows():
        study_uid = str(row['StudyInstanceUID'])
        series_uid = str(row['SeriesInstanceUID'])
        plane = str(row['Anatomical_Plane'])
        
        # Test candidate directories
        images_dir = os.path.join(input_dir, 'train_images')
        series_dir = os.path.join(images_dir, study_uid, series_uid)
        
        print(f"\n--- Checking Study {study_uid[:15]}... Series {series_uid[:15]}... ({plane}) ---")
        print(f"Expected directory: {series_dir}")
        print(f"Directory exists: {os.path.exists(series_dir)}")
        
        if not os.path.exists(series_dir):
            # Check if directory structure is different (e.g. without series_uid folder)
            study_dir = os.path.join(images_dir, study_uid)
            print(f"Checking parent study directory: {study_dir}")
            print(f"Study directory exists: {os.path.exists(study_dir)}")
            if os.path.exists(study_dir):
                contents = os.listdir(study_dir)
                print(f"Study directory contents: {contents[:5]}")
            continue
            
        # List files in series directory
        files = [f for f in os.listdir(series_dir) if not f.startswith('.')]
        print(f"Files found in series directory: {len(files)} files")
        if not files:
            continue
            
        # Try reading first file
        test_file = os.path.join(series_dir, files[0])
        print(f"Reading test file: {test_file}")
        
        try:
            ds = pydicom.dcmread(test_file, force=True)
            print(f"[SUCCESS] pydicom read file headers cleanly.")
            print(f"  Modality: {getattr(ds, 'Modality', 'N/A')}")
            print(f"  Series Description: {getattr(ds, 'SeriesDescription', 'N/A')}")
            print(f"  Image Position Patient: {getattr(ds, 'ImagePositionPatient', 'N/A')}")
            print(f"  Transfer Syntax UID: {getattr(ds.file_meta, 'TransferSyntaxUID', 'N/A')}")
            
            # Now test pixel array loading (decompression test)
            print("  Attempting to load pixel array (ds.pixel_array)...")
            try:
                arr = ds.pixel_array
                print(f"  [SUCCESS] Pixel array loaded! Shape: {arr.shape}, Min: {arr.min()}, Max: {arr.max()}")
            except Exception as pixel_ex:
                print(f"  [ERROR] ds.pixel_array failed with exception:")
                print(f"    Type: {type(pixel_ex).__name__}")
                print(f"    Message: {pixel_ex}")
                print("  [HINT] This usually means your environment lacks compression codecs (e.g., gdcm, pylibjpeg-libjpeg).")
                
        except Exception as read_ex:
            print(f"[ERROR] pydicom.dcmread failed completely:")
            print(f"  Type: {type(read_ex).__name__}")
            print(f"  Message: {read_ex}")

if __name__ == '__main__':
    run_diagnostic()
