"""Tap-Proof · Stufe 0: Drone-Bett, ein weicher Holzschlägel auf jedem Tipp (aufsteigend in
D-Dur-Pentatonik), leise Schlägel auf den Risk-Map-Zeilen, Atem beim Übergang und beim
Auflösen ins Licht, eine Klangschale auf der Endcard. Kein Klick, Pop, Whoosh, Riser oder Impact.

    python3 -m sfx sfx/cues/tap_proof.py
"""

from sfx.cues._reel01_zen import TARGET_LUFS, bed, finish, place  # noqa: F401
from sfx.zen import Hall, bowl, breath, mallet

TIMELINE = "videos/tap-proof/timeline.json"
OUT = "public/tap-proof.wav"


def score(mix, tl):
    s2, s3, s4, s5, end = (tl[k] for k in ("s2", "s3", "s4", "s5", "end"))
    hall = Hall(tl["duration"])
    bed(mix, tl, [(0, [73.42, 110.0, 146.83, 220.0]), (s4["card"], [73.42, 110.0, 146.83, 246.94, 329.63]),
                  (end["iris"], [73.42, 110.0, 146.83, 185.0, 220.0])], 0.06)
    # Tipp: der Ring pulst, der Schlägel klingt — einmal, weich, Ton steigt mit jeder Stufe.
    for t, f in ((s2["ring"], 220.0), (s3["ring"], 246.94), (s4["ring"], 293.66)):
        place(mix, hall, t, mallet(f, dur=2.4, tau=0.8), 0.16, pan=0.15, send=0.9)
    for t, f in zip(s3["rows"], (293.66, 329.63, 369.99)):
        place(mix, hall, t, mallet(f, dur=1.6, tau=0.45), 0.06, pan=-0.1, send=0.8)
    for t in (s3["card"], s5["dissolve"]):
        place(mix, hall, t - 0.4, breath(1.8, fc=520, peak=0.55), 0.09, send=1.0)
    place(mix, hall, end["chime"], bowl(146.83, dur=8, strike=0.9), 0.15)
    finish(mix, hall)
