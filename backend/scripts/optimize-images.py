"""Deterministic asset optimisation. Requires Pillow only when regenerating assets.
Original brand files are never modified. Runtime serving has no Pillow dependency.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

root = Path(__file__).resolve().parents[1]
source = root.parent / 'frontend' / 'assets'
target = root / 'web' / 'media'
target.mkdir(parents=True, exist_ok=True)
stats=[]
for name in ['gyani_mark_TRANSPARENT','saarthi_mark_v1','saarthi_wordmark_v1']:
    original=source/(name+'.png')
    im=Image.open(original).convert('RGBA')
    # Retain exact pixel dimensions, colours and transparency for brand marks.
    output=target/(name+'.webp')
    im.save(output,format='WEBP',lossless=True,method=6,exact=True)
    stats.append({'file':name,'width':im.width,'height':im.height,'png_bytes':original.stat().st_size,'webp_bytes':output.stat().st_size})
card=Image.new('RGB',(1200,630),'#F8F6F2')
logo=Image.open(source/'gyani_mark_TRANSPARENT.png').convert('RGBA')
logo.thumbnail((150,225),Image.Resampling.LANCZOS)
card.paste(logo,(90,185),logo)
draw=ImageDraw.Draw(card)
font_path=Path('C:/Windows/Fonts/georgia.ttf')
font=lambda size:ImageFont.truetype(str(font_path),size) if font_path.exists() else ImageFont.load_default(size=size)
draw.text((300,200),'Gyani Says',font=font(64),fill='#722F37')
draw.text((304,290),'SAARTHI',font=font(36),fill='#722F37')
draw.text((304,360),'Coaching. Learning. Guidance.',font=font(26),fill='#514842')
card.save(target/'social-card.png',optimize=True)
card.save(target/'social-card.webp',quality=90,method=6)
(target/'image-report.json').write_text(json.dumps(stats,indent=2))
print(json.dumps(stats,indent=2))
