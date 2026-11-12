import os
import json
from PIL import Image

SOURCE_DIR = "shop images"
BASE_TARGET = "public/images/salon"

CATEGORIES = {
    "interior": os.path.join(BASE_TARGET, "interior"),
    "services": os.path.join(BASE_TARGET, "services"),
    "opening": os.path.join(BASE_TARGET, "opening"),
    "portfolio": os.path.join(BASE_TARGET, "portfolio")
}

for cat_dir in CATEGORIES.values():
    os.makedirs(cat_dir, exist_ok=True)

# List source files in sorted order (index 1 to 35)
src_files = sorted([f for f in os.listdir(SOURCE_DIR) if f.lower().endswith(('.jpeg', '.jpg', '.png'))])

# Exact mapping plan
PHOTO_MAP = {
    1: {
        "slug": "jh-lalganj-jawed-habib-team",
        "category": "opening",
        "title": "Mr. Jawed Habib with Lalganj Salon Team",
        "alt": "Celebrity hairstylist Jawed Habib with the professional salon staff at The Jawed Habib Salon Lalganj grand opening",
        "tags": ["celebrity", "opening", "team"]
    },
    2: {
        "slug": "jh-lalganj-jawed-habib-portrait",
        "category": "opening",
        "title": "Mr. Jawed Habib at Lalganj Opening",
        "alt": "Master hairstylist Jawed Habib at the official inauguration of The Jawed Habib Salon Lalganj",
        "tags": ["celebrity", "opening"]
    },
    3: {
        "slug": "jh-lalganj-reception-desk",
        "category": "interior",
        "title": "Salon Reception Desk & Brand Wall",
        "alt": "Modern curved reception counter with warm LED underlighting and glowing 3D red Jawed Habib monogram at Lalganj salon",
        "tags": ["interior", "reception"]
    },
    4: {
        "slug": "jh-lalganj-nail-art-display-alt",
        "category": "services",
        "title": "Nail Art & Manicure Showcase Wall",
        "alt": "Nail art display and lighted glass product shelves at The Jawed Habib Salon Lalganj",
        "tags": ["services", "nails"]
    },
    5: {
        "slug": "jh-lalganj-spa-towel-swans",
        "category": "services",
        "title": "Luxury Bridal Spa & Treatment Setup",
        "alt": "Relaxing spa treatment bed decorated with swan towels and red rose petals for bridal wellness at Jawed Habib Lalganj",
        "tags": ["services", "spa", "bridal"]
    },
    6: {
        "slug": "jh-lalganj-salon-art-hair",
        "category": "portfolio",
        "title": "Jawed Habib Signature Hair Artistry",
        "alt": "Original Jawed Habib hair artistry portrait painting on the salon interior wall",
        "tags": ["portfolio", "art"]
    },
    7: {
        "slug": "jh-lalganj-hydrafacial-machine",
        "category": "services",
        "title": "Advanced HydraFacial Skin Management Tech",
        "alt": "Professional multi-step HydraFacial and skin rejuvenation machine with active serum bottles at Jawed Habib Lalganj",
        "tags": ["services", "skincare", "facial"]
    },
    8: {
        "slug": "jh-lalganj-bridal-makeup-room",
        "category": "interior",
        "title": "VIP Bridal & Makeup Studio",
        "alt": "Dedicated bridal makeup suite with twin illuminated Hollywood vanity mirrors and plush styling chairs at Jawed Habib Lalganj",
        "tags": ["interior", "bridal", "makeup"]
    },
    9: {
        "slug": "jh-lalganj-salon-art-beauty",
        "category": "portfolio",
        "title": "Jawed Habib Beauty Portrait Art",
        "alt": "Signature beauty portrait artwork framed inside The Jawed Habib Salon Lalganj",
        "tags": ["portfolio", "art"]
    },
    10: {
        "slug": "jh-lalganj-chatinx-hair-products",
        "category": "services",
        "title": "Premium CHITINX & PURELUXE Hair Care",
        "alt": "Professional CHITINX clarifying shampoo and PURELUXE hair therapy products used at Jawed Habib Lalganj",
        "tags": ["services", "products", "hair"]
    },
    11: {
        "slug": "jh-lalganj-chatinx-products-portrait",
        "category": "services",
        "title": "CHITINX Deep Fortifying Hair Shampoos",
        "alt": "CHITINX 5-in-1 professional shampoo range displayed at The Jawed Habib Salon Lalganj",
        "tags": ["services", "products"]
    },
    12: {
        "slug": "jh-lalganj-pedicure-spa-throne",
        "category": "interior",
        "title": "Luxury Pedicure & Foot Spa Massage Throne",
        "alt": "Plush leather massage pedicure chair with integrated whirlpool foot tub and arched vanity mirror at Jawed Habib Lalganj",
        "tags": ["interior", "pedicure", "spa"]
    },
    13: {
        "slug": "jh-lalganj-keratin-hair-products",
        "category": "services",
        "title": "PURELUXE Keraluxe Gold & Keratin Care",
        "alt": "PURELUXE Gold Conditioner and NANOLUXE hair repair keratin range at Jawed Habib Salon Lalganj",
        "tags": ["services", "products", "hair"]
    },
    14: {
        "slug": "jh-lalganj-styling-station-single",
        "category": "interior",
        "title": "Hydraulic Styling Station with Backlit Halo Mirror",
        "alt": "Individual salon styling station with circular halo-lit mirror, dark teal hydraulic chair, and towel sterilizer at Jawed Habib Lalganj",
        "tags": ["interior", "hair"]
    },
    15: {
        "slug": "jh-lalganj-pedicure-chair-view2",
        "category": "interior",
        "title": "Pedicure Station & Relaxing Foot Spa",
        "alt": "Comfortable pedicure station designed for rejuvenating foot care and reflexology at Jawed Habib Lalganj",
        "tags": ["interior", "pedicure"]
    },
    16: {
        "slug": "jh-lalganj-styling-station-view2",
        "category": "interior",
        "title": "Modern Haircut Station with Ring Light Mirror",
        "alt": "Precision haircut station featuring modern illuminated mirror and ergonomic styling chair at Jawed Habib Lalganj",
        "tags": ["interior", "hair"]
    },
    17: {
        "slug": "jh-lalganj-salon-interior-main",
        "category": "interior",
        "title": "Main Salon Floor & Styling Stations",
        "alt": "Panoramic view of The Jawed Habib Salon Lalganj styling floor showing illuminated halo mirrors, hydraulic chairs, waiting lounge, and marble flooring",
        "tags": ["interior", "hero", "main"]
    },
    18: {
        "slug": "jh-lalganj-salon-interior-wide",
        "category": "interior",
        "title": "Spacious Salon Floor & Ambience",
        "alt": "Wide perspective of the styling floor at Jawed Habib Lalganj with ambient ceiling lighting and gold-accented mirrors",
        "tags": ["interior", "ambience"]
    },
    19: {
        "slug": "jh-lalganj-retail-showcase",
        "category": "services",
        "title": "Salon Retail Showcase & Hair Care Range",
        "alt": "Floor-to-ceiling glass display cabinet stocked with genuine international hair care shampoos, conditioners, and serums at Jawed Habib Lalganj",
        "tags": ["services", "products", "retail"]
    },
    20: {
        "slug": "jh-lalganj-retail-cabinet-wide",
        "category": "services",
        "title": "International Hair Product Shelf",
        "alt": "Luxury hair care products display inside The Jawed Habib Salon Lalganj",
        "tags": ["services", "products"]
    },
    21: {
        "slug": "jh-lalganj-styling-scissors",
        "category": "services",
        "title": "Precision Japanese Steel Styling Shears",
        "alt": "KREATE PRO two-tone black and gold precision haircutting shears used by master stylists at Jawed Habib Lalganj",
        "tags": ["services", "tools", "hair"]
    },
    22: {
        "slug": "jh-lalganj-jawed-habib-director",
        "category": "opening",
        "title": "Mr. Jawed Habib with Lalganj Salon Director",
        "alt": "Celebrity stylist Jawed Habib seated with the Lalganj salon franchise director on opening day",
        "tags": ["opening", "celebrity"]
    },
    23: {
        "slug": "jh-lalganj-nail-art-display",
        "category": "services",
        "title": "Nail Artistry & Manicure Suite Display",
        "alt": "High-resolution nail art gallery frame with red JH monogram and lighted retail shelves at The Jawed Habib Salon Lalganj",
        "tags": ["services", "nails", "manicure"]
    },
    24: {
        "slug": "jh-lalganj-salon-art-barber",
        "category": "portfolio",
        "title": "Jawed Habib Barber Artistry Canvas",
        "alt": "Artistic salon painting depicting professional shears, clippers, and Jawed Habib brand heritage",
        "tags": ["portfolio", "art"]
    },
    25: {
        "slug": "jh-lalganj-styling-station-portrait",
        "category": "interior",
        "title": "Grooming & Shaving Station",
        "alt": "Dedicated men's and women's styling station with circular backlit mirror and vintage barber artwork at Jawed Habib Lalganj",
        "tags": ["interior", "grooming"]
    },
    26: {
        "slug": "jh-lalganj-triple-styling-stations",
        "category": "interior",
        "title": "Triple Illuminated Styling Mirrors Row",
        "alt": "Signature trio of circular backlit LED vanity mirrors with gold halo illumination and hydraulic chairs at The Jawed Habib Salon Lalganj",
        "tags": ["interior", "stations", "highlight"]
    },
    27: {
        "slug": "jh-lalganj-styling-station-halo",
        "category": "interior",
        "title": "Warm Halo Lighted Vanity Station",
        "alt": "Close-up of circular halo mirror station with warm LED lighting and sleek black-and-white vanity counter at Jawed Habib Lalganj",
        "tags": ["interior", "hair"]
    },
    28: {
        "slug": "jh-lalganj-retail-showcase-view2",
        "category": "services",
        "title": "Professional Salon Product Display",
        "alt": "Curated selection of PURELUXE and salon-grade treatments in glass showcase at Jawed Habib Lalganj",
        "tags": ["services", "products"]
    },
    29: {
        "slug": "jh-lalganj-press-conference",
        "category": "opening",
        "title": "Inaugural Press Conference with Media",
        "alt": "Mr. Jawed Habib greeting press reporters and media news microphones with folded hands at Lalganj salon opening",
        "tags": ["opening", "celebrity", "press"]
    },
    30: {
        "slug": "jh-lalganj-opening-celebration-cake",
        "category": "opening",
        "title": "Official Jawed Habib Inauguration Cake",
        "alt": "Ceremonial grand opening cake decorated with red sugar roses and the signature Jawed Habib monogram for the Lalganj branch launch",
        "tags": ["opening", "celebration"]
    },
    31: {
        "slug": "jh-lalganj-entrance-felicitation",
        "category": "opening",
        "title": "Entrance Ribbon & Auspicious Felicitation",
        "alt": "Salon directors and franchise team receiving auspicious opening gift at the glass entrance door of Jawed Habib Lalganj",
        "tags": ["opening", "entrance"]
    },
    32: {
        "slug": "jh-lalganj-first-bridal-client",
        "category": "opening",
        "title": "Mr. Jawed Habib Welcomes Bridal Client",
        "alt": "Mr. Jawed Habib personally welcoming a bride dressed in traditional wedding attire and gold jewellery with family at Jawed Habib Lalganj",
        "tags": ["opening", "bridal", "celebrity"]
    },
    33: {
        "slug": "jh-lalganj-banner-felicitation",
        "category": "opening",
        "title": "Grand Opening Ceremony at Tinpulwa Chowk, Lalganj",
        "alt": "Mr. Jawed Habib honored with ceremonial shawl in front of official banner reading THE JAWED HABIB TINPULWA CHOWK LALGANJ",
        "tags": ["opening", "celebrity", "location-proof"]
    },
    34: {
        "slug": "jh-lalganj-jawed-habib-mastercut",
        "category": "services",
        "title": "Live Master Haircut by Mr. Jawed Habib",
        "alt": "Master hairstylist Jawed Habib demonstrating precision hair grooming and haircutting live in the styling chair at Jawed Habib Salon Lalganj",
        "tags": ["services", "hair", "celebrity", "live-styling"]
    },
    35: {
        "slug": "jh-lalganj-jawed-habib-autograph",
        "category": "opening",
        "title": "Mr. Jawed Habib Autographs the Salon Entrance",
        "alt": "Celebrity stylist Jawed Habib signing his commemorative autograph on the entrance wall of The Jawed Habib Salon Lalganj",
        "tags": ["opening", "celebrity", "autograph"]
    }
}

