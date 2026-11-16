#!/usr/bin/env python3
"""assets/assets.html の中身を assets/assets_sample.html の吹き出し内に反映する。

使い方: python3 scripts/sync_sample.py
assets_sample.html の <!-- WIDGET:BEGIN --> と <!-- WIDGET:END --> の間を書き換える。
"""
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parent.parent / "assets"
widget = (root / "assets.html").read_text(encoding="utf-8").strip()
sample_path = root / "assets_sample.html"
sample = sample_path.read_text(encoding="utf-8")

pattern = re.compile(r"(<!-- WIDGET:BEGIN -->).*?(<!-- WIDGET:END -->)", re.S)
if not pattern.search(sample):
    sys.exit("assets_sample.html に WIDGET:BEGIN / WIDGET:END のマーカーがありません")

sample_path.write_text(
    pattern.sub(lambda m: m.group(1) + "\n" + widget + "\n" + m.group(2), sample, count=1),
    encoding="utf-8",
)
print("synced:", sample_path)
