"""Klang für die drei Stilproben (videos/styles), Zen-Baukasten, gleiche Timeline.

    STYLE=line python3 -m sfx sfx/cues/style_probes.py      # → public/styles/line.wav
    STYLE=objects ...
"""

import os

from sfx.cues._reel01_zen import bed, finish, place
from sfx.zen import Hall, bowl, breath, mallet

STYLE = os.environ.get("STYLE", "line")
TIMELINE = "videos/styles/timeline.json"
OUT = f"public/styles/{STYLE}.wav"
TARGET_LUFS = -16.0


def score(mix, tl):
    hall = Hall(tl["duration"])
    bed(mix, tl, [(0, [73.42, 110.0, 146.83, 220.0])], 0.05)
    if STYLE == "line":
        # der Stift: ein langer, leiser Atemzug unter dem Zeichnen, ein Ton, wenn die Linie ruhig wird
        place(mix, hall, 0.1, breath(2.6, fc=480, peak=0.6), 0.07, send=0.9)
        place(mix, hall, 2.2, mallet(440.0, tau=1.2), 0.08)
    elif STYLE == "objects":
        # die Nadel schwingt aus: Schalenton, wenn sie steht
        place(mix, hall, 3.3, bowl(220.0, dur=5, strike=0.6), 0.1)
    place(mix, hall, tl["logo"], bowl(146.83, dur=6, strike=0.8), 0.14)
    finish(mix, hall)
