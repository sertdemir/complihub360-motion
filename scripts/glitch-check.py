"""Findet Render-Aussetzer: Frames mit vollständig weißen oder schwarzen Kacheln.

    python3 scripts/glitch-check.py out/reel01-de.mp4

Hintergrund: Bei langen Renderläufen in voller Auflösung malt Chromium in der
Cloud-Umgebung gelegentlich einzelne 256-px-Kacheln nicht aus. Unsere CI hat
nie reines #FFF oder #000 auf einer ganzen Kachel (Gradient, Petrol, Karten mit
Transparenz), also ist jede solche Kachel ein Fehler. Exit-Code 1, wenn einer
gefunden wird; ausgegeben werden die Frame-Nummern zum Nachrendern.
"""

import subprocess
import sys

TILE = 32  # 256 px bei 1/8 Auflösung
W, H = 135, 240  # 1080×1920 / 8


def frames(path):
    p = subprocess.Popen(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-vf", f"scale={W}:{H}:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
    )
    n = W * H * 3
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        yield buf


def bad_tiles(buf):
    hits = 0
    for ty in range(0, H - TILE + 1, TILE):
        for tx in range(0, W - TILE + 1, TILE):
            white = black = True
            for y in range(ty, ty + TILE, 4):
                row = (y * W + tx) * 3
                for x in range(0, TILE * 3, 12):
                    r, g, b = buf[row + x], buf[row + x + 1], buf[row + x + 2]
                    if not (r >= 253 and g >= 253 and b >= 253):
                        white = False
                    if not (r <= 3 and g <= 3 and b <= 3):
                        black = False
                    if not white and not black:
                        break
                if not white and not black:
                    break
            hits += white or black
    return hits


def main():
    path = sys.argv[1]
    bad = [i for i, f in enumerate(frames(path)) if bad_tiles(f)]
    if bad:
        print(f"{path}: {len(bad)} Frames mit Aussetzern: {bad}")
        sys.exit(1)
    print(f"{path}: keine Aussetzer")


if __name__ == "__main__":
    main()
