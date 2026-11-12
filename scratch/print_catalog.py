import json

# Let's read catalog.json and cross-reference with visual inspection
with open("scratch/catalog.json") as f:
    catalog = json.load(f)

print(f"Total items in catalog: {len(catalog)}")
for item in catalog:
    print(f"[{item['index']:02d}] {item['filename']} | {item['width']}x{item['height']} | {item['orientation']} | sharp:{item['sharpness']} | red:{item['red_pct']}% | wood:{item['wood_pct']}% | dark:{item['dark_pct']}%")
