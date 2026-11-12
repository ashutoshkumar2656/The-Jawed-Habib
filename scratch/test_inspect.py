import os
import cv2

# Check if pytesseract is installed, or just check color patches
try:
    import pytesseract
    has_tesseract = True
except ImportError:
    has_tesseract = False

print(f"pytesseract available: {has_tesseract}")

# Let's inspect the files in shop images
for idx in [4, 6, 8, 17, 19, 21, 23, 26, 30, 32, 33, 35]:
    # find corresponding file
    files = sorted([f for f in os.listdir("shop images") if f.lower().endswith(('.jpeg', '.jpg', '.png'))])
    fname = files[idx - 1]
    fpath = os.path.join("shop images", fname)
    print(f"Verified [{idx:02d}]: {fname} ({os.path.getsize(fpath)} bytes)")
