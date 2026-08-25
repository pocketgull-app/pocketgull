import os
import re

def get_files(directory):
    file_list = []
    if not os.path.exists(directory): return file_list
    for root, _, files in os.walk(directory):
        for file in files:
            file_list.append(os.path.join(root, file))
    return file_list

def extract_basename(filename):
    base = os.path.basename(filename)
    base = re.sub(r'\.(component|service|directive|pipe)\.ts$', '', base)
    base = re.sub(r'\.(dart|ts)$', '', base)
    base = re.sub(r'_(widget|screen|bloc|provider|model|types|cubit|event|service)$', '', base)
    base = re.sub(r'(-|_)', ' ', base)
    return base.lower().strip()

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

angular_root = os.path.join(project_root, 'src')
flutter_root = os.path.join(project_root, 'pocketgull_flutter', 'lib')

angular_dirs = ['components', 'services', 'directives', 'pipes']
flutter_dirs = ['widgets', 'screens', 'services', 'providers', 'models', 'theme']

angular_files = []
for d in angular_dirs:
    angular_files.extend(get_files(os.path.join(angular_root, d)))
angular_files = [f for f in angular_files if not f.endswith('.spec.ts')]

flutter_files = []
for d in flutter_dirs:
    flutter_files.extend(get_files(os.path.join(flutter_root, d)))

angular_map = {}
for f in angular_files:
    base = extract_basename(f)
    if base not in angular_map: angular_map[base] = []
    angular_map[base].append(os.path.relpath(f, project_root).replace('\\', '/'))

flutter_map = {}
for f in flutter_files:
    base = extract_basename(f)
    if base not in flutter_map: flutter_map[base] = []
    flutter_map[base].append(os.path.relpath(f, project_root).replace('\\', '/'))

all_keys = sorted(list(set(angular_map.keys()) | set(flutter_map.keys())))

markdown = '# Feature Parity Matrix\n\n'
markdown += 'This document maps the components and services from the live Angular site to the new Flutter migration to track feature parity.\n\n'
markdown += '| Feature / Base Name | Angular (Live) | Flutter (Migration) | Status |\n'
markdown += '| :--- | :--- | :--- | :--- |\n'

match_count = 0
missing_flutter = 0
flutter_only = 0

for key in all_keys:
    ang_files = angular_map.get(key, [])
    flt_files = flutter_map.get(key, [])
    
    status = '✅ Parity'
    if len(ang_files) > 0 and len(flt_files) == 0:
        status = '❌ Missing in Flutter'
        missing_flutter += 1
    elif len(ang_files) == 0 and len(flt_files) > 0:
        status = '⚠️ Flutter Only'
        flutter_only += 1
    else:
        match_count += 1
        
    ang_str = '<br>'.join([f'`{f}`' for f in ang_files])
    flt_str = '<br>'.join([f'`{f}`' for f in flt_files])
    
    markdown += f"| **{key}** | {ang_str if ang_str else '-'} | {flt_str if flt_str else '-'} | {status} |\n"

markdown += '\n## Summary\n'
markdown += f"- **Matched Features**: {match_count}\n"
markdown += f"- **Missing in Flutter (Needs Migration)**: {missing_flutter}\n"
markdown += f"- **Flutter Only (New Features/Architecture)**: {flutter_only}\n"

output_path = os.path.join(project_root, 'parity_matrix.md')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(markdown)

print(f"Parity matrix generated at {output_path}")
