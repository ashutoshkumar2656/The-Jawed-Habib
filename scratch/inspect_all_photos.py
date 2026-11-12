import os
import json
import cv2
import numpy as np
from PIL import Image

IMAGES_DIR = "shop images"
files = sorted([f for f in os.listdir(IMAGES_DIR) if f.lower().endswith(('.jpeg', '.jpg', '.png'))])

print(f"Total images found: {len(files)}")

catalog = []

for idx, fname in enumerate(files):
    fpath = os.path.join(IMAGES_DIR, fname)
    size_bytes = os.path.getsize(fpath)
    
    with Image.open(fpath) as img:
        width, height = img.size
        mode = img.mode
        aspect_ratio = round(width / height, 3)
        orientation = "landscape" if width > height else "portrait" if height > width else "square"

    # OpenCV analysis
    cv_img = cv2.imread(fpath)
    if cv_img is not None:
        hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        
        # Brightness & contrast
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        brightness = round(float(np.mean(gray)), 1)
        contrast = round(float(np.std(gray)), 1)
        
        # Laplacian variance for sharpness
        lap_var = round(float(cv2.Laplacian(gray, cv2.CV_64F).var()), 1)
        
        # Color distribution (Red, Gold/Yellow/Wood, Dark)
        # Red in HSV: H [0, 10] or [170, 180], S > 70, V > 50
        red_mask1 = cv2.inRange(hsv, np.array([0, 70, 50]), np.array([10, 255, 255]))
        red_mask2 = cv2.inRange(hsv, np.array([170, 70, 50]), np.array([180, 255, 255]))
        red_pct = round(float((np.sum(red_mask1 > 0) + np.sum(red_mask2 > 0)) / (width * height) * 100), 1)
        
        # Warm wood / gold / beige in HSV: H [11, 35], S > 30, V > 50
        wood_mask = cv2.inRange(hsv, np.array([11, 30, 50]), np.array([35, 255, 255]))
        wood_pct = round(float(np.sum(wood_mask > 0) / (width * height) * 100), 1)
        
        # Dark black in HSV: V < 50
        dark_mask = cv2.inRange(hsv, np.array([0, 0, 0]), np.array([180, 255, 50]))
        dark_pct = round(float(np.sum(dark_mask > 0) / (width * height) * 100), 1)
    else:
        brightness, contrast, lap_var, red_pct, wood_pct, dark_pct = 0, 0, 0, 0, 0, 0

    item = {
        "index": idx + 1,
        "filename": fname,
        "width": width,
        "height": height,
        "size_kb": round(size_bytes / 1024, 1),
        "aspect_ratio": aspect_ratio,
        "orientation": orientation,
        "brightness": brightness,
        "contrast": contrast,
        "sharpness": lap_var,
        "red_pct": red_pct,
        "wood_pct": wood_pct,
        "dark_pct": dark_pct
    }
    catalog.append(item)
    print(f"[{idx+1:02d}] {fname} | {width}x{height} | {orientation} | Sharp:{lap_var} | Red:{red_pct}% | Wood:{wood_pct}% | Dark:{dark_pct}%")

with open("scratch/catalog.json", "w") as out:
    json.dump(catalog, out, indent=2)

print("\nCatalog saved to scratch/catalog.json successfully.")
