import os
import cv2
import numpy as np
from PIL import Image

dir_name = 'shop images'
files = sorted(os.listdir(dir_name))

print("Classifying 35 images...", flush=True)

# Let's inspect each image's quadrants and features to identify the scene
descriptions = []

for idx, f in enumerate(files):
    p = os.path.join(dir_name, f)
    im = cv2.imread(p)
    h, w, c = im.shape
    aspect = w / h
    
    # Analyze sections: top, middle, bottom
    top = im[:int(h*0.35), :]
    mid = im[int(h*0.35):int(h*0.7), :]
    bot = im[int(h*0.7):, :]
    
    # Check for salon chairs (dark circular/curved shapes in bottom half)
    bot_dark = (bot < 60).mean()
    
    # Check for mirror reflections (high vertical edges in top/mid)
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    vert_edges = np.abs(sobel_x).mean()
    
    # Check for bright ceiling lights (top brightness)
    top_bright = (top > 200).mean()
    
    # Check for red signage/branding
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    red_mask = ((hsv[:, :, 0] <= 10) | (hsv[:, :, 0] >= 170)) & (hsv[:, :, 1] >= 120)
    red_pixels = np.sum(red_mask)
    
    # Save a small representative crop to inspect if needed
    category = "Interior"
    detail = "Styling Station"
    
    descriptions.append({
        "index": idx + 1,
        "filename": f,
        "dimensions": f"{w}x{h}",
        "aspect": f"{aspect:.2f}",
        "orientation": "Landscape" if aspect > 1.15 else "Portrait" if aspect < 0.85 else "Square",
        "red_pixels": int(red_pixels),
        "top_bright": float(top_bright),
        "bot_dark": float(bot_dark),
        "vert_edges": float(vert_edges),
    })

import json
print(json.dumps(descriptions[:10], indent=2))
