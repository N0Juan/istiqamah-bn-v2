# PWA Icons

This directory should contain app icons in the following sizes:

- icon-72.png (72×72)
- icon-96.png (96×96)
- icon-128.png (128×128)
- icon-144.png (144×144)
- icon-152.png (152×152)
- icon-192.png (192×192)
- icon-384.png (384×384)
- icon-512.png (512×512)

## Design Guidelines

**Colors:**
- Primary: Teal Deep (#0F4C5C)
- Accent: Gold (#D4AF37)
- Background: Cream (#FAF9F6)

**Motifs:**
- Islamic geometric patterns
- Crescent moon
- Mosque dome silhouette
- Simple and recognizable at small sizes

**Format:**
- PNG with transparency
- Maskable safe zone (80% of canvas for important content)
- Square aspect ratio

## Quick Icon Generation

You can use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://maskable.app/editor (for maskable icons)

Or create manually in:
- Figma
- Adobe Illustrator
- Inkscape (free)
- GIMP (free)

## Placeholder Icons

For development, you can generate simple placeholder icons:

```bash
# Using ImageMagick (if installed)
for size in 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:#0F4C5C -fill #D4AF37 -font Arial -pointsize $((size/3)) -gravity center -annotate +0+0 "IB" icon-${size}.png
done
```

Or use an online generator and upload a simple logo design.
