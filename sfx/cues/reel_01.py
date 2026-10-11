"""Reel 01 · Klang "Atem" (Runde 2, Variante C): tragender Klangteppich, Atemzüge auf jedem
Übergang, eine Klangschale auf der Endcard. Kein Klick, Pop, Whoosh, Riser oder Impact.

    python3 -m sfx sfx/cues/reel_01.py
"""

from sfx.cues._reel01_zen import TARGET_LUFS, TIMELINE, bed, finish, place  # noqa: F401
from sfx.zen import Hall, bowl, breath

OUT = "public/reel-01.wav"


def score(mix, tl):
    s2, s3, s4, s5, end = (tl[k] for k in ("s2", "s3", "s4", "s5", "end"))
    hall = Hall(tl["duration"])
    bed(mix, tl, [(0, [73.42, 110.0, 146.83, 220.0]), (s4["card"], [73.42, 110.0, 146.83, 246.94, 329.63]),
                  (end["iris"], [73.42, 110.0, 146.83, 185.0, 220.0])], 0.06)
    for t in (s2["chips"], s3["card"], s4["card"], s5["cards"][0], s5["merge"]):
        place(mix, hall, t - 0.5, breath(1.8, fc=520, peak=0.55), 0.1, send=1.0)
    place(mix, hall, end["chime"], bowl(146.83, dur=8, strike=0.9), 0.15)
    finish(mix, hall)
