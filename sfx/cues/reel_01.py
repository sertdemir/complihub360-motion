"""Sound für Reel 01 (DE und EN teilen Bild-Timing und Ton).

    python3 -m sfx sfx/cues/reel_01.py

CompliHub-Regeln (c360-review): kein riser(), kein impact(). D-Dur; die
Tonhöhe steigt mit dem Fortschritt. Die Risk-Map-Szene (s4) ist calm: kein
Pop, nur ein Akkord, der sich öffnet.
"""

from sfx.synth import blip, chime, click, envelope, pad, pop, whoosh

TIMELINE = "videos/reel-01/timeline.json"
OUT = "public/reel-01.wav"
TARGET_LUFS = -14.0

BED_A = [146.83, 220.0, 293.66, 369.99]  # Dmaj
BED_B = [146.83, 220.0, 293.66, 369.99, 440.0, 554.37]  # Dmaj9 — die Risk Map öffnet
BED_C = [146.83, 220.0, 293.66, 440.0, 587.33]  # D6/9 — Endcard
PICK_NOTES = [659.25, 739.99]  # E, F#
MAP_CHORD = [587.33, 739.99, 880.0]
FIT_NOTES = [880.0, 987.77]  # A, B
END_CHORD = [587.33, 739.99, 880.0, 1174.66]


def score(mix, tl):
    s1, s2, s3, s4, s5, end = (tl[k] for k in ("s1", "s2", "s3", "s4", "s5", "end"))
    dur = tl["duration"]
    put = mix.put

    volume = envelope([
        (0, 0.6), (1.2, 1), (s5["merge"], 1), (end["iris"], 0.55),
        (end["iris"] + 0.6, 1.1), (dur - 1.0, 1.1), (dur, 0),
    ])
    chords = [(0, BED_A), (s4["card"], BED_B), (end["iris"], BED_C)]
    mix.put_stereo(0, *pad(dur, chords, volume=volume), gain=0.026)

    # s1 · Hook steht ab Frame 0
    put(s1["hook"] + 0.05, blip(293.66, dur=0.6, tau=0.25), 0.12)

    # s2 · Chips driften ein, rasten ein
    put(s2["chips"], whoosh(0.6, 300, 1600, peak=0.4), 0.08)
    for i in range(6):
        put(s2["snap"] + i * 0.03, click(1500 + i * 120), 0.07, pan=-0.5 + i * 0.2)
    put(s2["out"], whoosh(0.45, 1800, 500, peak=0.6), 0.09)

    # s3 · Wizard: Karte, zwei Picks, Weiter
    put(s3["card"], whoosh(0.35, 400, 1800, peak=0.5), 0.09)
    for i, t in enumerate(s3["picks"]):
        put(t, pop(PICK_NOTES[i], PICK_NOTES[i] * 0.75), 0.24, pan=-0.1 + i * 0.2)
    put(s3["press"], click(1200), 0.16)

    # s4 · Risk Map (calm): ein Akkord, kein Pop
    put(s4["line"] + 0.3, chime(MAP_CHORD, dur=2.6, tau=1.1), 0.1)

    # s5 · Fachleute
    for i, t in enumerate(s5["cards"]):
        put(t, pop(FIT_NOTES[i], FIT_NOTES[i] * 0.8), 0.22, pan=-0.15 + i * 0.3)
        put(t + 0.06, blip(FIT_NOTES[i], dur=0.4, tau=0.12), 0.08)
    put(s5["merge"], whoosh(0.5, 2200, 500, peak=0.6), 0.12)

    # Endcard
    put(end["chime"], chime(END_CHORD, dur=2.6, tau=0.9), 0.2)
