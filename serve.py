#!/usr/bin/env python3
"""Serve the saved snugwrld.netlify.app copy locally.

The saved copy stores Next.js optimized images under hashed filenames, so
/_next/image?url=... requests are mapped back to those files here.
Also provides local preview handlers for /api/products.php, /api/orders.php,
and the Persian Admin Panel (/admin/) with full Add/Edit/Delete product support,
triple-view image uploads (Side on rack, Front on hover, Back in focus),
hanging size tags (S, M, L, XL, XXL, XXXL), and dynamic colourways.
Usage: python3 serve.py [port]   (default 8080)
"""
import os
import sys
import json
import time
import email
from email import policy
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")
DATA_FILE = os.path.join(ROOT, "products_data.json")
ORDERS_FILE = os.path.join(ROOT, "orders_data.json")
SETTINGS_FILE = os.path.join(ROOT, "settings_data.json")
UPLOADS_DIR = os.path.join(ROOT, "uploads")

os.makedirs(UPLOADS_DIR, exist_ok=True)

DEFAULT_PRODUCTS = [
    {
        "id": 1,
        "slug": "crimson-memory",
        "title": "Crimson Memory LS Shirt",
        "title_fa": "پیراهن آستین بلند کریمسون",
        "price": 1250000,
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 8,
        "color": "White",
        "sizes": "S,M,L,XL,XXL",
        "colourways": [],
        "front_image": "",
        "side_image": "",
        "back_image": "",
        "buy_url": "",
        "description": "پیراهن آستین بلند نخی با کیفیت عالی و دوخت سفارشی"
    },
    {
        "id": 2,
        "slug": "its-us-tee",
        "title": "It's Us Never Them Tee",
        "title_fa": "تی‌شرت مشکی/صورتی/زرد It's Us",
        "price": 890000,
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 15,
        "color": "Black / Pink / Yellow",
        "sizes": "S,M,L,XL,XXL,XXXL",
        "colourways": [
            {"label": "Black", "hex": "#1e1e1e", "front": "/products/its-us-tee-black-front.webp", "side": "/products/its-us-tee-black-side.webp"},
            {"label": "Pink", "hex": "#f6b1b4", "front": "/products/its-us-tee-bubblegum-front.webp", "side": "/products/its-us-tee-bubblegum-side.webp"},
            {"label": "Yellow", "hex": "#f8dd2f", "front": "/products/its-us-tee-yellow-front.webp", "side": "/products/its-us-tee-yellow-side.webp"}
        ],
        "front_image": "",
        "side_image": "",
        "back_image": "",
        "buy_url": "",
        "description": "تی‌شرت اورسایز صددرصد پنبه با چاپ سیلک برجسته"
    },
    {
        "id": 3,
        "slug": "tank",
        "title": "Distressed Painted Logo Tank Top",
        "title_fa": "تاپ بدون آستین وینتیج",
        "price": 750000,
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 10,
        "color": "Black / Sand",
        "sizes": "S,M,L,XL",
        "colourways": [
            {"label": "Black", "hex": "#2d2d2c", "front": "/products/tank-black-front.webp", "side": "/products/tank-black-side.webp"},
            {"label": "Sand", "hex": "#b29e8b", "front": "/products/tank-sand-front.webp", "side": "/products/tank-sand-side.webp"}
        ],
        "front_image": "",
        "side_image": "",
        "back_image": "",
        "buy_url": "",
        "description": "تاپ راحتی شسته شده به سبک وینتیج با لوگوی آرت ورک"
    },
    {
        "id": 4,
        "slug": "varsity",
        "title": "Snug Wrld Logo Varsity Jacket",
        "title_fa": "ژاکت ورسیتی مشکی لوگودار",
        "price": 2450000,
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 4,
        "color": "Black",
        "sizes": "M,L,XL,XXL",
        "colourways": [],
        "front_image": "",
        "side_image": "",
        "back_image": "",
        "buy_url": "",
        "description": "کاپشن بیسبالی ورسیتی کژوال با آستر گرم و دوخت باکیفیت"
    },
    {
        "id": 5,
        "slug": "distressed-logo-t",
        "title": "Distressed Logo Print T-Shirt",
        "title_fa": "تی‌شرت چاپی دیسترسد آبی",
        "price": 920000,
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 12,
        "color": "Blue",
        "sizes": "S,M,L,XL,XXL",
        "colourways": [],
        "front_image": "",
        "side_image": "",
        "back_image": "",
        "buy_url": "",
        "description": "تی‌شرت آستین کوتاه طرح کلاسیک با پارچه نرم و تنفس‌پذیر"
    },
    {
        "id": 6,
        "slug": "jersey",
        "title": "Snug Football Jersey",
        "title_fa": "لباس ورزشی زرد/آبی فوتبالی",
        "price": 1100000,
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 7,
        "color": "Yellow / Blue",
        "sizes": "S,M,L,XL,XXL,XXXL",
        "colourways": [
            {"label": "Yellow", "hex": "#e3ca1e", "front": "/products/jersey-yellow-front.webp", "side": "/products/jersey-yellow-side.webp"},
            {"label": "Blue", "hex": "#0842a9", "front": "/products/jersey-blue-front.webp", "side": "/products/jersey-blue-side.webp"}
        ],
        "front_image": "",
        "side_image": "",
        "back_image": "",
        "buy_url": "",
        "description": "پیراهن ورزشی استریت‌استایل با تن‌خور آزاد و جنس تنفس‌پذیر"
    },
    {
        "id": 7,
        "slug": "silicone-tee",
        "title": "Silicone Logo Print T-Shirt",
        "title_fa": "تی‌شرت سیلیکونی سفید",
        "price": 880000,
        "currency": "تومان",
        "is_available": 1,
        "stock_quantity": 9,
        "color": "White",
        "sizes": "S,M,L,XL,XXL",
        "colourways": [],
        "front_image": "",
        "side_image": "",
        "back_image": "",
        "buy_url": "",
        "description": "تی‌شرت یقه گرد مینیمال با پچ سیلیکونی برجسته"
    }
]

