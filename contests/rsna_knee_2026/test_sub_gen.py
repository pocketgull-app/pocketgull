import os
import glob
import numpy as np
import pandas as pd

sub_template_path = r'c:\Users\philg\Pocketgull\pocketgull\contests\rsna_knee_2026\sample_submission.csv'
template_df = pd.read_csv(sub_template_path)

id_col = template_df.columns[0]
target_cols = [c for c in template_df.columns if c != id_col]
study_ids = template_df[id_col].astype(str).tolist()

print(f"ID Column: '{id_col}'")
print(f"Target Columns ({len(target_cols)}): {target_cols}")

data = {id_col: study_ids}
preds_matrix = np.random.uniform(0.1, 0.9, size=(len(study_ids), 12))

for j, col_name in enumerate(target_cols):
    data[col_name] = preds_matrix[:, j % 12].astype(np.float64)

sub_df = pd.DataFrame(data)[[id_col] + target_cols]
out_file = r'c:\Users\philg\Pocketgull\pocketgull\contests\rsna_knee_2026\test_out_submission.csv'
sub_df.to_csv(out_file, index=False, float_format='%.6f')

print(f"Generated submission shape: {sub_df.shape}")
print(f"Dtypes:\n{sub_df.dtypes}")
