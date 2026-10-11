"""Reel 01 · Zen B "Kalimba": eine steigende Pentatonik-Linie aus weichen Schlägeln, Drone sehr leise."""

from sfx.cues._reel01_zen import TARGET_LUFS, TIMELINE, bed, finish, place  # noqa: F401
from sfx.zen import PENTA, Hall, bowl, mallet

OUT = "public/reel-01-zen-b.wav"


def score(mix, tl):
    s1, s2, s3, s4, s5, end = (tl[k] for k in ("s1", "s2", "s3", "s4", "s5", "end"))
    hall = Hall(tl["duration"])
    bed(mix, tl, [(0, [73.42, 146.83]), (end["iris"], [73.42, 110.0, 146.83])], 0.035)

    note = lambda i, t, g=0.1, pan=0.0: place(mix, hall, t, mallet(PENTA[i], tau=1.0), g, pan=pan)  # noqa: E731
    note(5, s1["hook"] + 0.05, 0.12)               # D4
    note(6, s2["line"])                            # E4
    note(8, s2["snap"])                            # A4
    note(9, s3["picks"][0], pan=-0.2)              # B4
    note(10, s3["picks"][1], pan=0.2)              # D5
    for i, t in enumerate(s4["rows"]):             # ruhig, leiser: F#4 A4 B4 D5
        note([7, 8, 9, 10][i], t, 0.06, pan=-0.3 + 0.2 * i)
    note(11, s5["cards"][0], pan=-0.2)             # E5
    note(12, s5["cards"][1], pan=0.2)              # F#5
    for i, k in enumerate([5, 8, 10, 12]):         # Endcard: D4 A4 D5 F#5 als Arpeggio
        note(k, end["chime"] + i * 0.18, 0.1)
    place(mix, hall, end["chime"], bowl(146.83, dur=7, strike=0.5), 0.08)
    finish(mix, hall)
