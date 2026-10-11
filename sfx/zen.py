"""Weiche, meditative Klangerzeuger für CompliHub360 (Profil "zen").

Ergänzt synth.py, ohne es zu ändern. Regeln, die hier eingebaut sind:
- kein harter Anschlag: jede Attacke >= 6 ms, als Raised-Cosine,
- kein Hochfrequenz-Rauschen: Rauschen nur tiefpassgefiltert (< 1,2 kHz),
- nichts pumpt: Bewegung kommt aus langsamen, unabhängigen LFOs (< 0,15 Hz),
- Raum statt Lautstärke: ein gemeinsamer Hall (Hall) trägt die Töne.

Alle Funktionen liefern Mono-Listen bei 48 kHz, wie synth.py.
"""

import math
import random

from .dsp import reverb, svf
from .synth import SR

TAU = 2.0 * math.pi
_rng = random.Random(360)

# D-Dur-Pentatonik (D E F# A B) über drei Oktaven — alles Tonale bleibt darin.
PENTA = [146.83, 164.81, 185.00, 220.00, 246.94,
         293.66, 329.63, 369.99, 440.00, 493.88,
         587.33, 659.25, 739.99, 880.00, 987.77]


def _attack(i, n_att):
    return 0.5 - 0.5 * math.cos(math.pi * i / n_att) if i < n_att else 1.0


def bowl(freq, dur=7.0, strike=1.0):
    """Klangschale: unharmonische Teiltöne mit Schwebung, weicher Anschlag, langer Ausklang. Für Ankünfte und Ruhepunkte."""
    n = int(dur * SR)
    att = int(0.012 * SR)
    # (Verhältnis, Amplitude, Abklingzeit s, Schwebung Hz)
    parts = [(1.0, 1.0, dur * 0.55, 0.6), (2.71, 0.42, dur * 0.32, 1.1),
             (5.15, 0.16, dur * 0.18, 1.7), (8.43, 0.06, dur * 0.1, 2.3)]
    out = [0.0] * n
    for ratio, amp, tau, beat in parts:
        f = freq * ratio
        a = amp * strike
        ph1 = _rng.random() * TAU
        ph2 = _rng.random() * TAU
        w1 = TAU * (f - beat / 2) / SR
        w2 = TAU * (f + beat / 2) / SR
        k = -1.0 / (tau * SR)
        out = [o + a * math.exp(k * i) * 0.5 * (math.sin(ph1 + w1 * i) + math.sin(ph2 + w2 * i))
               for i, o in enumerate(out)]
    return [o * _attack(i, att) for i, o in enumerate(out)]


def mallet(freq, dur=2.4, tau=0.7):
    """Weicher Holzschlägel (Kalimba-artig): Grundton plus kurzer 4. Teilton. Für Auswahl, Haken, Schritte."""
    n = int(dur * SR)
    att = int(0.006 * SR)
    w = TAU * freq / SR
    w4 = TAU * freq * 4.02 / SR
    k = -1.0 / (tau * SR)
    k4 = -1.0 / (0.08 * SR)
    return [_attack(i, att) * (math.exp(k * i) * math.sin(w * i) + 0.12 * math.exp(k4 * i) * math.sin(w4 * i))
            for i in range(n)]


def breath(dur, fc=700, peak=0.5):
    """Atem: tiefpassgefiltertes Rauschen, das an- und abschwillt. Ersetzt den Whoosh bei Übergängen."""
    n = int(dur * SR)
    noise = [_rng.uniform(-1, 1) for _ in range(n)]
    soft = svf(svf(noise, min(fc, 1200), q=0.6), min(fc, 1200) * 0.8, q=0.6)
    p = max(0.05, min(0.95, peak))
    env = [math.sin(math.pi * min(1.0, (i / n) / p) * 0.5) ** 2 if i / n < p
           else math.cos(math.pi * 0.5 * ((i / n) - p) / (1 - p)) ** 2 for i in range(n)]
    return [s * e for s, e in zip(soft, env)]


def drone(duration, freqs, volume=None, detune=0.35):
    """Ruhiger Klangteppich: Sinus-Stimmen mit eigenen langsamen LFOs, kein Tremolo-Pumpen. Liefert (left, right)."""
    n = int(duration * SR)
    left = [0.0] * n
    right = [0.0] * n
    for j, f in enumerate(freqs):
        g = 1.0 / (1 + j * 0.7)
        rate = 0.05 + 0.023 * j
        off = j * 1.7
        wl = TAU * (f - detune) / SR
        wr = TAU * (f + detune) / SR
        for i in range(n):
            t = i / SR
            v = g * (0.7 + 0.3 * math.sin(TAU * rate * t + off)) * (volume(t) if volume else 1.0)
            left[i] += v * math.sin(wl * i)
            right[i] += v * math.sin(wr * i + 0.3)
    return left, right


class Hall:
    """Gemeinsamer Hall: put() schickt ein Signal hinein, render() gibt (left, right) zurück."""

    def __init__(self, duration):
        self.n = int(duration * SR)
        self.buf = [0.0] * self.n

    def put(self, t, samples, send=1.0):
        i0 = int(t * SR)
        for k, s in enumerate(samples):
            i = i0 + k
            if 0 <= i < self.n:
                self.buf[i] += s * send

    def render(self, size=0.86, damp=0.6, scale=1.5):
        return reverb(self.buf, size=size, damp=damp, scale=scale)
