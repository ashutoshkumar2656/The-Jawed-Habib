import os
import cv2
import numpy as np

os.makedirs('scratch/previews', exist_ok=True)
files = sorted(os.listdir('shop images'))

print("Generating photo analysis catalog...", flush=True)

catalog = []

for idx, f in enumerate(files):
    p = os.path.join('shop images', f)
    im = cv2.imread(p)
    h, w = im.shape[:2]
    aspect = w / h
    
    # Save a clean 480px preview for quick inspection
    scale = 480.0 / max(w, h)
    preview = cv2.resize(im, (int(w * scale), int(h * scale)))
    preview_name = f"photo_{idx+1:02d}.jpg"
    cv2.imwrite(os.path.join('scratch/previews', preview_name), preview)
    
    # Feature metrics
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    
    # Detect bright ceiling lights vs floor
    top_half = gray[:h//2, :]
    bot_half = gray[h//2:, :]
    
    # Mirror detection: strong vertical lines with high brightness reflections
    edges = cv2.Canny(gray, 40, 120)
    vert_lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=80, minLineLength=int(h*0.2), maxLineGap=10)
    num_vert_lines = len(vert_lines) if vert_lines is not None else 0
    
    # Red logo / signage detection
    red_mask = ((hsv[:, :, 0] <= 10) | (hsv[:, :, 0] >= 170)) & (hsv[:, :, 1] >= 110) & (hsv[:, :, 2] >= 100)
    red_pts = np.sum(red_mask)
    
    # Wood / amber tones (styling counter, reception desk, floor)
    wood_mask = (hsv[:, :, 0] >= 10) & (hsv[:, :, 0] <= 25) & (hsv[:, :, 1] >= 60)
    wood_pts = np.sum(wood_mask)
    
    # Dark leather styling chairs (dark gray/black in lower half)
    chair_mask = (bot_half < 50)
    chair_pts = np.sum(chair_mask)
    
    # Shampoo station (curved deep sink)
    # White ceramic / bright sinks
    white_pts = np.sum(im > 230)
    
    # Guess classification
    if red_pts > 40000:
        category = "Category A / B: Signage & Reception"
        subject = "Salon Reception Counter / JH Brand Wall"
        suggested_section = "Salon Interior Gallery / Header"
    elif num_vert_lines > 30 and chair_pts > 100000:
        category = "Category B: Salon Interior"
        subject = "Styling Stations & Hydraulic Chairs with Vanity Mirrors"
        suggested_section = "Interior Gallery / Ambience"
    elif white_pts > 200000 and aspect > 1.2:
        category = "Category B / D: Wash Lounge or Private Treatment Room"
        subject = "Hair Wash Lounge / Facial Therapy Room"
        suggested_section = "Interior Gallery / Services"
    elif aspect < 0.9:
        category = "Category B: Salon Interior"
        subject = "Full Height Styling Mirror / Single Station / Entrance"
        suggested_section = "Interior Gallery / Portfolio"
    else:
        category = "Category B: Salon Interior"
        subject = "Panoramic Salon Floor / Client Waiting Lounge"
        suggested_section = "Interior Gallery / Services"
        
    catalog.append({
        "num": idx + 1,
        "filename": f,
        "preview": preview_name,
        "dimensions": f"{w}x{h}",
        "aspect": f"{aspect:.2f}",
        "orientation": "Landscape" if aspect > 1.15 else "Portrait" if aspect < 0.85 else "Square",
        "red_pts": int(red_pts),
        "wood_pts": int(wood_pts),
        "chair_pts": int(chair_pts),
        "vert_lines": int(num_vert_lines),
        "category": category,
        "subject": subject,
        "section": suggested_section
    })

import json
with open('scratch/catalog.json', 'w') as f:
    json.dump(catalog, f, indent=2)

print("Catalog saved to scratch/catalog.json")
for c in catalog:
    print(f"[{c['num']:02d}] {c['filename'][:35]} | {c['dimensions']} ({c['orientation']}) | {c['subject']} -> {c['section']}")
