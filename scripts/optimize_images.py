#!/usr/bin/env python3
"""Optimize the club's render photos into web-ready assets with semantic names."""
import os
from PIL import Image, ImageFilter

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SRC, "assets", "img")
os.makedirs(OUT, exist_ok=True)

# source file -> semantic name
MAPPING = {
    # Hero slideshow (bright, wide pilates halls)
    "30000_Post.jpg":  "hero-1",
    "40000_Post.jpg":  "hero-2",
    "170000_Post.jpg": "hero-3",
    "60000_Post.jpg":  "hero-4",
    # Pilates studio gallery
    "50000_Post.jpg":  "pilates-1",
    "90000_Post.jpg":  "pilates-2",
    "100000_Post.jpg": "pilates-3",
    "110000_Post.jpg": "pilates-4",
    "80000_Post.jpg":  "pilates-5",
    "120000_Post.jpg": "pilates-6",
    "130000_Post.jpg": "pilates-7",
    "70000_Post.jpg":  "pilates-8",
    # Details
    "150000_Post.jpg": "detail-1",
    "160000_Post.jpg": "detail-2",
    "180000_Post.jpg": "detail-3",
    # Lounge / relax
    "10000_Post.jpg":  "lounge-1",
    "20000_Post.jpg":  "lounge-2",
    # Brand / entrance
    "K_50000_Post.jpg": "brand-gold",
    "K_80000_Post.jpg": "brand-pilates",
    "K_20000_Post.jpg": "entrance-1",
    "K_30000_Post.jpg": "entrance-2",
    "K_40000_Post.jpg": "entrance-3",
    "K_10000_Post.jpg": "corridor",
    "K_70000_Post.jpg": "storage-1",
    "K_60000_Post.jpg": "storage-2",
}

MAX_EDGE = 1800
THUMB_EDGE = 700
QUALITY = 82


def save_variant(img, path, max_edge, quality):
    im = img.copy()
    im.thumbnail((max_edge, max_edge), Image.LANCZOS)
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    return im.size


def make_lqip(img, path):
    """Tiny blurred placeholder for smooth lazy-load."""
    im = img.copy()
    im.thumbnail((24, 24), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(1))
    im.save(path, "JPEG", quality=40)


total_in = total_out = 0
for src, name in MAPPING.items():
    sp = os.path.join(SRC, src)
    if not os.path.exists(sp):
        print("MISSING", src)
        continue
    img = Image.open(sp).convert("RGB")
    full = os.path.join(OUT, f"{name}.jpg")
    thumb = os.path.join(OUT, f"{name}-thumb.jpg")
    size = save_variant(img, full, MAX_EDGE, QUALITY)
    save_variant(img, thumb, THUMB_EDGE, 78)
    total_in += os.path.getsize(sp)
    total_out += os.path.getsize(full) + os.path.getsize(thumb)
    print(f"{src:20s} -> {name:14s} {size[0]}x{size[1]}  {os.path.getsize(full)//1024} KB")

print(f"\nTotal in:  {total_in/1024/1024:.1f} MB")
print(f"Total out: {total_out/1024/1024:.1f} MB")