DEFAULT_SETTINGS = {
    "store_title": "فروشگاه رگال لباس | Fancy Clothes",
    "marquee_text": "IT'S US, NEVER THEM  •  NEW DROPS  •  کالکشن جدید لباس  •  ارسال به سراسر کشور",
    "contact_phone": "09120000000",
    "instagram": "@store_iran",
    "telegram": "@store_iran",
    "logo_url": "",
    "logo_height": "36",
    "logo_width": "auto"
}

def load_products():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                prods = json.load(f)
                for p in prods:
                    p.setdefault("side_image", "")
                    p.setdefault("front_image", "")
                    p.setdefault("back_image", "")
                    p.setdefault("sizes", "S,M,L,XL,XXL,XXXL")
                    p.setdefault("colourways", [])
                    if not p.get("colourways"):
                        for dp in DEFAULT_PRODUCTS:
                            if dp["slug"] == p["slug"] and dp.get("colourways"):
                                p["colourways"] = list(dp["colourways"])
                                break
                return prods
        except Exception:
            pass
    save_products(DEFAULT_PRODUCTS)
    return list(DEFAULT_PRODUCTS)

def save_products(prods):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(prods, f, ensure_ascii=False, indent=2)

def load_settings():
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return dict(DEFAULT_SETTINGS)

def save_settings(s):
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(s, f, ensure_ascii=False, indent=2)

