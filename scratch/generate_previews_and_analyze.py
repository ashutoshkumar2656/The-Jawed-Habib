import os
import cv2
import numpy as np
from PIL import Image

IMAGES_DIR = "shop images"
PREVIEW_DIR = "scratch/previews"
os.makedirs(PREVIEW_DIR, exist_ok=True)

files = sorted([f for f in os.listdir(IMAGES_DIR) if f.lower().endswith(('.jpeg', '.jpg', '.png'))])

# Load face cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

analysis_results = []

for idx, fname in enumerate(files):
    fpath = os.path.join(IMAGES_DIR, fname)
    with Image.open(fpath) as img:
        w, h = img.size
        ratio = w / h
        # Resize max dimension to 600px for preview
        if w > h:
            preview_w = 600
            preview_h = int(600 / ratio)
        else:
            preview_h = 600
            preview_w = int(600 * ratio)
        preview_img = img.resize((preview_w, preview_h), Image.Resampling.LANCZOS)
        preview_path = os.path.join(PREVIEW_DIR, f"photo_{idx+1:02d}.jpg")
        preview_img.save(preview_path, quality=85)
        
    # Analyze preview
    cv_img = cv2.imread(preview_path)
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
    num_faces = len(faces)
    
    # Calculate color dominance
    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    # Red mask
    r1 = cv2.inRange(hsv, np.array([0, 70, 50]), np.array([10, 255, 255]))
    r2 = cv2.inRange(hsv, np.array([170, 70, 50]), np.array([180, 255, 255]))
    red_pct = (np.sum(r1 > 0) + np.sum(r2 > 0)) / (preview_w * preview_h) * 100
    
    # Wood / Warm amber
    wood = cv2.inRange(hsv, np.array([11, 30, 50]), np.array([35, 255, 255]))
    wood_pct = np.sum(wood > 0) / (preview_w * preview_h) * 100
    
    # Pure white / towels / facial bed: S < 20, V > 200
    white = cv2.inRange(hsv, np.array([0, 0, 200]), np.array([180, 25, 255]))
    white_pct = np.sum(white > 0) / (preview_w * preview_h) * 100

    analysis_results.append({
        "num": idx + 1,
        "filename": fname,
        "orig_dim": f"{w}x{h}",
        "orientation": "landscape" if w > h else "portrait",
        "num_faces": num_faces,
        "red_pct": round(red_pct, 1),
        "wood_pct": round(wood_pct, 1),
        "white_pct": round(white_pct, 1)
    })

print(f"Generated {len(analysis_results)} previews in {PREVIEW_DIR}.")
for r in analysis_results:
    print(f"[{r['num']:02d}] {r['orig_dim']} ({r['orientation']}) | Faces: {r['num_faces']} | Red: {r['red_pct']}% | Wood: {r['wood_pct']}% | White: {r['white_pct']}% | {r['filename']}")
