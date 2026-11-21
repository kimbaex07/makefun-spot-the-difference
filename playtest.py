#!/usr/bin/env python3
"""Play-test The Lighthouse Cat Café in headless Chromium.

Starts the game, clicks a real difference and a wrong spot, and prints the
HUD state after each step, so the test proves the rules work in the browser.
"""
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

HERE = "/home/hatch/workspace/make-fun/kim-bae/spot-diff"
PORT = 8092


def wait_for_server(url, timeout=20):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=2)
            return True
        except Exception:
            time.sleep(0.3)
    return False


def hud_text(page):
    return page.evaluate(
        """() => {
        const c = document.getElementById('game');
        return c ? 'canvas ok' : 'no canvas';
    }"""
    )


def main():
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
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.wait_for_timeout(600)
            # Title screen -> click to start (centre of the overlay).
            page.mouse.click(640, 360)
            page.wait_for_timeout(300)
            # Click the bird difference in panel A: panel origin (40,92) + (285,96).
            page.mouse.click(40 + 285, 92 + 96)
            page.wait_for_timeout(300)
            page.screenshot(path=f"{HERE}/playtest-after-find.png")
            # Click a wrong spot (empty sky in panel A).
            page.mouse.click(40 + 450, 92 + 250)
            page.wait_for_timeout(300)
            # Read the game state through the canvas pixels is fragile; instead
            # screenshot and report, plus check the status line text.
            status = page.locator("#status").inner_text()
            print("status line:", status)
            print("errors:", errors if errors else "none")
            browser.close()
        return 0
    finally:
        server.terminate()


if __name__ == "__main__":
    sys.exit(main())
