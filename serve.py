#!/usr/bin/env python3
"""Serve the saved snugwrld.netlify.app copy locally.

The saved copy stores Next.js optimized images under hashed filenames, so
/_next/image?url=... requests are mapped back to those files here.
Usage: python3 serve.py [port]   (default 8080)
"""
import os
import sys
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")

# (large front, small front, side) — None falls back to the next available image
PRODUCTS = {
    "crimson-memory":    ("image-c6343cb74a71e8", "image-6c2a15e13730c8", "image-4e8640f03d7b6"),
    "distressed-logo-t": ("image-bb6fb99c4b2508", "image-c1471486a0b8a8", "image-05f55d455bb558"),
    "its-us-tee-black":  ("image-b4ec065a4e66f8", "image-39f2c686e071e8", "image-b542c1d352ef8"),
    "jersey-yellow":     ("image-6ae6766896f1d8", "image-a088f00edf1b58", "image-959fe759fcd068"),
    "silicone-tee":      ("image-ffce5fea8389f8", "image-9f64af5d69fbe", "image-97e6e1449d26b"),
    "tank-black":        ("image-0af2db7b4647a8", "image-9f9a2a06d674d8", "image-9efcd9db49e648"),
    "varsity":           ("image-84bdfd6756b51", "image-36c27604289f1", "image-d2f85dbbd1b6c8"),
    "jersey-blue":       ("image-2406692edfcaf", None, None),
    "tank-sand":         ("image-246e6ad4aa26a8", None, None),
    "its-us-tee-yellow": ("image-277d32b1ca5e88", None, None),
    "its-us-tee-bubblegum": ("image-ad7c33cd14d518", None, None),
}


def resolve_image(url, width):
    if url == "/snug-wrld-logo.png":
        return "image"
    name = os.path.basename(url).rsplit(".", 1)[0]
    for slug, (large, small, side) in PRODUCTS.items():
        if name.startswith(slug + "-"):
            view = name[len(slug) + 1:]
            front = small if (small and width <= 512) else large
            if view == "side":
                return side or front
            return front  # "front", and "back" which wasn't saved
    return None


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/_next/image":
            qs = parse_qs(parsed.query)
            width = int(qs.get("w", ["0"])[0] or 0)
            fname = resolve_image(qs.get("url", [""])[0], width)
            path = fname and os.path.join(ROOT, "_next", fname + ".html")
            if not path or not os.path.exists(path):
                return self.send_error(404)
            with open(path, "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "image/webp")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "public, max-age=3600")
            self.end_headers()
            self.wfile.write(data)
            return
        self.path = parsed.path  # drop query strings like ?favicon...
        super().do_GET()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://localhost:{port}"
    print(f"Site is running at {url}  (press Ctrl+C to stop)")
    if os.environ.get("NO_BROWSER") != "1":
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
