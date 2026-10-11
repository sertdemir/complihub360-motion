"""Gemeinsames Gerüst der Zen-Varianten für Reel 01 (siehe reel_01_zen_*.py)."""

from sfx.synth import envelope
from sfx.zen import Hall, drone

TIMELINE = "videos/reel-01/timeline.json"
TARGET_LUFS = -16.0  # weicher Inhalt: lieber Luft als Verdichtung


def bed(mix, tl, chords, gain):
    """Drone über die ganze Länge; Akkordwechsel als weiche Überblendung zweier Drones."""
    dur = tl["duration"]
    for k, (t0, freqs) in enumerate(chords):
        t1 = chords[k + 1][0] if k + 1 < len(chords) else dur
        pts = [(0, 0), (max(0, t0 - 0.01), 0), (t0 + 1.2, 1), (t1, 1), (min(dur, t1 + 1.5), 0), (dur, 0)]
        if k == 0:
            pts = [(0, 0.5), (1.5, 1), (t1, 1), (min(dur, t1 + 1.5), 0), (dur, 0)]
        if k == len(chords) - 1:
            pts = [p for p in pts if p[0] < t1] + [(dur - 1.2, 1), (dur, 0)]
        mix.put_stereo(0, *drone(dur, freqs, volume=envelope(sorted(set(pts)))), gain=gain)


def place(mix, hall, t, samples, gain, pan=0.0, send=0.7):
    mix.put(t, samples, gain, pan=pan)
    hall.put(t, samples, send * gain)


def finish(mix, hall, wet=1.0):
    mix.put_stereo(0, *hall.render(), gain=wet)
