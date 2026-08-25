from PIL import Image
import numpy as np

def clip_right_seagull(src_path: str, dst1: str, dst2: str):
    img = Image.open(src_path).convert("RGBA")
    
    # Exact crop box excluding the yellow poster card at top-left:
    # Top starts below the poster fold (758px)
    crop_box = (545, 758, 975, 1035)
    cropped = img.crop(crop_box)
    
    arr = np.array(cropped, dtype=np.uint8)
    r = arr[:, :, 0].astype(int)
    g = arr[:, :, 1].astype(int)
    b = arr[:, :, 2].astype(int)
    
    # Exclude orange beak and red heart from background masking
    is_beak = (r > 200) & (g > 80) & (g < 170) & (b < 60)
    is_heart = (r > 150) & (g < 70) & (b < 70)
    is_protected = is_beak | is_heart
    
    # Peach paper background:
    is_peach_bg = (r > 185) & (g < 215) & (b < 195) & ((r - b) > 35) & ((r - g) > 20)
    # Yellow background:
    is_yellow_bg = (r > 195) & (g > 140) & (b < 140) & ((r - b) > 55)
    
    is_bg = (is_peach_bg | is_yellow_bg) & (~is_protected)
    
    # Make background transparent
    arr[:, :, 3][is_bg] = 0
    
    res = Image.fromarray(arr)
    res.save(dst1, "PNG")
    res.save(dst2, "PNG")
    print("Clean PNG clip saved to", dst1)

if __name__ == "__main__":
    src = r"c:\Users\philg\Pocketgull\pocketgull\docs\images\social\square-1080x1080.png"
    dst1 = r"c:\Users\philg\Pocketgull\pocketgull\public\images\origami-seagull-right.png"
    dst2 = r"c:\Users\philg\Pocketgull\pocketgull\docs\images\social\origami-seagull-right.png"
    clip_right_seagull(src, dst1, dst2)
