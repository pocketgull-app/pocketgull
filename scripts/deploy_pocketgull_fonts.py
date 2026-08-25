import os
import shutil

SOURCE_DIR = r"c:\Users\philg\Pocketgull\pocketgull\public\fonts\google_fonts_submission\ofl\pocketgull"
TARGET_DIRS = [
    r"c:\Users\philg\Pocketgull\pocketgull\public\assets\fonts",
    r"c:\Users\philg\Pocketgull\pocketgull\public\fonts"
]

FONT_FILES = [
    "PocketGull-Bold.ttf",
    "PocketGull-Fineliner.ttf",
    "PocketGull-Chiseltip.ttf",
    "PocketGullMono-Regular.ttf"
]

for target in TARGET_DIRS:
    os.makedirs(target, exist_ok=True)
    for font_file in FONT_FILES:
        src_path = os.path.join(SOURCE_DIR, font_file)
        if os.path.exists(src_path):
            dst_path = os.path.join(target, font_file)
            shutil.copy2(src_path, dst_path)
            print(f"Copied {font_file} -> {dst_path}")
        else:
            print(f"WARNING: Source font missing: {src_path}")

print("Font deployment complete!")
