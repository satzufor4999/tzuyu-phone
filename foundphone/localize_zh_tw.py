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
print(f"Localized {changed} UI source files to zh-Hant-TW (authored story conversations unchanged)")
