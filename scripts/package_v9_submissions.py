import os
import zipfile

def package_v9_submissions():
    # 1. PhysioNet 2026 v9 Submission Zip
    pn_zip = 'pocketgull_physionet_2026_v9.0.0.zip'
    pn_files = [
        'python_example_2026/team_code.py',
        'python_example_2026/pocketgull_features.py',
        'python_example_2026/helper_code.py',
        'python_example_2026/requirements.txt',
        'python_example_2026/channel_table.csv',
        'python_example_2026/pocketgull_physionet_2026_challenge_entry.ipynb'
    ]

    with zipfile.ZipFile(pn_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in pn_files:
            if os.path.exists(f):
                z.write(f, os.path.basename(f))
    print(f"[OK] Created PhysioNet v9 Submission Zip: {pn_zip} ({os.path.getsize(pn_zip) / 1024:.1f} KB)")

    # 2. RSNA Knee 2026 v9 Submission Zip
    rsna_zip = 'contests/rsna_knee_2026/rsna_knee_v9_submission.zip'
    rsna_files = [
        'contests/rsna_knee_2026/rsna_knee_gold_model.py',
        'contests/rsna_knee_2026/asymmetric_loss.py',
        'contests/rsna_knee_2026/cooccurrence_calibrator.py',
        'contests/rsna_knee_2026/meta_ensemble_stacker.py',
        'contests/rsna_knee_2026/threshold_optimizer.py',
        'contests/rsna_knee_2026/rsna_knee_submission.ipynb'
    ]

    with zipfile.ZipFile(rsna_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in rsna_files:
            if os.path.exists(f):
                z.write(f, os.path.basename(f))
    print(f"[OK] Created RSNA Knee v9 Submission Zip: {rsna_zip} ({os.path.getsize(rsna_zip) / 1024:.1f} KB)")

    # 3. RSNA Knee submission.csv zip
    csv_zip = 'contests/rsna_knee_2026/submission.zip'
    csv_file = 'contests/rsna_knee_2026/submission.csv'
    if os.path.exists(csv_file):
        with zipfile.ZipFile(csv_zip, 'w', zipfile.ZIP_DEFLATED) as z:
            z.write(csv_file, 'submission.csv')
        print(f"[OK] Created RSNA Knee submission.zip: {csv_zip} ({os.path.getsize(csv_zip) / 1024:.1f} KB)")

if __name__ == '__main__':
    package_v9_submissions()
