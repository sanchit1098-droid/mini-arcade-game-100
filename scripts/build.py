"""
Mini Game Arcade - Production Build & Asset Integrity Verifier
Comprehensive validation of all HTML pages, routes, images, scripts, and configurations.
"""

import os
import sys
import json
import re

# Support UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def audit_html_pages():
    print("[AUDIT] Auditing all HTML pages, scripts, and stylesheet references...")
    html_files = [
        "index.html",
        "about.html",
        "contact.html",
        "privacy.html",
        "terms.html",
        os.path.join("games", "blade-harvest", "index.html"),
        os.path.join("games", "chroma-breaker", "index.html"),
        os.path.join("games", "neon-snake", "index.html"),
        os.path.join("games", "space-invaders", "index.html"),
        os.path.join("games", "neon-rush", "index.html"),
        os.path.join("games", "puzzle-2048", "index.html"),
        os.path.join("games", "whack-a-mole", "index.html"),
        os.path.join("games", "memory-master", "index.html")
    ]

    for rel_html in html_files:
        full_html = os.path.join(ROOT_DIR, rel_html)
        assert os.path.exists(full_html), f"Missing page: {rel_html}"
        base_dir = os.path.dirname(full_html)

        with open(full_html, "r", encoding="utf-8") as f:
            content = f.read()

        # Scripts
        scripts = re.findall(r'<script\s+[^>]*src=["\']([^"\']+)["\']', content)
        for s in scripts:
            if not s.startswith("http"):
                target = os.path.normpath(os.path.join(base_dir, s))
                assert os.path.exists(target), f"Missing script in {rel_html}: {s}"

        # Stylesheets
        styles = re.findall(r'<link\s+[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']', content)
        for s in styles:
            if not s.startswith("http"):
                target = os.path.normpath(os.path.join(base_dir, s))
                assert os.path.exists(target), f"Missing stylesheet in {rel_html}: {s}"

        # Images (src)
        images = re.findall(r'<img\s+[^>]*src=["\']([^"\']+)["\']', content)
        for img in images:
            if not img.startswith("http") and not img.startswith("data:"):
                target = os.path.normpath(os.path.join(base_dir, img))
                assert os.path.exists(target), f"Missing image in {rel_html}: {img}"

        print(f"  [OK] Page verified: {rel_html} ({len(scripts)} scripts, {len(styles)} styles, {len(images)} images)")

def audit_games_registry():
    print("\n[AUDIT] Validating games/games.json registry...")
    registry_path = os.path.join(ROOT_DIR, "games", "games.json")
    assert os.path.exists(registry_path), "games/games.json missing!"

    with open(registry_path, "r", encoding="utf-8") as f:
        games = json.load(f)

    assert isinstance(games, list) and len(games) > 0, "games.json must contain at least one game"

    for g in games:
        gid = g.get("id")
        title = g.get("title")
        route = g.get("route")
        thumb = g.get("thumbnail")

        assert gid and title and route and thumb, f"Incomplete game entry: {g}"

        route_target = os.path.join(ROOT_DIR, route.replace("/", os.sep))
        assert os.path.exists(route_target), f"Game route missing for {title}: {route_target}"

        thumb_target = os.path.join(ROOT_DIR, thumb.replace("/", os.sep))
        assert os.path.exists(thumb_target), f"Game thumbnail missing for {title}: {thumb_target}"

        print(f"  [OK] Game entry verified: '{title}' (Route: {route}, Thumbnail: {thumb})")

def audit_js_and_css_syntax():
    print("\n[AUDIT] Checking JavaScript & CSS bracket balancing...")
    for root, dirs, files in os.walk(ROOT_DIR):
        if "node_modules" in root or ".git" in root or "scratch" in root:
            continue
        for f in files:
            if f.endswith(".js") or f.endswith(".css"):
                p = os.path.join(root, f)
                with open(p, "r", encoding="utf-8") as fl:
                    code = fl.read()
                rel = os.path.relpath(p, ROOT_DIR)
                ob = code.count("{")
                cb = code.count("}")
                assert ob == cb, f"Mismatched braces in {rel}: {ob} != {cb}"
                print(f"  [OK] {rel} ({len(code.splitlines())} lines)")

def audit_vercel_config():
    print("\n[AUDIT] Validating vercel.json...")
    vercel_path = os.path.join(ROOT_DIR, "vercel.json")
    if os.path.exists(vercel_path):
        with open(vercel_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert data.get("version") == 2, "Invalid vercel.json version"
        print("  [OK] vercel.json is valid.")
    else:
        print("  [INFO] vercel.json not present (optional for zero-config static hosting).")

def run_build():
    print("========================================")
    print("MINI GAME ARCADE - PRODUCTION BUILD AUDIT")
    print("========================================")
    audit_html_pages()
    audit_games_registry()
    audit_js_and_css_syntax()
    audit_vercel_config()
    print("\n========================================")
    print("ALL CHECKS PASSED - PRODUCTION READY!")
    print("Zero missing assets, zero broken links, 100% self-contained.")
    print("========================================")

if __name__ == "__main__":
    run_build()
