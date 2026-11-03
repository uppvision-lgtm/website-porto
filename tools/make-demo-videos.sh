#!/bin/bash
# Gabung frame PNG jadi video (zoom Ken Burns + crossfade) — tanpa drawtext.
set -e
V="/Users/mymac/Documents/website porto/assets/videos"
T=/tmp/vidauto
mkdir -p "$V"

seg(){ # IMG OUT DUR
  local img="$1" out="$2" dur="$3"
  local frames=$((dur*25))
  ffmpeg -y -loglevel error -i "$img" \
    -vf "zoompan=z='min(zoom+0.0009,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$frames:s=1920x1080:fps=25" \
    -an -c:v libx264 -crf 24 -preset fast -pix_fmt yuv420p "$out"
}

mix(){ # OUT DUR FADE SEG...
  local out="$1" dur="$2" fade="$3"; shift 3
  local inputs=() fc="" prev="[0:v]" off=0 i=1
  for s in "$@"; do inputs+=(-i "$s"); done
  local total=$#
  while [ $i -lt "$total" ]; do
    off=$(awk "BEGIN{printf \"%.2f\", $off + $dur - $fade}")
    fc+="${prev}[${i}:v]xfade=transition=fade:duration=$fade:offset=$off[v$i];"
    prev="[v$i]"
    i=$((i+1))
  done
  fc="${fc%;}"
  local last="[v$((total-1))]"
  ffmpeg -y -loglevel error "${inputs[@]}" -filter_complex "$fc" -map "$last" \
    -an -c:v libx264 -crf 26 -preset medium -pix_fmt yuv420p -movflags +faststart "$out"
}

echo "== PHONEFARM =="
for i in 1 2 3 4; do seg "$T/p$i.png" "$T/ps$i.mp4" 5; done
mix "$V/phonefarm.mp4" 5 0.6 "$T/ps1.mp4" "$T/ps2.mp4" "$T/ps3.mp4" "$T/ps4.mp4"

echo "== GODAM =="
for i in 1 2 3 4 5 6; do seg "$T/g$i.png" "$T/gs$i.mp4" 3; done
mix "$V/godam.mp4" 3 0.6 "$T/gs1.mp4" "$T/gs2.mp4" "$T/gs3.mp4" "$T/gs4.mp4" "$T/gs5.mp4" "$T/gs6.mp4"

echo "== SELESAI =="
