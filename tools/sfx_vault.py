"""Procedural SFX Engine for Faceless Shorts.
Generates broadcast-quality, copyright-free sound effects (48kHz 16-bit WAV)
using pure numpy and scipy synthesis. Zero external assets required.
"""
import math
import os
from pathlib import Path
import numpy as np
from scipy.io import wavfile

SAMPLE_RATE = 48000
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "assets" / "audio" / "sfx"


def save_wav(name: str, audio: np.ndarray):
    """Normalize and save 16-bit stereo WAV."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if audio.ndim == 1:
        audio = np.column_stack([audio, audio])
    # Peak normalization to -1.0 dB
    peak = np.max(np.abs(audio))
    if peak > 0:
        audio = audio / peak * 0.89
    int16_audio = (audio * 32767).astype(np.int16)
    filepath = OUTPUT_DIR / f"{name}.wav"
    wavfile.write(str(filepath), SAMPLE_RATE, int16_audio)
    print(f"Generated SFX: {filepath.name}")


def gen_whoosh(duration: float = 0.35):
    """Cinematic air whoosh for camera transitions and cuts."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, 1, n)
    # Filtered white noise with bell curve envelope
    noise = np.random.uniform(-1, 1, n)
    envelope = np.sin(t * np.pi) ** 3
    # Frequency sweep using sinusoidal modulation
    mod = np.sin(2 * np.pi * 3 * t) * 0.3 + 0.7
    audio = noise * envelope * mod
    save_wav("whoosh", audio)


def gen_pop(duration: float = 0.08):
    """Snappy bubble pop for dynamic word highlights and stickers."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n)
    # Rapid pitch drop from 900Hz to 200Hz
    freq = np.linspace(950, 150, n)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    envelope = np.exp(-t * 60)
    audio = np.sin(phase) * envelope
    save_wav("pop", audio)


def gen_impact(duration: float = 0.8):
    """Deep cinematic sub-bass impact for plot twists and revelations."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n)
    # Pitch bend from 110Hz to 35Hz
    freq = 35 + 75 * np.exp(-t * 9)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    bass = np.sin(phase)
    # Add punch transient
    click = np.random.uniform(-1, 1, n) * np.exp(-t * 80) * 0.4
    envelope = np.exp(-t * 4.5)
    audio = (bass + click) * envelope
    save_wav("impact", audio)


def gen_riser(duration: float = 2.0):
    """Tension-building pitch riser for suspense escalation."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, 1, n)
    # Exponential frequency rise from 120Hz to 850Hz
    freq = 120 * (850 / 120) ** (t ** 1.8)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    tone = np.sin(phase)
    # Add white noise layer
    noise = np.random.uniform(-1, 1, n) * 0.25
    envelope = (t ** 2.5)
    audio = (tone + noise) * envelope
    save_wav("riser", audio)


def gen_ding(duration: float = 0.6):
    """Bright bell chime for numbers, stats, and key discoveries."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n)
    f0 = 1568.0  # Note G6
    # Harmonics
    b1 = np.sin(2 * np.pi * f0 * t) * np.exp(-t * 6)
    b2 = np.sin(2 * np.pi * (f0 * 2.756) * t) * np.exp(-t * 11) * 0.4
    b3 = np.sin(2 * np.pi * (f0 * 5.404) * t) * np.exp(-t * 18) * 0.2
    audio = b1 + b2 + b3
    save_wav("ding", audio)


def gen_tape_stop(duration: float = 0.45):
    """Vinyl record stop / comedic pause effect."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n)
    # Exponential slowdown
    freq = 440 * np.maximum(0, (1 - (t / duration) ** 0.8))
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    tone = np.sin(phase) + 0.3 * np.sin(2 * phase)
    envelope = np.maximum(0, 1 - (t / duration) ** 1.5)
    audio = tone * envelope
    save_wav("tape_stop", audio)


def gen_heartbeat(duration: float = 0.9):
    """Tense double heartbeat for predator encounters and survival danger."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n)
    audio = np.zeros(n)
    # First thump at 0.05s
    n1 = int(SAMPLE_RATE * 0.05)
    t_thump = np.linspace(0, 0.18, int(SAMPLE_RATE * 0.18))
    thump1 = np.sin(2 * np.pi * 55 * t_thump) * np.exp(-t_thump * 22)
    audio[n1:n1 + len(thump1)] += thump1
    # Second thump at 0.32s
    n2 = int(SAMPLE_RATE * 0.32)
    thump2 = np.sin(2 * np.pi * 48 * t_thump) * np.exp(-t_thump * 20) * 0.8
    audio[n2:n2 + len(thump2)] += thump2
    save_wav("heartbeat", audio)


def gen_paper_turn(duration: float = 0.3):
    """Textured parchment ruffle for Paper Atlas historical map transitions."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, 1, n)
    noise = np.random.uniform(-1, 1, n)
    env = np.sin(t * np.pi) ** 2
    f_mod = np.sin(2 * np.pi * 12 * t) * 0.4 + 0.6
    audio = noise * env * f_mod
    save_wav("paper_turn", audio)


def main():
    print(f"Building sound effects vault in: {OUTPUT_DIR}")
    gen_whoosh()
    gen_pop()
    gen_impact()
    gen_riser()
    gen_ding()
    gen_tape_stop()
    gen_heartbeat()
    gen_paper_turn()
    print(f"All 8 core procedural sound effects generated successfully!")


if __name__ == "__main__":
    main()
