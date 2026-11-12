import cv2
import numpy as np
import os

def generate_svg_and_png():
    os.makedirs('public/brand/jawed-habib', exist_ok=True)
    
    # 1. Load full resolution corporate logo
    im = cv2.imread('temp_logos/corporate-logo-full.png')
    h, w = im.shape[:2]
    
    # Extract mask of the logo elements (white pixels)
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
    
    # Get overall bounding box with 20px padding
    ys, xs = np.where(mask > 0)
    pad = 20
    x1 = max(0, xs.min() - pad)
    x2 = min(w, xs.max() + pad)
    y1 = max(0, ys.min() - pad)
    y2 = min(h, ys.max() + pad)
    
    crop_mask = mask[y1:y2, x1:x2]
    ch, cw = crop_mask.shape
    
    # The monogram is from x=116 to x=327 in original coords
    mono_x_end = 350 - x1
    
    # Separate monogram mask and text mask
    mono_mask = np.zeros_like(crop_mask)
    mono_mask[:, :mono_x_end] = crop_mask[:, :mono_x_end]
    
    text_mask = np.zeros_like(crop_mask)
    text_mask[:, mono_x_end:] = crop_mask[:, mono_x_end:]
    
    # -------------------------------------------------------------
    # A. Generate High-Res PNGs
    # -------------------------------------------------------------
    
    # 1. logo-white.png (Transparent background, pure white elements)
    logo_white = np.zeros((ch, cw, 4), dtype=np.uint8)
    logo_white[crop_mask > 0] = [255, 255, 255, 255]
    alpha_smooth = cv2.GaussianBlur(crop_mask, (3, 3), 0)
    logo_white[:, :, 3] = alpha_smooth
    cv2.imwrite('public/brand/jawed-habib/logo-white.png', logo_white)
    print("Generated logo-white.png:", cw, ch)
    
    # 2. logo-primary.png (Red monogram #C62628 and white text on transparent for dark header)
    # Red in BGRA: B=40, G=38, R=198
    logo_primary = np.zeros((ch, cw, 4), dtype=np.uint8)
    alpha_mono = cv2.GaussianBlur(mono_mask, (3, 3), 0)
    alpha_text = cv2.GaussianBlur(text_mask, (3, 3), 0)
    
    logo_primary[mono_mask > 0] = [40, 38, 198, 255]
    logo_primary[text_mask > 0] = [255, 255, 255, 255]
    logo_primary[:, :, 3] = np.maximum(alpha_mono, alpha_text)
    cv2.imwrite('public/brand/jawed-habib/logo-primary.png', logo_primary)
    print("Generated logo-primary.png:", cw, ch)
    
    # 2b. logo-primary-dark.png (Red monogram #C62628 and dark text #111111 for light background)
    logo_dark = np.zeros((ch, cw, 4), dtype=np.uint8)
    logo_dark[mono_mask > 0] = [40, 38, 198, 255]
    logo_dark[text_mask > 0] = [20, 20, 20, 255]
    logo_dark[:, :, 3] = np.maximum(alpha_mono, alpha_text)
    cv2.imwrite('public/brand/jawed-habib/logo-primary-dark.png', logo_dark)
    print("Generated logo-primary-dark.png:", cw, ch)
    
    # 3. logo-primary-red.png (All Red #C62628 on transparent)
    logo_red = np.zeros((ch, cw, 4), dtype=np.uint8)
    logo_red[crop_mask > 0] = [40, 38, 198, 255]
    logo_red[:, :, 3] = alpha_smooth
    cv2.imwrite('public/brand/jawed-habib/logo-primary-red.png', logo_red)
    print("Generated logo-primary-red.png:", cw, ch)
    
    # 4. logo-icon.png (The JH Monogram only, square tight crop with margin)
    my, mx = np.where(mono_mask > 0)
    mpad = 24
    m_x1 = max(0, mx.min() - mpad)
    m_x2 = min(cw, mx.max() + mpad)
    m_y1 = max(0, my.min() - mpad)
    m_y2 = min(ch, my.max() + mpad)
    
    icon_crop = mono_mask[m_y1:m_y2, m_x1:m_x2]
    ih, iw = icon_crop.shape
    size = max(ih, iw)
    square_icon = np.zeros((size, size, 4), dtype=np.uint8)
    ox = (size - iw) // 2
    oy = (size - ih) // 2
    
    alpha_icon = cv2.GaussianBlur(icon_crop, (3, 3), 0)
    square_icon[oy:oy+ih, ox:ox+iw, 0] = 40
    square_icon[oy:oy+ih, ox:ox+iw, 1] = 38
    square_icon[oy:oy+ih, ox:ox+iw, 2] = 198
    square_icon[oy:oy+ih, ox:ox+iw, 3] = alpha_icon
    
    cv2.imwrite('public/brand/jawed-habib/logo-icon.png', square_icon)
    print("Generated logo-icon.png:", size, size)
    
    # White icon variation for dark backgrounds
    square_icon_white = np.zeros((size, size, 4), dtype=np.uint8)
    square_icon_white[oy:oy+ih, ox:ox+iw, 0] = 255
    square_icon_white[oy:oy+ih, ox:ox+iw, 1] = 255
    square_icon_white[oy:oy+ih, ox:ox+iw, 2] = 255
    square_icon_white[oy:oy+ih, ox:ox+iw, 3] = alpha_icon
    cv2.imwrite('public/brand/jawed-habib/logo-icon-white.png', square_icon_white)
    print("Generated logo-icon-white.png:", size, size)
    
    # 5. logo-stacked.png (JH Monogram centered on top, JAWED HABIB centered below)
    ty, tx = np.where(text_mask > 0)
    t_crop = text_mask[ty.min():ty.max()+1, tx.min():tx.max()+1]
    th, tw = t_crop.shape
    
    st_w = max(tw, 500) + 60
    st_h = ih + th + 60
    
    stacked_white = np.zeros((st_h, st_w, 4), dtype=np.uint8)
    m_ox = (st_w - iw) // 2
    m_oy = 20
    alpha_m = cv2.GaussianBlur(icon_crop, (3, 3), 0)
    stacked_white[m_oy:m_oy+ih, m_ox:m_ox+iw, :3] = 255
    stacked_white[m_oy:m_oy+ih, m_ox:m_ox+iw, 3] = alpha_m
    
    t_ox = (st_w - tw) // 2
    t_oy = m_oy + ih + 24
    alpha_t = cv2.GaussianBlur(t_crop, (3, 3), 0)
    stacked_white[t_oy:t_oy+th, t_ox:t_ox+tw, :3] = 255
    stacked_white[t_oy:t_oy+th, t_ox:t_ox+tw, 3] = alpha_t
    cv2.imwrite('public/brand/jawed-habib/logo-stacked.png', stacked_white)
    print("Generated logo-stacked.png:", st_w, st_h)
    
    # Stacked primary with Red monogram and White text
    stacked_primary = np.zeros((st_h, st_w, 4), dtype=np.uint8)
    stacked_primary[m_oy:m_oy+ih, m_ox:m_ox+iw, 0] = 40
    stacked_primary[m_oy:m_oy+ih, m_ox:m_ox+iw, 1] = 38
    stacked_primary[m_oy:m_oy+ih, m_ox:m_ox+iw, 2] = 198
    stacked_primary[m_oy:m_oy+ih, m_ox:m_ox+iw, 3] = alpha_m
    stacked_primary[t_oy:t_oy+th, t_ox:t_ox+tw, :3] = 255
    stacked_primary[t_oy:t_oy+th, t_ox:t_ox+tw, 3] = alpha_t
    cv2.imwrite('public/brand/jawed-habib/logo-stacked-color.png', stacked_primary)
    print("Generated logo-stacked-color.png:", st_w, st_h)
    
    # 6. Favicons
    fav_192 = cv2.resize(square_icon, (192, 192), interpolation=cv2.INTER_AREA)
    cv2.imwrite('public/brand/jawed-habib/favicon.png', fav_192)
    cv2.imwrite('public/favicon.png', fav_192)
    # Also create app icons for Next.js layout
    cv2.imwrite('public/apple-touch-icon.png', cv2.resize(square_icon, (180, 180), interpolation=cv2.INTER_AREA))
    cv2.imwrite('public/icon-192.png', fav_192)
    cv2.imwrite('public/icon-512.png', cv2.resize(square_icon, (512, 512), interpolation=cv2.INTER_AREA))
    print("Updated public/favicon.png and apple-touch-icon.png")
    
    # -------------------------------------------------------------
    # B. Generate SVG Vector representations
    # -------------------------------------------------------------
    def contours_to_svg_paths(binary_mask):
        contours, hierarchy = cv2.findContours(binary_mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_KCOS)
        paths = []
        for i, cnt in enumerate(contours):
            if cv2.contourArea(cnt) < 10:
                continue
            d = []
            for j, pt in enumerate(cnt):
                x, y = pt[0]
                if j == 0:
                    d.append(f"M {x} {y}")
                else:
                    d.append(f"L {x} {y}")
            d.append("Z")
            paths.append(" ".join(d))
        return " ".join(paths)
    
    mono_svg_path = contours_to_svg_paths(mono_mask)
    text_svg_path = contours_to_svg_paths(text_mask)
    
    # 1. logo-primary.svg (Red Monogram + Dark/White text)
    svg_primary = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {cw} {ch}" width="{cw}" height="{ch}" fill="none">
  <path d="{mono_svg_path}" fill="#C62628" fill-rule="evenodd"/>
  <path d="{text_svg_path}" fill="#FFFFFF" fill-rule="evenodd"/>
