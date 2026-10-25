#!/usr/bin/env python3
"""Serve the saved snugwrld.netlify.app copy locally.

The saved copy stores Next.js optimized images under hashed filenames, so
/_next/image?url=... requests are mapped back to those files here.
Also provides local mock handlers for /api/products.php and /api/orders.php
so the dynamic store features work locally without requiring PHP/MySQL.
Usage: python3 serve.py [port]   (default 8080)
"""
import os
import sys
import json
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

MOCK_PRODUCTS = [
    {
        "id": 1,
        "slug": "crimson-memory",
        "title": "Crimson Memory LS Shirt",
        "title_fa": "پیراهن آستین بلند کریمسون",
        "price": 1250000,
        "formatted_price": "۱,۲۵۰,۰۰۰ تومان",
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 8,
        "color": "White",
        "buy_url": "",
        "description": "پیراهن آستین بلند نخی با کیفیت عالی و دوخت سفارشی"
    },
    {
        "id": 2,
        "slug": "its-us-tee",
        "title": "It's Us Never Them Tee",
        "title_fa": "تی‌شرت مشکی/صورتی/زرد It's Us",
        "price": 890000,
        "formatted_price": "۸۹۰,۰۰۰ تومان",
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 15,
        "color": "Black / Pink / Yellow",
        "buy_url": "",
        "description": "تی‌شرت اورسایز صددرصد پنبه با چاپ سیلک برجسته"
    },
    {
        "id": 3,
        "slug": "tank",
        "title": "Distressed Painted Logo Tank Top",
        "title_fa": "تاپ بدون آستین وینتیج",
        "price": 750000,
        "formatted_price": "۷۵۰,۰۰۰ تومان",
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 10,
        "color": "Black / Sand",
        "buy_url": "",
        "description": "تاپ راحتی شسته شده به سبک وینتیج با لوگوی آرت ورک"
    },
    {
        "id": 4,
        "slug": "varsity",
        "title": "Snug Wrld Logo Varsity Jacket",
        "title_fa": "ژاکت ورسیتی مشکی لوگودار",
        "price": 2450000,
        "formatted_price": "۲,۴۵۰,۰۰۰ تومان",
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 4,
        "color": "Black",
        "buy_url": "",
        "description": "کاپشن بیسبالی ورسیتی کژوال با آستر گرم و دوخت باکیفیت"
    },
    {
        "id": 5,
        "slug": "distressed-logo-t",
        "title": "Distressed Logo Print T-Shirt",
        "title_fa": "تی‌شرت چاپی دیسترسد آبی",
        "price": 920000,
        "formatted_price": "۹۲۰,۰۰۰ تومان",
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 12,
        "color": "Blue",
        "buy_url": "",
        "description": "تی‌شرت آستین کوتاه طرح کلاسیک با پارچه نرم و تنفس‌پذیر"
    },
    {
        "id": 6,
        "slug": "jersey",
        "title": "Snug Football Jersey",
        "title_fa": "لباس ورزشی زرد/آبی فوتبالی",
        "price": 1100000,
        "formatted_price": "۱,۱۰۰,۰۰۰ تومان",
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 7,
        "color": "Yellow / Blue",
        "buy_url": "",
        "description": "پیراهن ورزشی استریت‌استایل با تن‌خور آزاد و جنس تنفس‌پذیر"
    },
    {
        "id": 7,
        "slug": "silicone-tee",
        "title": "Silicone Logo Print T-Shirt",
        "title_fa": "تی‌شرت سیلیکونی سفید",
        "price": 880000,
        "formatted_price": "۸۸۰,۰۰۰ تومان",
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 9,
        "color": "White",
        "buy_url": "",
        "description": "تی‌شرت یقه گرد مینیمال با پچ سیلیکونی برجسته"
    }
]


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

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/index.php":
            self.path = "/index.html"
            super().do_GET()
            return

        # 1. Image Handler
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

        # 2. Local Mock Products API
        if parsed.path in ("/api/products.php", "/api/products"):
            payload = json.dumps({
                "success": True,
                "source": "python_local_preview",
                "settings": {
                    "store_title": "فروشگاه رگال لباس | Fancy Clothes",
                    "marquee_text": "IT'S US, NEVER THEM  •  NEW DROPS  •  کالکشن جدید لباس  •  ارسال به سراسر کشور",
                    "contact_phone": "09120000000",
                    "instagram": "@store_iran",
                    "telegram": "@store_iran"
                },
                "products": MOCK_PRODUCTS
            }, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        self.path = parsed.path  # drop query strings like ?favicon...
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path in ("/api/orders.php", "/api/orders"):
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                order_info = json.loads(body.decode("utf-8"))
            except Exception:
                order_info = {}
            print(f"[Local Order Preview] Received: {order_info}")
            payload = json.dumps({
                "success": True,
                "order_id": 101,
                "message": "سفارش شما با موفقیت ثبت شد! کارشناسان ما به زودی با شما تماس خواهند گرفت."
            }, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        self.send_error(404)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    host = os.environ.get("HOST", "0.0.0.0")
    server = ThreadingHTTPServer((host, port), Handler)
    url = f"http://{host if host != '0.0.0.0' else 'localhost'}:{port}"
    print(f"Site is running at {url}  (press Ctrl+C to stop)")
    if os.environ.get("NO_BROWSER") != "1" and os.environ.get("DISPLAY"):
        try:
            webbrowser.open(url)
        except Exception:
            pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
