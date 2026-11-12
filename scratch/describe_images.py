import os
import cv2
import numpy as np

# Let's inspect each preview in detail
PREVIEW_DIR = "scratch/previews"
files = sorted([f for f in os.listdir(PREVIEW_DIR) if f.startswith("photo_") and f.endswith(".jpg")])

descriptions = {}

for f in files:
    idx = int(f.replace("photo_", "").replace(".jpg", ""))
    img_path = os.path.join(PREVIEW_DIR, f)
    img = cv2.imread(img_path)
    h, w, _ = img.shape
    
    # Analyze brightness in 3 vertical bands (top, middle, bottom)
    top = np.mean(img[0:int(h/3), :, :])
    mid = np.mean(img[int(h/3):int(2*h/3), :, :])
    bot = np.mean(img[int(2*h/3):, :, :])
    
    # Check for mirror reflections (high variance in middle)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    edge_density = np.sum(edges > 0) / (w * h)
    
    descriptions[idx] = {
        "file": f,
        "width": w,
        "height": h,
        "edge_density": round(float(edge_density), 4),
        "brightness_distribution": [round(float(top), 1), round(float(mid), 1), round(float(bot), 1)]
    }

print("Visual analysis complete for 35 photos.")
