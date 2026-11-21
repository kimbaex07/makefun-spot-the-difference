#!/usr/bin/env python3
"""Take the 3 screenshots of The Lighthouse Cat Café in headless Chromium.

Serves game/ on localhost, opens each ?shot= scene at 1280x720, waits for
the canvas to paint, and saves a JPEG screenshot. These are real renders of
the game's own code in a browser, never edited or composited.
"""
import json
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

HERE = "/home/hatch/workspace/make-fun/kim-bae/spot-diff"
PORT = 8091


def wait_for_server(url, timeout=20):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=2)
            return True
        except Exception:
            time.sleep(0.3)
    return False


def main():
    shots = json.load(open(f"{HERE}/shots.json"))
    server = subprocess.Popen(
        ["node", "serve.ts", "--port", str(PORT)],
        cwd=HERE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        if not wait_for_server(f"http://127.0.0.1:{PORT}/"):
            print("server did not start", file=sys.stderr)
            return 1
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": 1280, "height": 720})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            for shot in shots:
                url = f"http://127.0.0.1:{PORT}/{shot['query']}"
                page.goto(url)
                page.wait_for_timeout(1200)
                path = f"{HERE}/screenshots/{shot['name']}"
                page.screenshot(path=path, type="jpeg", quality=82)
                print(f"saved {path}")
            browser.close()
            if errors:
                print("PAGE ERRORS:", file=sys.stderr)
                for e in errors:
                    print(" -", e, file=sys.stderr)
                return 2
        return 0
    finally:
        server.terminate()


if __name__ == "__main__":
    sys.exit(main())