manifest = []

for idx, fname in enumerate(src_files):
    photo_num = idx + 1
    info = PHOTO_MAP.get(photo_num)
    if not info:
        continue
    
    src_path = os.path.join(SOURCE_DIR, fname)
    cat_dir = CATEGORIES[info["category"]]
    
    webp_filename = f"{info['slug']}.webp"
    jpg_filename = f"{info['slug']}.jpg"
    
    webp_path = os.path.join(cat_dir, webp_filename)
    jpg_path = os.path.join(cat_dir, jpg_filename)
    
    # Process with PIL
    with Image.open(src_path) as img:
        orig_w, orig_h = img.size
        # High quality WebP output
        img.save(webp_path, "WEBP", quality=88, method=6)
        # Also high quality JPG fallback
        img.save(jpg_path, "JPEG", quality=88, optimize=True)
        
    webp_size = os.path.getsize(webp_path)
    jpg_size = os.path.getsize(jpg_path)
    src_size = os.path.getsize(src_path)
    savings = round((1 - (webp_size / src_size)) * 100, 1) if src_size > 0 else 0
    
    public_webp_url = f"/images/salon/{info['category']}/{webp_filename}"
    public_jpg_url = f"/images/salon/{info['category']}/{jpg_filename}"
    
    manifest_item = {
        "id": f"real-photo-{photo_num:02d}",
        "photo_num": photo_num,
        "slug": info["slug"],
        "category": info["category"],
        "title": info["title"],
        "alt": info["alt"],
        "tags": info["tags"],
        "width": orig_w,
        "height": orig_h,
        "aspect_ratio": round(orig_w / orig_h, 3),
        "orientation": "landscape" if orig_w > orig_h else "portrait",
        "src_file": fname,
        "webp_path": public_webp_url,
        "jpg_path": public_jpg_url,
        "orig_size_kb": round(src_size / 1024, 1),
        "webp_size_kb": round(webp_size / 1024, 1),
        "savings_pct": savings
    }
    manifest.append(manifest_item)
    print(f"Processed [{photo_num:02d}] -> {public_webp_url} ({manifest_item['webp_size_kb']} KB, saved {savings}%)")

# Save manifest to public/images/salon/manifest.json
manifest_file = os.path.join(BASE_TARGET, "manifest.json")
with open(manifest_file, "w", encoding="utf-8") as mf:
    json.dump(manifest, mf, indent=2, ensure_ascii=False)

print(f"\nOptimization complete! Processed {len(manifest)} photographs.")
print(f"Manifest written to {manifest_file}.")
