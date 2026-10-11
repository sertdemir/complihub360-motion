"""Klang für die Kombi-Probe "Die Linie findet den Kompass" (videos/styles/combo.json).

    python3 -m sfx sfx/cues/style_combo.py
"""

from sfx.cues._reel01_zen import bed, finish, place
from sfx.zen import Hall, bowl, breath, mallet

TIMELINE = "videos/styles/combo.json"
OUT = "public/styles/combo.wav"
TARGET_LUFS = -16.0


def score(mix, tl):
    hall = Hall(tl["duration"])
    bed(mix, tl, [(0, [73.42, 110.0, 146.83, 220.0]), (tl["to3d"], [73.42, 110.0, 146.83, 185.0, 220.0])], 0.05)
    place(mix, hall, 0.1, breath(2.6, fc=480, peak=0.6), 0.07, send=0.9)       # die Linie sucht
    place(mix, hall, tl["circleClosed"], mallet(440.0, tau=1.3), 0.09)         # der Kreis schließt sich
    place(mix, hall, tl["tiltStart"], breath(1.6, fc=420, peak=0.5), 0.06)     # Kippen in den Raum
    place(mix, hall, tl["needle"] + 2.1, bowl(220.0, dur=5, strike=0.6), 0.1)  # die Nadel steht
    place(mix, hall, tl["logo"], bowl(146.83, dur=6, strike=0.8), 0.14)        # Bildmarke
    finish(mix, hall)