</svg>'''
    with open('public/brand/jawed-habib/logo-primary.svg', 'w') as f:
        f.write(svg_primary)
    print("Generated logo-primary.svg")

    # 2. logo-white.svg (Pure white)
    svg_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {cw} {ch}" width="{cw}" height="{ch}" fill="none">
  <path d="{mono_svg_path}" fill="#FFFFFF" fill-rule="evenodd"/>
  <path d="{text_svg_path}" fill="#FFFFFF" fill-rule="evenodd"/>
</svg>'''
    with open('public/brand/jawed-habib/logo-white.svg', 'w') as f:
        f.write(svg_white)
    print("Generated logo-white.svg")

    # 3. logo-icon.svg
    my, mx = np.where(mono_mask > 0)
    icon_w = mx.max() - mx.min() + 1
    icon_h = my.max() - my.min() + 1
    isize = max(icon_w, icon_h) + 40
    iox = (isize - icon_w) // 2 - mx.min()
    ioy = (isize - icon_h) // 2 - my.min()
    
    svg_icon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {isize} {isize}" width="{isize}" height="{isize}" fill="none">
  <g transform="translate({iox}, {ioy})">
    <path d="{mono_svg_path}" fill="#C62628" fill-rule="evenodd"/>
  </g>
</svg>'''
    with open('public/brand/jawed-habib/logo-icon.svg', 'w') as f:
        f.write(svg_icon)
    print("Generated logo-icon.svg")

    # 7. Brand Preview WebP
    preview = np.zeros((630, 1200, 3), dtype=np.uint8)
    for y in range(630):
        val = int(12 + (y / 630) * 15)
        preview[y, :] = [val, val, val]
    
    target_w = 800
    ratio = target_w / cw
    target_h = int(ch * ratio)
    resized_logo = cv2.resize(logo_white, (target_w, target_h), interpolation=cv2.INTER_AREA)
    
    p_ox = (1200 - target_w) // 2
    p_oy = (630 - target_h) // 2 - 30
    
    p_alpha = resized_logo[:, :, 3] / 255.0
    for c in range(3):
        preview[p_oy:p_oy+target_h, p_ox:p_ox+target_w, c] = (
            p_alpha * resized_logo[:, :, c] + (1 - p_alpha) * preview[p_oy:p_oy+target_h, p_ox:p_ox+target_w, c]
        ).astype(np.uint8)
        
    cv2.imwrite('public/brand/jawed-habib/brand-preview.webp', preview)
    print("Generated brand-preview.webp")

if __name__ == '__main__':
    generate_svg_and_png()
