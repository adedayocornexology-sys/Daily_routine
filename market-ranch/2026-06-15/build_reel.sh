#!/usr/bin/env bash
# Build the Market Ranch "Ibom Open" Instagram Reel (9:16, brand yellow/black)
set -euo pipefail
cd "$(dirname "$0")"

FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
YELLOW="0xFFD200"
W=1080; H=1920
DUR=2.2            # seconds per clip
XF=0.5            # crossfade duration
FPS=30

# clip order: photo|text  (use ; for line breaks)
CLIPS=(
  "bf321330-1000377342.jpg|WHAT YOU MISSED AT;THE IBOM OPEN"
  "3e6b4096-1000377318.jpg|It started before;the crowd did."
  "24b62f22-1000377327.jpg|Ibom Open · Akwa Ibom"
  "0c09e411-1000377329.jpg|We put the brand;on the green."
  "5c29d87b-1000377310.jpg|Every detail,;in its place."
  "c3c1c361-1000377314.jpg|Energy on the ground."
  "69fbd64a-1000377332.jpg|Behind every shot,;a team."
  "1f832504-1000377325.jpg|Moments worth;capturing."
  "e82607e2-1000377322.jpg|Making your brand;impossible to ignore."
)

mkdir -p _clips
i=0
for entry in "${CLIPS[@]}"; do
  img="${entry%%|*}"; txt="${entry#*|}"
  # write caption to a textfile with real newlines (avoids escaping issues)
  tf=$(printf "_clips/t%02d.txt" "$i")
  printf '%s\n' "${txt//;/$'\n'}" > "$tf"
  out=$(printf "_clips/c%02d.mp4" "$i")
  total_frames=$(python3 -c "print(int($DUR*$FPS))")
  ffmpeg -y -loop 1 -i "$img" -f lavfi -i color=c=black:s=${W}x${H} -filter_complex "
    [0:v]scale=${W}:-1:force_original_aspect_ratio=decrease,
         zoompan=z='min(zoom+0.0010,1.12)':d=${total_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':fps=${FPS}:s=${W}x608[ph];
    [1:v]trim=duration=${DUR},setsar=1[bg];
    [bg][ph]overlay=(W-w)/2:(H-h)/2[base];
    [base]drawbox=x=0:y=1330:w=1080:h=320:color=black@0.6:t=fill,
          drawtext=fontfile=${FONT}:textfile='${tf}':fontcolor=${YELLOW}:fontsize=54:
                   x=(w-text_w)/2:y=1490-text_h/2:line_spacing=16:box=0:
                   shadowcolor=black:shadowx=3:shadowy=3,
          format=yuv420p[v]
  " -map "[v]" -r ${FPS} -t ${DUR} -c:v libx264 -pix_fmt yuv420p "$out"
  i=$((i+1))
done

# Outro brand card (black + yellow)
printf 'MARKET RANCH\n\n@marketranch\n\nBrand Activation\n' > _clips/outro.txt
oframes=$(python3 -c "print(int(($DUR+0.6)*$FPS))")
ffmpeg -y -f lavfi -i color=c=black:s=${W}x${H}:d=$(python3 -c "print($DUR+0.6)") -filter_complex "
  [0:v]drawtext=fontfile=${FONT}:text='MARKET RANCH':fontcolor=${YELLOW}:fontsize=82:x=(w-text_w)/2:y=820:shadowcolor=black:shadowx=2:shadowy=2,
       drawtext=fontfile=${FONT}:text='@marketranch':fontcolor=white:fontsize=46:x=(w-text_w)/2:y=960,
       drawtext=fontfile=${FONT}:text='Brand Activation':fontcolor=${YELLOW}:fontsize=40:x=(w-text_w)/2:y=1040,
       format=yuv420p[v]" -map "[v]" -r ${FPS} -t $(python3 -c "print($DUR+0.6)") \
  -c:v libx264 -pix_fmt yuv420p "$(printf '_clips/c%02d.mp4' "$i")"
i=$((i+1))

# Build crossfade chain
inputs=(); n=$i
for ((j=0;j<n;j++)); do inputs+=(-i "$(printf '_clips/c%02d.mp4' "$j")"); done

filter=""; prev="0"; offset=0
for ((j=1;j<n;j++)); do
  offset=$(python3 -c "print(round(($DUR-$XF)*$j,3))")
  if [ "$j" -eq 1 ]; then a="[0:v]"; else a="[x$((j-1))]"; fi
  filter+="${a}[${j}:v]xfade=transition=fade:duration=${XF}:offset=${offset}[x${j}];"
done
last="[x$((n-1))]"
filter="${filter%;}"

ffmpeg -y "${inputs[@]}" -filter_complex "$filter" -map "$last" \
  -c:v libx264 -pix_fmt yuv420p -r ${FPS} -movflags +faststart ibom_open_reel.mp4

echo "DONE: ibom_open_reel.mp4"
