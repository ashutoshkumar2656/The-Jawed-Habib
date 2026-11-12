import os
import cv2
import numpy as np

dir_name = 'shop images'
files = sorted(os.listdir(dir_name))

for i, f in enumerate(files):
    p = os.path.join(dir_name, f)
    im = cv2.imread(p)
    h, w = im.shape[:2]
    
    # Let's inspect dominant colors in central 50% of the image
    center = im[int(h*0.25):int(h*0.75), int(w*0.25):int(w*0.75)]
    chsv = cv2.cvtColor(center, cv2.COLOR_BGR2HSV)
    
    # Check what is in the image:
    # 1. Shampoo station / hair wash basin: dark leather recliners, black ceramic basins, metallic faucets
    # 2. Styling mirrors: bright vertical rectangular highlights with warm led border
    # 3. Pedicure / manicure: tub with foot rest, low stools
    # 4. Facial / massage bed: white covered flat bed in private room
    # 5. Reception: wooden counter, signage, computer screen, product display shelves
    # 6. Staff / customer haircut in action
    
    mean_bgr = np.mean(center, axis=(0, 1))
    # Red presence
    red_count = np.sum(((chsv[:,:,0] <= 10) | (chsv[:,:,0] >= 170)) & (chsv[:,:,1] >= 100))
    # Wood presence
    wood_count = np.sum((chsv[:,:,0] >= 10) & (chsv[:,:,0] <= 25) & (chsv[:,:,1] >= 50))
    # Black/leather chairs
    black_count = np.sum((center[:,:,0] < 45) & (center[:,:,1] < 45) & (center[:,:,2] < 45))
    # White towels / sheets / basins / lighting
    white_count = np.sum((center[:,:,0] > 220) & (center[:,:,1] > 220) & (center[:,:,2] > 220))
    
    total = center.shape[0] * center.shape[1]
    r_pct = (red_count / total) * 100
    w_pct = (wood_count / total) * 100
    b_pct = (black_count / total) * 100
    wh_pct = (white_count / total) * 100
    
    print(f"[{i+1:02d}] {f[24:45]}: w={w}, h={h}, Red={r_pct:.1f}%, Wood={w_pct:.1f}%, Black={b_pct:.1f}%, White={wh_pct:.1f}%")
