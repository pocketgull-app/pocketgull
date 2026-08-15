import json
import re
import os

log_path = r'c:\Users\philg\Pocketgull\pocketgull\contests\rsna_knee_2026\kernel_output_v4\rsna-knee-2026-training-v4.log'
if not os.path.exists(log_path):
    print("File does not exist at:", log_path)
    exit(1)

with open(log_path, 'r', encoding='utf-8', errors='replace') as f:
    text = f.read()

print(f"Log file exists: {len(text)} characters")

# Find all "data":"..."
matches = re.findall(r'"data":"(.*?)(?<!\\)"', text, re.DOTALL)
print(f"Found {len(matches)} data entries")

all_lines = []
for m in matches:
    # replace escaped \n with actual newline
    m_clean = m.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
    all_lines.extend(m_clean.splitlines())

print(f"Total lines extracted: {len(all_lines)}")

# Print training summary lines
summary_lines = []
for line in all_lines:
    if any(k in line for k in ['FOLD', 'Epoch', 'Validation', 'OOF', 'Loss:', 'Macro-AUC', 'STAGE', 'Saved', 'model_fold', 'Weak', 'Gold']):
        summary_lines.append(line)

print("\n" + "="*80)
print(f"TRAINING SUMMARY ({len(summary_lines)} key events):")
print("="*80)
for line in summary_lines:
    print(line)
