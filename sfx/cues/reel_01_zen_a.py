"""Reel 01 · Zen A "Klangschale": Schalen auf den Ruhepunkten, Atem bei Übergängen, leise Schlägel."""

from sfx.cues._reel01_zen import TARGET_LUFS, TIMELINE, bed, finish, place  # noqa: F401
from sfx.zen import Hall, bowl, breath, mallet

OUT = "public/reel-01-zen-a.wav"


def score(mix, tl):
    s1, s2, s3, s4, s5, end = (tl[k] for k in ("s1", "s2", "s3", "s4", "s5", "end"))
    hall = Hall(tl["duration"])
    bed(mix, tl, [(0, [73.42, 110.0, 146.83]), (s4["card"], [73.42, 110.0, 146.83, 185.0]), (end["iris"], [73.42, 110.0, 146.83, 220.0])], 0.05)

    place(mix, hall, s1["hook"] + 0.05, bowl(146.83, dur=6, strike=0.8), 0.16)
    for t in (s2["chips"], s3["card"], s4["card"], s5["cards"][0], s5["merge"]):
        place(mix, hall, t - 0.25, breath(1.3, fc=650, peak=0.45), 0.07, send=0.9)
    place(mix, hall, s2["snap"], mallet(440.0, tau=0.9), 0.08)
    for i, t in enumerate(s3["picks"]):
        place(mix, hall, t, mallet([369.99, 440.0][i]), 0.09, pan=-0.2 + 0.4 * i)
    place(mix, hall, s4["line"] + 0.2, bowl(220.0, dur=6, strike=0.7), 0.12)
    for i, t in enumerate(s5["cards"]):
        place(mix, hall, t, mallet([587.33, 659.25][i]), 0.07, pan=-0.2 + 0.4 * i)
    place(mix, hall, end["chime"], bowl(146.83, dur=8, strike=0.9), 0.16)
    place(mix, hall, end["chime"] + 0.9, bowl(220.0, dur=7, strike=0.6), 0.1)
    finish(mix, hall)
