import json
import os

nb_path = r'c:\Users\philg\Pocketgull\pocketgull\contests\rsna_knee_2026\rsna_knee_submission_v4.ipynb'

with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell.get('id') == 'v4-inference-5':
        src_lines = cell.get('source', [])
        new_lines = []
        for line in src_lines:
            if 'preds_final = preds_accum / len(models)' in line:
                new_lines.append("            raw_preds = preds_accum / len(models)\n")
                new_lines.append("            # 1. Population Prior Probability Smoothing (90% Model + 10% Population Priors)\n")
                new_lines.append("            smoothed_preds = 0.90 * raw_preds + 0.10 * POPULATION_PRIORS\n")
                new_lines.append("            # 2. Epsilon Soft Clipping (prevents exact 0.0 tied ranks)\n")
                new_lines.append("            preds_final = np.clip(smoothed_preds, 1e-5, 0.99999)\n")
            else:
                new_lines.append(line)
        cell['source'] = new_lines

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("[OK] Successfully updated rsna_knee_submission_v4.ipynb with Prior Smoothing & Epsilon Soft Clipping!")
