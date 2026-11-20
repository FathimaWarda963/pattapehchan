"""Creates the audio clips for PattaPehchan from the text in src/locales.

Run from the project folder:
    python tools/make-audio.py          (all four languages)
    python tools/make-audio.py ur       (only Urdu)

Running it again only creates clips that are missing, so it is safe to stop
(Ctrl+C) and continue later.
"""
import asyncio
import json
import re
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
LOCALES = ROOT / "src" / "locales"
OUT = ROOT / "public" / "audio"

VOICES = {
    "en": "en-US-AriaNeural",
    "ur": "ur-PK-UzmaNeural",
    "si": "si-LK-ThiliniNeural",
    "ta": "ta-LK-SaranyaNeural",
}

# Which text files to turn into audio
FILES = ["common", "welcome", "spoken", "check", "trackSettings", "calc", "audio", "records"]

END = "[.!?۔।]"


def normalize(text):
    text = re.sub(r"\s+", " ", text).strip()
    return re.sub(END + "+$", "", text).strip()


def key(lang, text):
    """Same recipe as clipKey() in src/audio.js, so the site finds the right file."""
    h = 0x811C9DC5
    for b in f"{lang}|{normalize(text)}".encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def strings(node):
    if isinstance(node, str):
        yield node
    elif isinstance(node, list):
        for item in node:
            yield from strings(item)
    elif isinstance(node, dict):
        for item in node.values():
            yield from strings(item)


def chunks(text):
    """Splits text into sentences the same way the site does."""
    for part in re.split(r"(?<=" + END + r")\s+", text):
        part = part.strip()
        if part and re.search(r"\w", part) and "{{" not in part:
            yield part


def load(lang):
    merged = {}
    for name in FILES:
        path = LOCALES / lang / f"{name}.json"
        if path.exists():
            merged.update(json.loads(path.read_text(encoding="utf-8")))
    return merged


def gate_texts():
    """Reads the language-screen phrases from src/languages.js."""
    src = (ROOT / "src" / "languages.js").read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r"code: '(\w+)'(.*?)\n  \}", src, re.S):
        fields = dict(re.findall(r"(\w+): '([^']*)'", m.group(2)))
        out[m.group(1)] = [fields.get(k, "") for k in ("name", "hold", "chosen")]
    return out


GATE = gate_texts()


def plan(lang):
    merged = load(lang)
    found = {}

    def add(text):
        for chunk in chunks(text):
            found.setdefault(key(lang, chunk), chunk)

    for text in strings(merged):
        add(text)

    # "{{name}} selected" is spoken for each country
    selected = merged.get("spoken", {}).get("selected", "")
    for code in ("pk", "lk"):
        name = merged.get("country", {}).get(code, "")
        if name and selected:
            add(selected.replace("{{name}}", name))

    for text in GATE.get(lang, []):
        add(text)
    return found


async def render(sem, voice, text, path):
    async with sem:
        for attempt in range(1, 4):
            try:
                await edge_tts.Communicate(text, voice).save(str(path))
                return True
            except Exception:  # network hiccup: wait and try again
                await asyncio.sleep(2 * attempt)
        return False


async def main(langs):
    sem = asyncio.Semaphore(3)
    for lang in langs:
        folder = OUT / lang
        folder.mkdir(parents=True, exist_ok=True)
        found = plan(lang)
        todo = {k: t for k, t in found.items() if not (folder / f"{k}.mp3").exists()}
        print(f"{lang}: {len(found)} sentences, {len(todo)} to create", flush=True)
        done = 0
        failed = 0

        async def one(k, t):
            nonlocal done, failed
            tmp = folder / f"{k}.part"
            if await render(sem, VOICES[lang], t, tmp):
                tmp.replace(folder / f"{k}.mp3")
            else:
                failed += 1
                tmp.unlink(missing_ok=True)
            done += 1
            if done % 25 == 0:
                print(f"  {done}/{len(todo)}", flush=True)

        await asyncio.gather(*(one(k, t) for k, t in todo.items()))
        print(f"{lang}: finished, {failed} failed (run again to retry)", flush=True)


if __name__ == "__main__":
    wanted = sys.argv[1:] or list(VOICES)
    unknown = [l for l in wanted if l not in VOICES]
    if unknown:
        sys.exit("Unknown language: " + ", ".join(unknown) + ". Use: en ur si ta")
    asyncio.run(main(wanted))
    