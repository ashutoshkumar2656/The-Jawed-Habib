import os
import cv2
import numpy as np

dir_name = 'shop images'
files = sorted(os.listdir(dir_name))

print(f"=== DEEP INSPECTION OF ALL {len(files)} SALON IMAGES ===", flush=True)

cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
cascade = cv2.CascadeClassifier(cascade_path) if os.path.exists(cascade_path) else None

for idx, f in enumerate(files):
    p = os.path.join(dir_name, f)
    im = cv2.imread(p)
    if im is None:
        continue
    h, w, c = im.shape
    aspect = w / h
    
    # Downscale for fast feature analysis
    small_w = 400
    small_h = int(h * (400.0 / w))
    small = cv2.resize(im, (small_w, small_h))
    
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    faces = cascade.detectMultiScale(gray, 1.15, 3) if cascade else []
    
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
    mean_v = np.mean(hsv[:, :, 2])
    mean_s = np.mean(hsv[:, :, 1])
    
    # Check lighting and color
    # Warm wood (salon stations/flooring)
    wood = ((hsv[:, :, 0] >= 10) & (hsv[:, :, 0] <= 25) & (hsv[:, :, 1] >= 60)).mean()
    # Jawed Habib Red
    red = (((hsv[:, :, 0] <= 10) | (hsv[:, :, 0] >= 170)) & (hsv[:, :, 1] >= 120)).mean()
    # Bright lights / mirrors
    bright = (gray > 220).mean()
    dark = (gray < 40).mean()

    # Orientation
    orient = "Landscape" if aspect > 1.2 else "Portrait" if aspect < 0.85 else "Square"

    print(f"[{idx+1:02d}] {f} | {w}x{h} ({orient}) | Faces: {len(faces)} | Bri: {mean_v:.0f} | Wood: {wood*100:.1f}% | Red: {red*100:.1f}% | Mirror/Bright: {bright*100:.1f}% | Dark: {dark*100:.1f}%", flush=True)
