import os
import sys
import builtins
from kaggle.api.kaggle_api_extended import KaggleApi

api = KaggleApi()
api.authenticate()

kernel_slug = 'philgear/rsna-knee-2026-pytorch-inference'
output_dir = os.path.abspath('c:/Users/philg/Pocketgull/pocketgull/contests/rsna_knee_2026/inference_output_v4')
os.makedirs(output_dir, exist_ok=True)

# Monkeypatch builtins.open to force utf-8 encoding when writing .log files
original_open = builtins.open

def utf8_open(*args, **kwargs):
    if len(args) > 0 and isinstance(args[0], str) and args[0].endswith('.log') and ('w' in kwargs.get('mode', '') or (len(args) > 1 and 'w' in args[1])):
        kwargs['encoding'] = 'utf-8'
        kwargs['errors'] = 'replace'
    elif 'mode' in kwargs and 'w' in kwargs['mode'] and 'encoding' not in kwargs:
        kwargs['encoding'] = 'utf-8'
        kwargs['errors'] = 'replace'
    return original_open(*args, **kwargs)

builtins.open = utf8_open

print(f"Fetching outputs for {kernel_slug} into {output_dir}...")
api.kernels_output_cli(kernel_slug, path=output_dir)
print("Finished downloading kernel outputs.")

# Restore open
builtins.open = original_open

# Check submission.csv and log
sub_file = os.path.join(output_dir, 'submission.csv')
if os.path.exists(sub_file):
    import pandas as pd
    df = pd.read_csv(sub_file)
    print(f"\n[OK] submission.csv found! Rows: {len(df)}, Columns: {list(df.columns)}")
    print(df.head(10).to_string())
else:
    print(f"[WARN] submission.csv not found in {os.listdir(output_dir)}")
