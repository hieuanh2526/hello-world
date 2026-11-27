#!/usr/bin/env python3
"""vi_narration.py — Vietnamese narration helper for whiteboard-stickman-explainer.

Run with:
    uv run --with edge-tts --with numpy python vi_narration.py synth ...
    uv run --with numpy python vi_narration.py align ...

Subcommands
-----------
synth  Synthesize each scene of `## Narration` with Edge TTS, normalize to 48 kHz
       mono WAV, trim edge silence, pad each scene to a whole number of 30 fps
       frames, concatenate into voice_src.wav and write start/end back into
       script.md.
align  Estimate word timings from per-scene WAVs (10 ms RMS energy + pauses),
       keeping the Vietnamese text verbatim (diacritics untouched), and write
       words.json + transcript.md.

Conventions: every result goes to a file; stdout prints one short summary line;
warnings, retries and errors go to stderr; exit code 1 on failure.

script.md format (see SKILL.md):
    ## Narration
    ### s01 {start=0.000 end=4.233}
    Văn bản lời đọc của cảnh 1...
The `{...}` timing suffix is optional; `synth` writes or replaces it.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import wave
from pathlib import Path

SR = 48_000
FPS = 30
FRAME_SAMPLES = SR // FPS  # 1600 samples = 1 video frame
RMS_WIN_S = 0.010
LOCK_PATH = Path(tempfile.gettempdir()) / "whiteboard_stickman_edge_tts.lock"
MIN_INTERVAL_S = 1.2
MAX_ATTEMPTS = 6

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*?)\s*$")
SCENE_HEAD_RE = re.compile(r"^###\s+([A-Za-z0-9_\-]+)\b(.*?)\s*$")
TIMING_RE = re.compile(r"\{\s*start=([0-9.]+)\s+end=([0-9.]+)\s*\}")
COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
BREAK_PUNCT = set(".,;:!?…—–")


class CliError(Exception):
    pass


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


# --------------------------------------------------------------------------- #
# script.md parsing
# --------------------------------------------------------------------------- #
def parse_script(path: Path) -> tuple[list[str], list[dict]]:
    """Return (lines, scenes). Each scene: sid, head_idx, text, start, end."""
    if not path.is_file():
        raise CliError(f"không tìm thấy script: {path}")
    lines = path.read_text(encoding="utf-8").splitlines()

    sections: dict[str, int] = {}
    for i, line in enumerate(lines):
        m = HEADING_RE.match(line)
        if m and len(m.group(1)) == 2:
            sections[m.group(2).strip().lower()] = i
    missing = [s for s in ("scenes", "narration") if s not in sections]
    if missing:
        raise CliError(
            f"{path}: thiếu mục " + ", ".join(f"'## {s.capitalize()}'" for s in missing)
        )

    start = sections["narration"] + 1
    end = len(lines)
    for i in range(start, len(lines)):
        m = HEADING_RE.match(lines[i])
        if m and len(m.group(1)) <= 2:
            end = i
            break

    scenes: list[dict] = []
    cur = None
    for i in range(start, end):
        m = SCENE_HEAD_RE.match(lines[i])
        if m:
            cur = {"sid": m.group(1), "head_idx": i, "body": [], "start": None, "end": None}
            t = TIMING_RE.search(m.group(2) or "")
            if t:
                cur["start"], cur["end"] = float(t.group(1)), float(t.group(2))
            scenes.append(cur)
        elif cur is not None:
            cur["body"].append(lines[i])

    if not scenes:
        raise CliError(
            f"{path}:{sections['narration'] + 1}: mục '## Narration' rỗng "
            "(cần các tiêu đề '### <sid>' kèm lời đọc)"
        )
    seen = set()
    for sc in scenes:
        text = COMMENT_RE.sub("", "\n".join(sc.pop("body")))
        text = " ".join(text.split())
        if not text:
            raise CliError(f"{path}:{sc['head_idx'] + 1}: cảnh '{sc['sid']}' không có lời đọc")
        if sc["sid"] in seen:
            raise CliError(f"{path}:{sc['head_idx'] + 1}: trùng mã cảnh '{sc['sid']}'")
        seen.add(sc["sid"])
        sc["text"] = text
    return lines, scenes


def write_timings(path: Path, lines: list[str], scenes: list[dict]) -> None:
    for sc in scenes:
        head = TIMING_RE.sub("", lines[sc["head_idx"]]).rstrip()
        lines[sc["head_idx"]] = f"{head} {{start={sc['start']:.3f} end={sc['end']:.3f}}}"
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text("\n".join(lines) + "\n", encoding="utf-8")
    os.replace(tmp, path)


# --------------------------------------------------------------------------- #
# audio helpers
# --------------------------------------------------------------------------- #
def load_audio(path: Path):
    """Decode any audio file to float32 mono 48 kHz via ffmpeg."""
    import numpy as np

    proc = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR),
         "-f", "f32le", "-"],
        capture_output=True,
    )
    if proc.returncode != 0:
        raise CliError(f"ffmpeg không đọc được {path}: {proc.stderr.decode(errors='ignore').strip()}")
    return np.frombuffer(proc.stdout, dtype=np.float32).copy()


def save_wav(path: Path, samples) -> None:
    import numpy as np

    pcm = (np.clip(samples, -1.0, 1.0) * 32767.0).astype("<i2")
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def rms_db(samples):
    import numpy as np

    win = int(SR * RMS_WIN_S)
    n = len(samples) // win
    if n == 0:
        return np.full(1, -120.0)
    frames = samples[: n * win].reshape(n, win)
    rms = np.sqrt(np.mean(frames.astype(np.float64) ** 2, axis=1))
    return 20.0 * np.log10(np.maximum(rms, 1e-6))


def voiced_mask(db):
    """Adaptive threshold: 30 dB under loud speech, but clear of the noise floor."""
    import numpy as np

    loud = np.percentile(db, 95)
    floor = np.percentile(db, 10)
    # min(...) keeps the threshold under speech when there is no quiet floor
    thr = max(loud - 30.0, min(floor + 6.0, loud - 3.0), -60.0)
    return db > thr


def trim_bounds(samples, margin_s: float = 0.03) -> tuple[int, int]:
    """Sample bounds [a, b) of the audio once edge silence is trimmed."""
    import numpy as np

    idx = np.flatnonzero(voiced_mask(rms_db(samples)))
    if idx.size == 0:
        return 0, len(samples)
    win = int(SR * RMS_WIN_S)
    margin = int(SR * margin_s)
    return max(0, idx[0] * win - margin), min(len(samples), (idx[-1] + 1) * win + margin)


def trim_silence(samples, margin_s: float = 0.03):
    a, b = trim_bounds(samples, margin_s)
    return samples[a:b]


def pad_to_frames(samples, extra_s: float):
    import numpy as np

    total = len(samples) + int(round(extra_s * SR))
    total = -(-total // FRAME_SAMPLES) * FRAME_SAMPLES  # ceil to whole frames
    out = np.zeros(total, dtype=np.float32)
    out[: len(samples)] = samples
    return out


# --------------------------------------------------------------------------- #
# Edge TTS with cross-process rate limit
# --------------------------------------------------------------------------- #
def wait_for_slot() -> None:
    """Hold an fcntl lock so parallel processes keep >= MIN_INTERVAL_S apart.

    time.monotonic() on Linux is CLOCK_MONOTONIC, which is shared by all
    processes on the machine since boot, so it is safe to compare across them.
    """
    import fcntl

    LOCK_PATH.touch(exist_ok=True)
    with open(LOCK_PATH, "r+") as fh:
        fcntl.flock(fh, fcntl.LOCK_EX)
        try:
            fh.seek(0)
            raw = fh.read().strip()
            last = float(raw) if raw else 0.0
            now = time.monotonic()
            if last > now:  # stale value from before a reboot
                last = 0.0
            wait = last + MIN_INTERVAL_S - now
            if wait > 0:
                time.sleep(wait)
            fh.seek(0)
            fh.truncate()
            fh.write(f"{time.monotonic():.6f}")
            fh.flush()
        finally:
            fcntl.flock(fh, fcntl.LOCK_UN)


def edge_tts_save(text: str, voice: str, rate: str, out_mp3: Path) -> None:
    try:
        import edge_tts
    except ImportError as e:
        raise CliError("thiếu gói edge-tts; chạy qua: uv run --with edge-tts --with numpy python ...") from e

    last_err: Exception | None = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        wait_for_slot()
        try:
            asyncio.run(edge_tts.Communicate(text, voice, rate=rate).save(str(out_mp3)))
            if out_mp3.is_file() and out_mp3.stat().st_size > 0:
                return
            raise RuntimeError("edge-tts trả về file rỗng")
        except Exception as e:  # NoAudioReceived, WSServerHandshakeError (429/5xx), network
            last_err = e
            if attempt < MAX_ATTEMPTS:
                delay = MIN_INTERVAL_S * attempt
                log(f"[synth] thử lại {attempt}/{MAX_ATTEMPTS - 1} sau {delay:.1f}s: "
                    f"{type(e).__name__}: {e}")
                time.sleep(delay)
    raise CliError(
        f"Edge TTS thất bại sau {MAX_ATTEMPTS} lần ({type(last_err).__name__}: {last_err}). "
        "Kiểm tra mạng/host speech.platform.bing.com; hoặc đặt file ghi âm sẵn vào "
        "tts_cache/<sid>.wav rồi chạy với --reuse-cache, hoặc dùng gemini-api-cli để tạo giọng."
    )


def cmd_synth(a: argparse.Namespace) -> dict:
    script = Path(a.script)
    lines, scenes = parse_script(script)
    out_dir = Path(a.out_dir)
    cache = out_dir / "tts_cache"
    cache.mkdir(parents=True, exist_ok=True)

    import numpy as np

    parts, t, report = [], 0.0, []
    for i, sc in enumerate(scenes):
        wav = cache / f"{sc['sid']}.wav"
        txt = cache / f"{sc['sid']}.txt"
        key = f"{a.voice}|{a.rate}|{sc['text']}"
        fresh = a.reuse_cache and wav.is_file() and txt.is_file() \
            and txt.read_text(encoding="utf-8") == key
        if a.reuse_cache and wav.is_file() and not txt.is_file():
            fresh = True  # user-supplied recording
        if not fresh:
            mp3 = cache / f"{sc['sid']}.mp3"
            edge_tts_save(sc["text"], a.voice, a.rate, mp3)
            audio = trim_silence(load_audio(mp3))
            save_wav(wav, audio)
            txt.write_text(key, encoding="utf-8")
            mp3.unlink(missing_ok=True)
        else:
            audio = trim_silence(load_audio(wav))
        last = i == len(scenes) - 1
        seg = pad_to_frames(audio, a.pad_end if last else a.pad_inter)
        sc["start"] = round(t, 3)
        t += len(seg) / SR
        sc["end"] = round(t, 3)
        parts.append(seg)
        report.append({"sid": sc["sid"], "start": sc["start"], "end": sc["end"],
                       "speech_s": round(len(audio) / SR, 3),
                       "frames": len(seg) // FRAME_SAMPLES})

    voice_src = out_dir / "voice_src.wav"
    save_wav(voice_src, np.concatenate(parts))
    write_timings(script, lines, scenes)
    result = {"voice_src": str(voice_src.resolve()), "duration_s": round(t, 3),
              "fps": FPS, "sample_rate": SR, "voice": a.voice, "rate": a.rate,
              "scenes": report}
    Path(a.output).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"synth ok: {len(scenes)} cảnh, {t:.2f}s → {voice_src}")
    return result


# --------------------------------------------------------------------------- #
# align
# --------------------------------------------------------------------------- #
def tokenize(text: str) -> list[dict]:
    """Whitespace tokens (≈ Vietnamese syllables), verbatim, with weights."""
    toks = []
    for raw in text.split():
        core = raw.strip("\"'“”‘’()[]«»")
        letters = sum(ch.isalnum() for ch in core)
        toks.append({"word": raw, "w": max(letters, 1) + 1.0,
                     "brk": bool(core) and core[-1] in BREAK_PUNCT or raw[-1] in BREAK_PUNCT})
    return toks


def regions_from_mask(mask, min_sil_frames: int):
    """Voiced regions [a,b) in RMS frames, merging pauses shorter than min_sil."""
    import numpy as np

    idx = np.flatnonzero(mask)
    if idx.size == 0:
        return []
    regs = [[idx[0], idx[0] + 1]]
    for k in idx[1:]:
        if k - regs[-1][1] < min_sil_frames:
            regs[-1][1] = k + 1
        else:
            regs.append([k, k + 1])
    return [(a, b) for a, b in regs]


def align_scene(samples, text: str, min_silence_s: float, sid: str):
    import numpy as np

    toks = tokenize(text)
    dur = len(samples) / SR
    db = rms_db(samples)
    regs = regions_from_mask(voiced_mask(db), max(1, int(round(min_silence_s / RMS_WIN_S))))
    regs = [(a * RMS_WIN_S, min(b * RMS_WIN_S, dur)) for a, b in regs]
    method = "pauses"
    if not regs:
        log(f"[align] {sid}: không phát hiện vùng có tiếng; chia đều trong [0.05, dur-0.05]")
        regs = [(min(0.05, dur / 4), max(dur - 0.05, dur * 3 / 4))]
        method = "fallback-even"
    elif len(regs) == 1:
        log(f"[align] {sid}: không thấy khoảng nghỉ ≥ {min_silence_s}s; "
            "phân bổ theo tỷ lệ trên toàn vùng có tiếng")
        method = "fallback-proportional"

    lens = np.array([b - a for a, b in regs])
    voiced_total = float(lens.sum())
    vcum = np.concatenate([[0.0], np.cumsum(lens)]) / voiced_total  # pause positions in voiced-fraction

    w = np.array([t["w"] for t in toks])
    wcum = np.concatenate([[0.0], np.cumsum(w)]) / w.sum()
    # candidate anchors: token boundaries after punctuation
    brk_fracs = [(wcum[i + 1], i + 1) for i, t in enumerate(toks[:-1]) if t["brk"]]

    # monotonic nearest matching of each internal pause to a punctuation boundary
    anchors_x, anchors_y = [0.0], [0.0]
    j = 0
    for p in vcum[1:-1]:
        best = None
        for k in range(j, len(brk_fracs)):
            d = abs(brk_fracs[k][0] - p)
            if best is None or d < best[0]:
                best = (d, k)
        if best and best[0] <= 0.15:
            anchors_x.append(brk_fracs[best[1]][0])
            anchors_y.append(p)
            j = best[1] + 1
    anchors_x.append(1.0)
    anchors_y.append(1.0)

    def to_time(frac: float, is_start: bool) -> float:
        """Map a text fraction to real time, skipping pauses. A position that
        falls exactly on a pause belongs to the next region when it is a word
        start, and to the previous region when it is a word end."""
        v = float(np.interp(frac, anchors_x, anchors_y)) * voiced_total
        for k, ((a, b), L) in enumerate(zip(regs, lens)):
            last = k == len(regs) - 1
            if (v < L - 1e-6) if (is_start and not last) else (v <= L + 1e-6):
                return a + v
            v -= L
        return regs[-1][1]

    words = []
    for i, t in enumerate(toks):
        s, e = to_time(wcum[i], True), to_time(wcum[i + 1], False)
        # do not let a word straddle a pause: clip at the end of its starting region
        for a, b in regs:
            if a - 1e-9 <= s < b:
                e = min(e, b)
                break
        words.append({"word": t["word"], "start": round(s, 3), "end": round(max(e, s + 0.02), 3)})
    return words, method, len(regs)


def cmd_align(a: argparse.Namespace) -> dict:
    script = Path(a.script)
    _, scenes = parse_script(script)
    cache = Path(a.cache_dir)
    all_words, per_scene, tr = [], [], ["# Transcript", ""]
    offset = 0.0
    for sc in scenes:
        wav = cache / f"{sc['sid']}.wav"
        if not wav.is_file():
            raise CliError(f"thiếu audio cảnh '{sc['sid']}': {wav}")
        samples = load_audio(wav)
        # synth trims edge silence before concatenating; mirror it so that
        # word times line up with voice_src.wav
        t0, t1 = trim_bounds(samples)
        samples = samples[t0:t1]
        base = sc["start"] if sc["start"] is not None else offset
        words, method, nreg = align_scene(samples, sc["text"], a.min_silence_s, sc["sid"])
        for wd in words:
            wd["start"] = round(wd["start"] + base, 3)
            wd["end"] = round(wd["end"] + base, 3)
            wd["scene"] = sc["sid"]
        all_words.extend(words)
        end = sc["end"] if sc["end"] is not None else base + len(samples) / SR
        offset = end
        # verbatim guarantee: joining the words must give back the script text
        if " ".join(w["word"] for w in words) != sc["text"]:
            raise CliError(f"lỗi nội bộ: văn bản cảnh '{sc['sid']}' bị thay đổi khi căn")
        per_scene.append({"sid": sc["sid"], "words": len(words), "voiced_regions": nreg,
                          "method": method})
        tr += [f"## {sc['sid']} [{base:.2f}–{end:.2f}]", "", sc["text"], ""]
        if sc["start"] is None:
            log(f"[align] {sc['sid']}: script.md chưa có mốc start/end; "
                "dùng thời lượng file nối tiếp (chạy synth trước để khớp voice_src.wav)")

    Path(a.out_words).write_text(json.dumps(all_words, ensure_ascii=False, indent=1), encoding="utf-8")
    Path(a.out_transcript).write_text("\n".join(tr), encoding="utf-8")
    result = {"words": len(all_words), "scenes": per_scene,
              "words_json": str(Path(a.out_words).resolve()),
              "transcript": str(Path(a.out_transcript).resolve()),
              "note": "Thời điểm từ là ước lượng theo năng lượng và khoảng nghỉ, không phải nhận dạng giọng nói; văn bản giữ nguyên 100%."}
    Path(a.output).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"align ok: {len(all_words)} từ / {len(scenes)} cảnh → {a.out_words}")
    return result


# --------------------------------------------------------------------------- #
def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="vi_narration.py", description=__doc__.split("\n")[0])
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("synth", help="Edge TTS → voice_src.wav + mốc thời gian trong script.md")
    s.add_argument("--script", required=True)
    s.add_argument("--out-dir", required=True)
    s.add_argument("--voice", required=True, help="vd. vi-VN-NamMinhNeural, vi-VN-HoaiMyNeural")
    s.add_argument("--rate", required=True, help="vd. +3%%, +0%%")
    s.add_argument("--pad-inter", type=float, required=True)
    s.add_argument("--pad-end", type=float, required=True)
    s.add_argument("--output", required=True)
    s.add_argument("--reuse-cache", action="store_true",
                   help="dùng lại tts_cache/<sid>.wav nếu còn khớp (hoặc file ghi âm sẵn)")
    s.set_defaults(func=cmd_synth)

    al = sub.add_parser("align", help="ước lượng mốc từ → words.json + transcript.md")
    al.add_argument("--script", required=True)
    al.add_argument("--cache-dir", required=True)
    al.add_argument("--min-silence-s", type=float, required=True)
    al.add_argument("--out-words", required=True)
    al.add_argument("--out-transcript", required=True)
    al.add_argument("--output", required=True)
    al.set_defaults(func=cmd_align)
    return p


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if getattr(args, "pad_inter", 0) < 0 or getattr(args, "pad_end", 0) < 0:
            raise CliError("--pad-inter/--pad-end phải ≥ 0")
        args.func(args)
        return 0
    except CliError as e:
        log(f"LỖI: {e}")
        return 1
    except KeyboardInterrupt:
        log("Đã dừng.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
