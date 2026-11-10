#!/usr/bin/env python3
"""Localize FoundPhone's SYSTEM UI to zh-Hant-TW without changing authored chats.
Runs on the pinned upstream checkout, AFTER prepare.mjs and BEFORE validation/build.
"""
from pathlib import Path
import json
import re
from opencc import OpenCC

cc = OpenCC("s2twp")
root = Path("src")
ui_files = list(root.rglob("*.ts")) + list(root.rglob("*.tsx")) + list(root.rglob("*.css"))
# Keep machine identifiers, ASCII paths, JS and TS syntax intact. Convert Chinese only.
def localized(text):
    return re.sub(r"[\u3400-\u9fff]+", lambda m: cc.convert(m.group(0)), text)

changed = 0
for path in ui_files:
    text = path.read_text(encoding="utf-8")
    transformed = localized(text)
    if path.name == "registry.ts":
        # Match terminology used by Taiwanese iOS rather than literal translation.
        for old, new in [
            ('"資訊"', '"訊息"'),
            ('"資訊",', '"訊息",'),
            ('"相簿"', '"照片"'),
            ('"瀏覽器"', '"Safari"'),
            ('"日曆"', '"行事曆"'),
            ('"通訊錄"', '"聯絡人"'),
        ]:
            transformed = transformed.replace(old, new)
    if transformed != text:
        path.write_text(transformed, encoding="utf-8")
        changed += 1

# Only localize system-supplied app names in the story templates.
# Do not translate scripted messages, user-authored notes, chat text, captions, or social posts.
for filename in ["stories/template/story.json", "stories/test-preview/story.json"]:
    path = Path(filename)
    story = json.loads(path.read_text(encoding="utf-8"))
    for item in story.get("installedApps", []):
        if isinstance(item, dict) and isinstance(item.get("name"), str):
            item["name"] = localized(item["name"])
    if filename.endswith("/template/story.json"):
        story["description"] = "虛構粉絲互動手機"
    path.write_text(json.dumps(story, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# The page itself advertises Traditional Chinese for browser accessibility.
for file in [Path("index.html")]:
    if file.exists():
        contents = file.read_text(encoding="utf-8")
        contents = re.sub(r'<html lang="[^"]*"', '<html lang="zh-Hant-TW"', contents, count=1)
        file.write_text(contents, encoding="utf-8")

# Assert the iOS app names and visible system UI are no longer Simplified Chinese.
registry = (root/"registry.ts").read_text(encoding="utf-8")
assert '"訊息"' in registry and '"相機"' in registry and '"設定"' in registry, "Taiwanese app names missing"
assert '"信息"' not in registry, "Simplified Chinese remained in registry"

# Taiwanese date/time, notification and mock-keyboard labels.
# The story clock is already HH:mm. Keep fictional event time unchanged.
def patch(path, old, new):
    file = root / path
    data = file.read_text(encoding="utf-8")
    if old not in data:
        raise RuntimeError(f"Missing expected UI source in {path}: {old}")
    file.write_text(data.replace(old, new, 1), encoding="utf-8")

patch("DeviceSystem.tsx", 'DateTimeFormat("zh-CN"', 'DateTimeFormat("zh-TW"')
patch("launcher/HomeLauncher.tsx", 'DateTimeFormat("zh-CN"', 'DateTimeFormat("zh-TW"')

# Add a stable HH:mm-only formatting helper for status bar, lock screen, widgets.
clock = root / "twLocale.ts"
clock.write_text(
    "// Format the fictional device clock using Taiwanese 24-hour conventions.\n"
    "export function twClock(value: string): string {\n"
    "  const m = String(value).match(/(上午|下午|AM|PM)?\\s*(\\d{1,2}):(\\d{2})\\s*(上午|下午|AM|PM)?/i);\n"
    "  if (!m) return value;\n"
    "  let h = Number(m[2]);\n"
    "  const marker = (m[4] || m[1] || '').toLowerCase();\n"
    "  if ((marker === '下午' || marker === 'pm') && h < 12) h += 12;\n"
    "  if ((marker === '上午' || marker === 'am') && h === 12) h = 0;\n"
    "  return h <= 23 ? String(h).padStart(2, '0') + ':' + m[3] : value;\n"
    "}\n",
    encoding="utf-8"
)
patch("Phone.tsx", 'import { StatusGlyph }', 'import { twClock } from "./twLocale";\nimport { StatusGlyph }')
patch("Phone.tsx", 'const displayTime = creator ? work.phone.time : s.time || work.phone.time;',
      'const displayTime = twClock(creator ? work.phone.time : s.time || work.phone.time);')
patch("DeviceSystem.tsx", 'import { SystemNotifications }', 'import { twClock } from "./twLocale";\nimport { SystemNotifications }')
patch("DeviceSystem.tsx", '<h1>{time}</h1>', '<h1>{twClock(time)}</h1>')
patch("launcher/HomeLauncher.tsx", 'import {', 'import { twClock } from "../twLocale";\nimport {',)
patch("launcher/HomeLauncher.tsx", '<b>{time}</b>', '<b>{twClock(time)}</b>')

patch("SystemNotifications.tsx", '<time>現在</time>', '<time>現在</time>')
patch("SystemNotifications.tsx", ' + " 條通知"', ' + " 則通知"')
patch("DeviceSystem.tsx", 'aria-label="螢幕鍵盤"', 'aria-label="繁體中文（台灣）鍵盤"')
patch("DeviceSystem.tsx", '          空格\n', '          空白\n')
patch("DeviceSystem.tsx", '        <small>草稿</small>', '        <small>繁體中文（台灣）</small>')
print("Taiwan locale: weekdays, 24-hour clock, alerts and keyboard labels patched")
