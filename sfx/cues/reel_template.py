"""Sound für ReelTemplate (Profil lift). Jede Zeit kommt aus der Timeline.

    python3 -m sfx sfx/cues/reel_template.py

CompliHub-Regeln (c360-review): kein riser(), kein impact() — Klarheit statt
Druck. Alles Tonale in D-Dur; die Tonhöhe steigt mit dem Fortschritt und löst
sich auf der Endcard auf.
"""

from sfx.synth import blip, chime, envelope, pad, pop, whoosh

TIMELINE = "videos/reel-template/timeline.json"
OUT = "public/reel-template.wav"
TARGET_LUFS = -14.0

BED_A = [146.83, 220.0, 293.66, 369.99]  # D  — Dmaj
BED_B = [146.83, 220.0, 293.66, 440.0, 587.33]  # D6/9-Öffnung auf der Endcard
CHECK_NOTES = [659.25, 739.99, 880.0]  # E, F#, A — steigend
END_CHORD = [587.33, 739.99, 880.0, 1174.66]


def score(mix, tl):
    s1, s2, end = tl["s1"], tl["s2"], tl["end"]
    dur = tl["duration"]
    put = mix.put

    volume = envelope([
        (0, 0.6), (1.2, 1), (s2["merge"], 1), (end["iris"], 0.55),
        (end["iris"] + 0.6, 1.1), (dur - 1.0, 1.1), (dur, 0),
    ])
    mix.put_stereo(0, *pad(dur, [(0, BED_A), (end["iris"], BED_B)], volume=volume), gain=0.026)

    # s1 · Hook: steht ab Frame 0, ein weicher Atemzug zum Einstieg
    put(s1["hook"] + 0.05, blip(293.66, dur=0.6, tau=0.25), 0.12)

    # s2 · Karten: Luft beim Einlaufen, ein Pop in key auf jedem Haken
    for i, (c, k) in enumerate(zip(s2["cards"], s2["checks"])):
        put(c, whoosh(0.35, 400, 1800, peak=0.5), 0.09, pan=-0.2 + i * 0.2)
        put(k, pop(CHECK_NOTES[i], CHECK_NOTES[i] * 0.75), 0.3, pan=-0.15)
        put(k + 0.06, blip(CHECK_NOTES[i], dur=0.4, tau=0.12), 0.1)

    # Verdichten → Punkt → Iris: ein Luftzug zur Mitte, keine Wucht
    put(s2["merge"], whoosh(0.5, 2200, 500, peak=0.6), 0.12)

    # Endcard: Ankunft
    put(end["chime"], chime(END_CHORD, dur=2.4, tau=0.9), 0.2)
