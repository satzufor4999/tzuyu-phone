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

# Taiwan-specific iOS presentation tweaks. These are system-only source patches:
# no user-authored messages, captions, or story dialogue is modified.
def patch(path, old, new):
    file = root / path
    text = file.read_text(encoding="utf-8")
    if old not in text:
        raise RuntimeError(f"Cannot safely localize {path}: upstream source anchor missing: {old[:90]}")
    file.write_text(text.replace(old, new), encoding="utf-8")

# Explicit zh-TW locale for weekday, month/day and calendar widget.
patch("DeviceSystem.tsx", 'Intl.DateTimeFormat("zh-CN"', 'Intl.DateTimeFormat("zh-TW"')
patch("launcher/HomeLauncher.tsx", 'Intl.DateTimeFormat("zh-CN"', 'Intl.DateTimeFormat("zh-TW"')

# Status bar and lock screen retain a 24-hour HH:mm clock even if the source
# story happens to use "9:41", "上午9:41" or "09:41 AM".
clock_file = root/"twLocale.ts"
clock_file.write_text("""// Taiwanese iPhone display formatting; do not modify the underlying story clock.
export function twClock(value: string): string {
  const src = String(value ?? "").trim();
  const match = src.match(/(?:上午|下午|AM|PM)?\\\\s*(\\\\d{1,2}):(\\\\d{2})\\\\s*(上午|下午|AM|PM)?/i);
  if (!match) return src;
  let hour = Number(match[1]);
  const mark = (match[3] || (src.match(/(?:上午|下午|AM|PM)/i) || [])[0] || "").toLowerCase();
  if ((mark === "下午" || mark === "pm") && hour < 12) hour += 12;
  if ((mark === "上午" || mark === "am") && hour === 12) hour = 0;
  if (hour > 23 || Number(match[2]) > 59) return src;
  return String(hour).padStart(2, "0") + ":" + match[2];
}
""", encoding="utf-8")
patch("Phone.tsx", 'import { StatusGlyph }', 'import { twClock } from "./twLocale";\\nimport { StatusGlyph }')
patch("Phone.tsx", 'const displayTime = creator ? work.phone.time : s.time || work.phone.time;',
      'const displayTime = twClock(creator ? work.phone.time : s.time || work.phone.time);')
patch("DeviceSystem.tsx", 'import { SystemNotifications }', 'import { twClock } from "./twLocale";\\nimport { SystemNotifications }')
patch("DeviceSystem.tsx", '<h1>{time}</h1>', '<h1>{twClock(time)}</h1>')
patch("launcher/HomeLauncher.tsx", '<b>{time}</b>', '<b>{time.match(/\\\\d{1,2}:\\\\d{2}/)?.[0]?.padStart(5, "0") || time}</b>')

# Notifications follow Taiwanese conventions ("現在", "則通知").
patch("SystemNotifications.tsx", '<time>現在</time>', '<time>現在</time>')
patch("SystemNotifications.tsx", ' + " 條通知"', ' + " 則通知"')
patch("SystemNotifications.tsx", ' : "訊息";', ' : "訊息";')

# The on-screen keyboard is a decorative player keyboard, not the native iOS IME.
# Use Taiwanese labels and locale-correct candidate text, and keep QWERTY usable.
patch("DeviceSystem.tsx", 'aria-label="螢幕鍵盤"', 'aria-label="繁體中文（台灣）鍵盤"')
patch("DeviceSystem.tsx", 'placeholder="輸入訊息"', 'placeholder="輸入訊息"')
patch("DeviceSystem.tsx", '          空格\\n', '          空白\\n')
patch("DeviceSystem.tsx", '        <small>草稿</small>', '        <small>繁體中文（台灣）</small>')
patch("DeviceSystem.tsx", '        ? ["1234567890", "-/:;()¥&@", ".,?!\\'"]', '        ? ["1234567890", "-/:;()print(f"Localized@", ".,?!\\'"]')

# Default story phone continues to use fictional story date/time. Don't set it
# to device wall-clock; the story engine advances it according to events.

print(f"Localized {changed} UI source files to zh-Hant-TW (authored story conversations unchanged)")
