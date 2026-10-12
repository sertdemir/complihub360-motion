"""Klang der Probe "Produkt-Reel" im MakerMap-Stil (videos/product-probe/timeline.json).

    python3 -m sfx sfx/cues/product_probe.py

Zen-Profil: Drone-Bett, Atem bei jeder Verwandlung der Form, leiser Schlegel bei
jedem Klick, Klangschale beim Häkchen und beim Ende. D-Dur-Pentatonik.
"""

from sfx.cues._reel01_zen import bed, finish, place
from sfx.zen import Hall, bowl, breath, mallet

TIMELINE = "videos/product-probe/timeline.json"
OUT = "public/probe/product.wav"
TARGET_LUFS = -16.0


def score(mix, tl):
    hall = Hall(tl["duration"])
    bed(mix, tl, [(0, [73.42, 110.0, 146.83, 220.0]), (tl["risk"], [73.42, 110.0, 146.83, 185.0, 220.0])], 0.05)
    for t in (tl["button"], tl["wizard"], tl["spinner"], tl["risk"], tl["match"], tl["end"]):
        place(mix, hall, t - 0.1, breath(0.9, fc=440, peak=0.45), 0.05)                 # die Form verwandelt sich
    for i, t in enumerate([tl["click"], *tl["picks"], tl["next"]]):
        place(mix, hall, t, mallet((293.66, 329.63, 369.99, 440.0)[i], tau=0.9), 0.05, pan=(-0.15, 0.15, -0.1, 0.1)[i])
    place(mix, hall, tl["check"], bowl(220.0, dur=4, strike=0.6), 0.09)                 # Häkchen
    place(mix, hall, tl["dot"] + 0.3, mallet(587.33, tau=1.4), 0.05)                     # Gold-Punkt
    for i, t in enumerate(tl["rows"]):
        place(mix, hall, t, mallet((293.66, 329.63, 369.99, 440.0)[i], tau=0.8), 0.035)
    for i, t in enumerate(tl["cards"]):
        place(mix, hall, t, mallet((369.99, 440.0)[i], tau=1.0), 0.04)
    place(mix, hall, tl["claim"], bowl(146.83, dur=5, strike=0.8), 0.12)                # Claim
    finish(mix, hall)