def load_orders():
    if os.path.exists(ORDERS_FILE):
        try:
            with open(ORDERS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_orders(orders):
    with open(ORDERS_FILE, "w", encoding="utf-8") as f:
        json.dump(orders, f, ensure_ascii=False, indent=2)

# Next.js image lookup table
PRODUCTS_MAP = {
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
    for slug, (large, small, side) in PRODUCTS_MAP.items():
        if name.startswith(slug + "-"):
            view = name[len(slug) + 1:]
            front = small if (small and width <= 512) else large
            if view == "side":
                return side or front
            return front
    return None


def render_admin_html(msg="", msg_type="success"):
    products = load_products()
    settings = load_settings()
    orders = load_orders()

    rows = []
    for p in products:
        img_src = p.get("front_image") or p.get("side_image") or ""
        if not img_src:
            img_src = f"/_next/image?url=%2Fproducts%2F{p['slug']}-front.webp&w=128&q=75"
        elif not img_src.startswith("/"):
            img_src = "/" + img_src

        status_badge = '<span class="badge badge-success">موجود</span>' if p.get("is_available") else '<span class="badge badge-danger">ناموجود</span>'
        formatted_price = f"{p['price']:,} {p.get('currency', 'تومان')}"
        prod_json = json.dumps(p, ensure_ascii=False).replace('"', '&quot;')

        side_badge = '<span style="color:#22c55e;">Side ✔</span>' if (p.get('side_image') or not p.get('front_image')) else '<span style="color:#64748b;">Side ⚪</span>'
        front_badge = '<span style="color:#3b82f6;">Front ✔</span>' if (p.get('front_image') or not p.get('side_image')) else '<span style="color:#64748b;">Front ⚪</span>'
        back_badge = '<span style="color:#a855f7;">Back ✔</span>' if p.get('back_image') else '<span style="color:#64748b;">Back ⚪</span>'

        cw_count = len(p.get('colourways') or [])
        cw_badge = f'<span class="badge" style="background:rgba(236,72,153,0.15);color:#f472b6;border:1px solid rgba(236,72,153,0.3);">{cw_count} رنگ</span>' if cw_count > 0 else ''

        rows.append(f"""
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <img src="{img_src}" class="prod-thumb" onerror="this.src='/_next/image?url=%2Fsnug-wrld-logo.png&w=128&q=75'">
                    <span style="color:#64748b;font-size:12px;">#{p['id']}</span>
                </div>
            </td>
            <td>
                <strong>{p.get('title_fa') or p.get('title')}</strong><br>
                <small style="color:#64748b;font-size:12px;">{p.get('title')}</small>
            </td>
            <td><code>{p.get('slug')}</code></td>
            <td style="color:#22c55e;font-weight:700;">{formatted_price}</td>
            <td>
                <div>{p.get('color') or '-'} {cw_badge}</div>
                <div style="font-size:11px;color:#38bdf8;margin-top:3px;">سایز: {p.get('sizes') or 'همه'}</div>
            </td>
            <td>
                <div style="font-size:11px;display:flex;gap:6px;">{side_badge} {front_badge} {back_badge}</div>
            </td>
            <td>{p.get('stock_quantity', 10)} عدد</td>
            <td>{status_badge}</td>
            <td>
                <button class="btn btn-sm btn-blue" onclick="openEditModal({prod_json})">✏️ ویرایش</button>
                <form method="POST" action="/admin/index.php" style="display:inline;" onsubmit="return confirm('آیا از حذف این محصول اطمینان دارید؟');">
                    <input type="hidden" name="action" value="delete_product">
                    <input type="hidden" name="id" value="{p['id']}">
                    <button type="submit" class="btn btn-sm btn-danger">🗑️ حذف</button>
                </form>
            </td>
        </tr>
        """)

    order_rows = []
    for o in orders:
        status_color = "#eab308" if o.get("status") == "pending" else "#22c55e"
        status_name = "در انتظار" if o.get("status") == "pending" else "تکمیل شده"
        
        color_badge = f'<span class="badge" style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.3);">{o.get("selected_color")}</span>' if o.get("selected_color") else '<span style="color:#64748b;">-</span>'
        size_badge = f'<span class="badge" style="background:rgba(168,85,247,0.15);color:#c084fc;border:1px solid rgba(168,85,247,0.3);">{o.get("selected_size")}</span>' if o.get("selected_size") else '<span style="color:#64748b;">-</span>'

        order_rows.append(f"""
        <tr>
            <td>#{o.get('id', 1)}</td>
            <td><strong>{o.get('customer_name', '-')}</strong></td>
            <td><a href="tel:{o.get('customer_phone')}" style="color:#38bdf8;">{o.get('customer_phone', '-')}</a></td>
            <td><strong>{o.get('product_title', '-')}</strong></td>
            <td>{color_badge}</td>
            <td>{size_badge}</td>
            <td style="font-size:12px;color:#94a3b8;">{o.get('customer_address', '-')}</td>
            <td><span class="badge" style="background:{status_color}22;color:{status_color};border:1px solid {status_color}55;">{status_name}</span></td>
            <td><small style="color:#64748b;">{o.get('created_at', 'لحظاتی پیش')}</small></td>
        </tr>
        """)

    if not order_rows:
        order_rows.append('<tr><td colspan="9" style="text-align:center;color:#64748b;padding:30px;">هنوز سفارشی ثبت نشده است.</td></tr>')

    alert_html = ""
    if msg:
        bg = "#064e3b" if msg_type == "success" else "#450a0a"
        color = "#a7f3d0" if msg_type == "success" else "#fca5a5"
        border = "#059669" if msg_type == "success" else "#dc2626"
        alert_html = f"""<div style="background:{bg};color:{color};border:1px solid {border};padding:12px 16px;border-radius:10px;margin-bottom:20px;">{msg}</div>"""

    return f"""<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مدیریت فروشگاه و محصولات | پیش‌نمایش پنل ادمین</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            background: #090a0f;
            color: #f1f5f9;
            font-family: system-ui, -apple-system, 'Vazirmatn', 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            direction: rtl;
        }}
        .container {{ max-width: 1240px; margin: 0 auto; }}
        header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            margin-bottom: 24px;
            border-bottom: 1px solid #1e2433;
            flex-wrap: wrap;
            gap: 15px;
        }}
        .brand {{ display: flex; align-items: center; gap: 12px; }}
        .brand h1 {{ font-size: 20px; font-weight: 700; color: #fff; }}
        .brand span {{ font-size: 13px; color: #94a3b8; }}
        .nav-links {{ display: flex; gap: 10px; }}
        .btn {{
            background: #1e2433;
            color: #cbd5e1;
            border: 1px solid #282d3c;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }}
        .btn:hover {{ background: #282d3c; color: #fff; }}
        .btn-green {{ background: #059669; border-color: #10b981; color: #fff; }}
        .btn-green:hover {{ background: #047857; }}
        .btn-blue {{ background: #2563eb; border-color: #3b82f6; color: #fff; }}
        .btn-blue:hover {{ background: #1d4ed8; }}
        .btn-danger {{ background: #b91c1c; border-color: #ef4444; color: #fff; }}
        .btn-danger:hover {{ background: #991b1b; }}
        .btn-sm {{ padding: 5px 10px; font-size: 12px; }}
        
        .card {{
            background: #12141c;
            border: 1px solid #1e2433;
            border-radius: 14px;
            padding: 22px;
            margin-bottom: 24px;
        }}
        .card-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 18px;
            flex-wrap: wrap;
            gap: 10px;
        }}
        .card-title {{ font-size: 17px; font-weight: 700; color: #fff; }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            text-align: right;
        }}
        th, td {{
            padding: 12px 14px;
            border-bottom: 1px solid #1c2230;
        }}
        th {{ color: #94a3b8; font-weight: 600; background: #151822; }}
        tr:hover td {{ background: #161a25; }}
        .prod-thumb {{
            width: 44px;
            height: 44px;
            border-radius: 8px;
            object-fit: cover;
            background: #000;
            border: 1px solid #282d3c;
        }}
        .badge {{
            padding: 3px 8px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            display: inline-block;
        }}
        .badge-success {{ background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }}
        .badge-danger {{ background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }}

        /* Modal Styles */
        .modal-overlay {{
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(6px);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            padding: 16px;
        }}
        .modal {{
            background: #131620;
            border: 1px solid #282f42;
            border-radius: 16px;
            width: 100%;
            max-width: 680px;
            max-height: 92vh;
            overflow-y: auto;
            padding: 24px;
            color: #f1f5f9;
        }}
        .modal-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #202636;
            padding-bottom: 12px;
        }}
        .modal-close {{ background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }}
        .form-row {{ display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }}
        .form-row-3 {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 14px; }}
        .form-group {{ margin-bottom: 14px; }}
        .form-group label {{ display: block; font-size: 12px; color: #94a3b8; margin-bottom: 6px; font-weight: 500; }}
        .form-group input, .form-group select, .form-group textarea {{
            width: 100%;
            background: #0b0d13;
            border: 1px solid #262c3d;
            border-radius: 8px;
            padding: 10px 12px;
            color: #fff;
            font-size: 13px;
        }}
        .form-group input:focus, .form-group textarea:focus {{ outline: none; border-color: #3b82f6; }}
        .view-upload-card {{
            background: #0e1017;
            border: 1px dashed #262d3e;
            border-radius: 10px;
            padding: 12px;
            text-align: center;
        }}
        .view-upload-card label {{ font-weight: 700; color: #cbd5e1; margin-bottom: 6px; }}
        .view-upload-desc {{ font-size: 11px; color: #64748b; margin-bottom: 8px; }}
        .size-checkbox-group {{
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 6px;
        }}
        .size-cb-label {{
            background: #0e1017;
            border: 1px solid #282f42;
            padding: 6px 14px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }}
        .size-cb-label input {{ width: auto; margin: 0; }}
    </style>
</head>
<body>

<div class="container">
    <header>
        <div class="brand">
            <span style="font-size: 28px;">👕</span>
            <div>
                <h1>پنل مدیریت فروشگاه رگال</h1>
                <span>سیستم مدیریت محصولات، تصاویر چندنما، سایزبندی و رنگ‌بندی پویا</span>
            </div>
        </div>
        <div class="nav-links">
            <a href="/" class="btn" target="_blank">🌐 مشاهده فروشگاه زنده</a>
            <button class="btn btn-green" onclick="openAddModal()">➕ افزودن محصول جدید</button>
        </div>
    </header>

    {alert_html}

    <!-- تب محصولات -->
    <div class="card">
        <div class="card-header">
            <div>
                <div class="card-title">📦 مدیریت کالکشن محصولات ({len(products)} محصول)</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">مدیریت کامل محصولات، تصاویر Side/Front/Back، تگ‌های آویزان سایز و رنگ‌بندی</div>
            </div>
            <button class="btn btn-green" onclick="openAddModal()">➕ افزودن محصول جدید</button>
        </div>

        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th>تصویر</th>
                        <th>نام محصول</th>
                        <th>اسلاگ (Slug)</th>
                        <th>قیمت</th>
                        <th>رنگ و سایزها</th>
                        <th>نماها (Side/Front/Back)</th>
                        <th>موجودی</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(rows)}
                </tbody>
            </table>
        </div>
    </div>

    <!-- سفارشات -->
    <div class="card">
        <div class="card-header">
            <div class="card-title">🛍️ آخرین سفارشات ثبت شده</div>
        </div>
        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th>کد</th>
                        <th>مشتری</th>
                        <th>تلفن</th>
                        <th>محصول</th>
                        <th>رنگ انتخابی</th>
                        <th>سایز انتخابی</th>
                        <th>آدرس</th>
                        <th>وضعیت</th>
                        <th>زمان</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(order_rows)}
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal افزودن محصول جدید -->
<div class="modal-overlay" id="addModal">
    <div class="modal">
        <div class="modal-header">
            <div class="card-title">➕ افزودن محصول جدید به فروشگاه</div>
            <button class="modal-close" onclick="closeAddModal()">&times;</button>
        </div>
        <form method="POST" action="/admin/index.php" enctype="multipart/form-data">
            <input type="hidden" name="action" value="add_product">

            <div class="form-row">
                <div class="form-group">
                    <label>نام انگلیسی یا اصلی محصول *</label>
                    <input type="text" name="title" required placeholder="مثال: Vintage Heavyweight Hoodie">
                </div>
                <div class="form-group">
                    <label>نام فارسی محصول</label>
                    <input type="text" name="title_fa" placeholder="مثال: هودی ضخیم وینتیج">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>اسلاگ (شناسه انگلیسی یکتا در آدرس)</label>
                    <input type="text" name="slug" placeholder="مثال: vintage-hoodie (اختیاری)" style="direction: ltr;">
                </div>
                <div class="form-group">
                    <label>رنگ پیش‌فرض</label>
                    <input type="text" name="color" placeholder="مثال: Black">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>قیمت محصول (تومان) *</label>
                    <input type="number" name="price" required placeholder="مثال: 950000">
                </div>
                <div class="form-group">
                    <label>واحد پول</label>
                    <select name="currency">
                        <option value="تومان" selected>تومان</option>
                        <option value="ریال">ریال</option>
                        <option value="هزار تومان">هزار تومان</option>
                        <option value="$">$ (دلار)</option>
                    </select>
                </div>
            </div>

            <!-- انتخاب سایزبندی -->
            <div class="form-group">
                <label>📏 سایزبندی‌های موجود (برچسب‌های آویزان سمت چپ پیراهن):</label>
                <div class="size-checkbox-group">
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="S" checked> S</label>
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="M" checked> M</label>
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="L" checked> L</label>
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="XL" checked> XL</label>
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="XXL" checked> XXL</label>
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="XXXL"> XXXL</label>
                </div>
            </div>

            <!-- آپلود تصاویر ۳ نما -->
            <div class="form-group">
                <label>🖼️ تصاویر ۳ نما (Multi-View 3D):</label>
                <div class="form-row-3">
                    <div class="view-upload-card">
                        <label>Side View</label>
                        <div class="view-upload-desc">نمای کناری (روی رگال در حالت عادی)</div>
                        <input type="file" name="product_image_side" accept="image/*">
                    </div>
                    <div class="view-upload-card">
                        <label>Front View</label>
                        <div class="view-upload-desc">نمای روبرو (هنگام هاور موس)</div>
                        <input type="file" name="product_image_front" accept="image/*">
                    </div>
                    <div class="view-upload-card">
                        <label>Back View</label>
                        <div class="view-upload-desc">نمای پشت (چرخش در فوکوس)</div>
                        <input type="file" name="product_image_back" accept="image/*">
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>موجودی در انبار</label>
                    <input type="number" name="stock_quantity" value="10">
                </div>
                <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-top: 24px;">
                    <input type="checkbox" name="is_available" id="addIsAvailable" value="1" checked style="width: 20px; height: 20px;">
                    <label for="addIsAvailable" style="margin: 0; cursor: pointer; color: #fff;">محصول موجود است</label>
                </div>
            </div>

            <div class="form-group">
                <label>توضیحات و مشخصات</label>
                <textarea name="description" placeholder="جنس پارچه، جدول سایز و توضیحات محصول..."></textarea>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                <button type="button" class="btn" onclick="closeAddModal()">انصراف</button>
                <button type="submit" class="btn btn-green">➕ افزودن و ذخیره محصول</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal ویرایش محصول -->
<div class="modal-overlay" id="editModal">
    <div class="modal">
        <div class="modal-header">
            <div class="card-title" id="modalProductTitle">ویرایش محصول</div>
            <button class="modal-close" onclick="closeEditModal()">&times;</button>
        </div>
        <form method="POST" action="/admin/index.php" enctype="multipart/form-data">
            <input type="hidden" name="action" value="edit_product">
            <input type="hidden" name="id" id="editId">

            <div class="form-row">
                <div class="form-group">
                    <label>نام محصول (انگلیسی یا اصلی)</label>
                    <input type="text" name="title" id="editTitle" required>
                </div>
                <div class="form-group">
                    <label>نام فارسی محصول</label>
                    <input type="text" name="title_fa" id="editTitleFa">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>قیمت</label>
                    <input type="number" name="price" id="editPrice" required>
                </div>
                <div class="form-group">
                    <label>واحد پول</label>
                    <select name="currency" id="editCurrency">
                        <option value="تومان">تومان</option>
                        <option value="ریال">ریال</option>
                        <option value="هزار تومان">هزار تومان</option>
                        <option value="$">$ (دلار)</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>رنگ پیش‌فرض</label>
                    <input type="text" name="color" id="editColor">
                </div>
                <div class="form-group">
                    <label>تعداد موجودی در انبار</label>
                    <input type="number" name="stock_quantity" id="editStock">
                </div>
            </div>

            <!-- انتخاب سایزبندی ویرایش -->
            <div class="form-group">
                <label>📏 سایزبندی‌های موجود (برچسب‌های آویزان سمت چپ پیراهن):</label>
                <div class="size-checkbox-group" id="editSizeGroup">
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="S" id="sz_S"> S</label>
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="M" id="sz_M"> M</label>
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="L" id="sz_L"> L</label>
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="XL" id="sz_XL"> XL</label>
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="XXL" id="sz_XXL"> XXL</label>
                    <label class="size-cb-label"><input type="checkbox" name="sizes[]" value="XXXL" id="sz_XXXL"> XXXL</label>
                </div>
            </div>

            <!-- تصاویر ۳ نما برای ویرایش -->
            <div class="form-group">
                <label>🖼️ تغییر یا جایگزینی تصاویر ۳ نما (اختیاری):</label>
                <div class="form-row-3">
                    <div class="view-upload-card">
                        <label>Side View</label>
                        <div class="view-upload-desc">نمای کناری روی رگال</div>
                        <input type="file" name="product_image_side" accept="image/*">
                    </div>
                    <div class="view-upload-card">
                        <label>Front View</label>
                        <div class="view-upload-desc">نمای روبرو در هاور</div>
                        <input type="file" name="product_image_front" accept="image/*">
                    </div>
                    <div class="view-upload-card">
                        <label>Back View</label>
                        <div class="view-upload-desc">نمای پشت در فوکوس</div>
                        <input type="file" name="product_image_back" accept="image/*">
                    </div>
                </div>
            </div>

            <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" name="is_available" id="editIsAvailable" value="1" style="width: 20px; height: 20px;">
                <label for="editIsAvailable" style="margin: 0; cursor: pointer; color: #fff;">محصول موجود است</label>
            </div>

            <div class="form-group">
                <label>توضیحات محصول</label>
                <textarea name="description" id="editDescription"></textarea>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                <button type="button" class="btn" onclick="closeEditModal()">انصراف</button>
                <button type="submit" class="btn btn-blue">💾 ذخیره تغییرات</button>
            </div>
        </form>
    </div>
</div>

<script>
function openAddModal() {{ document.getElementById('addModal').style.display = 'flex'; }}
function closeAddModal() {{ document.getElementById('addModal').style.display = 'none'; }}
function openEditModal(p) {{
    document.getElementById('editId').value = p.id;
    document.getElementById('modalProductTitle').innerText = 'ویرایش: ' + (p.title_fa || p.title);
    document.getElementById('editTitle').value = p.title || '';
    document.getElementById('editTitleFa').value = p.title_fa || '';
    document.getElementById('editPrice').value = p.price || 0;
    document.getElementById('editCurrency').value = p.currency || 'تومان';
    document.getElementById('editColor').value = p.color || '';
    document.getElementById('editStock').value = p.stock_quantity || 0;
    document.getElementById('editIsAvailable').checked = parseInt(p.is_available) === 1;
    document.getElementById('editDescription').value = p.description || '';

    // سایزبندی
    const sizes = (p.sizes || 'S,M,L,XL,XXL').split(',').map(s => s.trim().toUpperCase());
    ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].forEach(sz => {{
        const el = document.getElementById('sz_' + sz);
        if (el) el.checked = sizes.includes(sz);
    }});

    document.getElementById('editModal').style.display = 'flex';
}}
function closeEditModal() {{ document.getElementById('editModal').style.display = 'none'; }}
window.onclick = function(e) {{
    if (e.target === document.getElementById('editModal')) closeEditModal();
    if (e.target === document.getElementById('addModal')) closeAddModal();
}};
</script>
</body>
</html>
"""


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path in ("/", "/index.html", "/index.php"):
            prods = load_products()
            settings = load_settings()
            html_path = os.path.join(ROOT, "index.html")
            with open(html_path, "r", encoding="utf-8") as f:
                html = f.read()
            injected_script = f'<script>window.STORE_BASE_PATH="/";window.__DB_PRODUCTS__ = {json.dumps(prods, ensure_ascii=False)};window.__DB_SETTINGS__ = {json.dumps(settings, ensure_ascii=False)};if(window.__DB_PRODUCTS__ && (window.__DB_PRODUCTS__.length !== 7 || window.__DB_PRODUCTS__.some(function(p){{ return p.front_image || p.side_image || p.back_image; }}))){{ document.documentElement.id = "__next_error__"; }}</script>'
            html = html.replace("<head>", f"<head>{injected_script}", 1)
            payload = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # 1. Admin UI
        if parsed.path in ("/admin", "/admin/", "/admin/index.php", "/admin/login.php"):
            qs = parse_qs(parsed.query)
            msg_code = qs.get("msg", [""])[0]
            msg = ""
            msg_type = "success"
            if msg_code == "added":
                msg = "محصول جدید با موفقیت اضافه شد و در فروشگاه قرار گرفت!"
            elif msg_code == "edited":
                msg = "اطلاعات محصول با موفقیت به‌روزرسانی شد."
            elif msg_code == "deleted":
                msg = "محصول مورد نظر با موفقیت حذف شد."

            html = render_admin_html(msg, msg_type).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(html)))
            self.end_headers()
            self.wfile.write(html)
            return

        # 2. Uploads
        if parsed.path.startswith("/uploads/"):
            rel = parsed.path.lstrip("/uploads/")
            fpath = os.path.join(UPLOADS_DIR, rel)
            if os.path.exists(fpath) and os.path.isfile(fpath):
                with open(fpath, "rb") as f:
                    content = f.read()
                self.send_response(200)
                ext = os.path.splitext(fpath)[1].lower()
                ct = "image/jpeg"
                if ext == ".png": ct = "image/png"
                elif ext == ".webp": ct = "image/webp"
                elif ext == ".gif": ct = "image/gif"
                self.send_header("Content-Type", ct)
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

        # 3. Next.js image lookup
        if parsed.path == "/_next/image":
            qs = parse_qs(parsed.query)
            width = int(qs.get("w", ["0"])[0] or 0)
            url_param = qs.get("url", [""])[0]

            clean_url = url_param.lstrip("/")
            if "uploads/" in clean_url:
                clean_url = clean_url[clean_url.find("uploads/"):]
            if clean_url.startswith("uploads/"):
                up_path = os.path.join(ROOT, clean_url)
                if os.path.exists(up_path) and os.path.isfile(up_path):
                    with open(up_path, "rb") as f:
                        data = f.read()
                    ext = os.path.splitext(up_path)[1].lower()
                    ct = "image/jpeg"
                    if ext == ".png": ct = "image/png"
                    elif ext == ".webp": ct = "image/webp"
                    elif ext == ".gif": ct = "image/gif"
                    self.send_response(200)
                    self.send_header("Content-Type", ct)
                    self.send_header("Content-Length", str(len(data)))
                    self.send_header("Cache-Control", "public, max-age=3600")
                    self.end_headers()
                    self.wfile.write(data)
                    return

            fname = resolve_image(url_param, width)
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

        # 4. Products API
        if parsed.path in ("/api/products.php", "/api/products"):
            prods = load_products()
            settings = load_settings()
            formatted = []
            for p in prods:
                item = dict(p)
                item["formatted_price"] = f"{int(item['price']):,} {item.get('currency', 'تومان')}"
                if item.get("front_image"):
                    item["image_url"] = item["front_image"]
                elif item.get("side_image"):
                    item["image_url"] = item["side_image"]
                else:
                    item["image_url"] = f"_next/image?url=%2Fproducts%2F{item['slug']}-front.webp&w=640&q=75"
                formatted.append(item)

            payload = json.dumps({
                "success": True,
                "source": "preview_database",
                "settings": settings,
                "products": formatted
            }, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        self.path = parsed.path
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)

        # 1. Orders API submission
        if parsed.path in ("/api/orders.php", "/api/orders"):
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                order_info = json.loads(body.decode("utf-8"))
            except Exception:
                order_info = {}
            
            orders = load_orders()
            new_id = len(orders) + 1
            order_info["id"] = new_id
            order_info["status"] = "pending"
            order_info["created_at"] = time.strftime("%Y-%m-%d %H:%M")
            order_info.setdefault("selected_color", "")
            order_info.setdefault("selected_size", "")
            orders.insert(0, order_info)
            save_orders(orders)

            payload = json.dumps({
                "success": True,
                "order_id": new_id,
                "message": "سفارش شما با موفقیت ثبت شد! کارشناسان ما به زودی با شما تماس خواهند گرفت."
            }, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # 2. Admin Actions (add_product, edit_product, delete_product)
        if parsed.path in ("/admin", "/admin/", "/admin/index.php"):
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            ctype = self.headers.get("Content-Type", "")

            fields = {}
            fields_multi = {}
            uploaded_files = {}

            if "multipart/form-data" in ctype:
                msg = email.message_from_bytes(
                    b"Content-Type: " + ctype.encode("utf-8") + b"\r\n\r\n" + body,
                    policy=policy.default
                )
                for part in msg.iter_parts():
                    name = part.get_param("name", header="content-disposition")
                    filename = part.get_filename()
                    if filename and name:
                        file_data = part.get_payload(decode=True)
                        if file_data and len(file_data) > 0:
                            ext = os.path.splitext(filename)[1].lower() or ".jpg"
                            safe_name = f"upload-{name}-{int(time.time() * 1000) % 1000000}{ext}"
                            with open(os.path.join(UPLOADS_DIR, safe_name), "wb") as f:
                                f.write(file_data)
                            uploaded_files[name] = "uploads/" + safe_name
                    elif name:
                        payload_bytes = part.get_payload(decode=True)
                        val = ""
                        if payload_bytes is not None:
                            try:
                                val = payload_bytes.decode('utf-8').strip()
                            except Exception:
                                val = payload_bytes.decode('latin-1', errors='ignore').strip()
                        else:
                            val = part.get_content().strip()
                        fields[name] = val
                        fields_multi.setdefault(name, []).append(val)
            else:
                parsed_qs = parse_qs(body.decode("utf-8"))
                for k, v in parsed_qs.items():
                    fields[k] = v[0]
                    fields_multi[k] = v

            action = fields.get("action", "")
            products = load_products()

            if action == "add_product":
                title = fields.get("title", "").strip()
                title_fa = fields.get("title_fa", "").strip()
                slug = fields.get("slug", "").strip()
                if not slug:
                    slug = "product-" + str(int(time.time()))
                price = int(fields.get("price", "0") or 0)
                currency = fields.get("currency", "تومان")
                color = fields.get("color", "")
                stock = int(fields.get("stock_quantity", "10") or 10)
                is_available = 1 if fields.get("is_available") else 0
                desc = fields.get("description", "")

                sizes_list = fields_multi.get("sizes[]", fields_multi.get("sizes", []))
                sizes_str = ",".join(sizes_list) if sizes_list else "S,M,L,XL,XXL"

                side_img = uploaded_files.get("product_image_side", "")
                front_img = uploaded_files.get("product_image_front", "") or uploaded_files.get("product_image", "")
                back_img = uploaded_files.get("product_image_back", "")

                new_id = max([p["id"] for p in products], default=0) + 1
                new_prod = {
                    "id": new_id,
                    "slug": slug,
                    "title": title,
                    "title_fa": title_fa,
                    "price": price,
                    "currency": currency,
                    "is_available": is_available,
                    "stock_quantity": stock,
                    "color": color,
                    "sizes": sizes_str,
                    "colourways": [],
                    "front_image": front_img,
                    "side_image": side_img,
                    "back_image": back_img,
                    "buy_url": "",
                    "description": desc
                }
                products.append(new_prod)
                save_products(products)
                self.send_response(303)
                self.send_header("Location", "/admin/index.php?msg=added")
                self.end_headers()
                return

            elif action == "edit_product":
                pid = int(fields.get("id", "0"))
                sizes_list = fields_multi.get("sizes[]", fields_multi.get("sizes", []))
                sizes_str = ",".join(sizes_list) if sizes_list else None

                for p in products:
                    if p["id"] == pid:
                        p["title"] = fields.get("title", p["title"])
                        p["title_fa"] = fields.get("title_fa", p.get("title_fa", ""))
                        p["price"] = int(fields.get("price", p["price"]) or 0)
                        p["currency"] = fields.get("currency", p.get("currency", "تومان"))
                        p["color"] = fields.get("color", p.get("color", ""))
                        p["stock_quantity"] = int(fields.get("stock_quantity", p.get("stock_quantity", 10)) or 10)
                        p["is_available"] = 1 if fields.get("is_available") else 0
                        p["description"] = fields.get("description", p.get("description", ""))
                        if sizes_str is not None:
                            p["sizes"] = sizes_str

                        if "product_image_side" in uploaded_files:
                            p["side_image"] = uploaded_files["product_image_side"]
                        if "product_image_front" in uploaded_files:
                            p["front_image"] = uploaded_files["product_image_front"]
                        elif "product_image" in uploaded_files:
                            p["front_image"] = uploaded_files["product_image"]
                        if "product_image_back" in uploaded_files:
                            p["back_image"] = uploaded_files["product_image_back"]
                        break
                save_products(products)
                self.send_response(303)
                self.send_header("Location", "/admin/index.php?msg=edited")
                self.end_headers()
                return

            elif action == "delete_product":
                pid = int(fields.get("id", "0"))
                to_delete = [p for p in products if p["id"] == pid]
                for p in to_delete:
                    imgs_to_remove = []
                    for key in ["front_image", "side_image", "back_image"]:
                        if p.get(key):
                            imgs_to_remove.append(p[key])
                    for cw in p.get("colourways", []):
                        if isinstance(cw, dict):
                            for key in ["front", "side", "back"]:
                                if cw.get(key):
                                    imgs_to_remove.append(cw[key])
                    for img_rel in imgs_to_remove:
                        if "uploads/" in img_rel:
                            sub = img_rel.split("uploads/", 1)[1]
                            fpath = os.path.join(UPLOADS_DIR, sub)
                            if os.path.isfile(fpath):
                                try:
                                    os.remove(fpath)
                                except OSError:
                                    pass
                products = [p for p in products if p["id"] != pid]
                save_products(products)
                self.send_response(303)
                self.send_header("Location", "/admin/index.php?msg=deleted")
                self.end_headers()
                return

            elif action == "update_settings":
                settings = load_settings()
                for key in ["store_title", "marquee_text", "contact_phone", "instagram", "telegram", "logo_height", "logo_width"]:
                    if key in fields:
                        settings[key] = fields[key]
                if "logo_url" in fields and fields["logo_url"]:
                    settings["logo_url"] = fields["logo_url"]
                if "logo_file" in uploaded_files and uploaded_files["logo_file"]:
                    settings["logo_url"] = uploaded_files["logo_file"]
                save_settings(settings)
                self.send_response(303)
                self.send_header("Location", "/admin/index.php?tab=settings&msg=settings_saved")
                self.end_headers()
                return

        self.send_error(404)


def main():
    port = 8080
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    url = f"http://localhost:{port}/"
    print(f"✨ Local Preview Server started at {url}")
    print(f"👕 Main Store View:    {url}")
    print(f"⚙️ Persian Admin Panel: {url}admin/")
    print(f"📦 Products API:       {url}api/products.php")
    print(f"🛍️ Orders API:         {url}api/orders.php")
    print("Press Ctrl+C to stop.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
