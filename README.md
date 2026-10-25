# Fancy Clothes 👕

<div dir="rtl">

یه سایت فروشگاه لباس با یه رگال لباس متحرک. روی هر لباس که کلیک کنی، بزرگ می‌شه و جزئیاتش رو نشون می‌ده.

[English guide below ⬇️](#english)

## چطوری اجراش کنم؟ (۳ قدم)

### قدم ۱: دانلود

بالای همین صفحه روی دکمهٔ سبز **`<> Code`** بزن و بعد **`Download ZIP`** رو انتخاب کن.
فایل دانلودشده رو باز کن (Unzip) تا یه پوشه بشه.

### قدم ۲: نصب پایتون (فقط یه بار)

- **مک:** معمولاً از قبل نصبه. برو قدم ۳.
- **ویندوز:** از [python.org/downloads](https://www.python.org/downloads/) دانلود و نصبش کن.
  ⚠️ موقع نصب حتماً تیک **`Add Python to PATH`** رو بزن.

### قدم ۳: اجرا

توی پوشه‌ای که باز کردی:

- **مک:** روی فایل **`start-mac.command`** دوبار کلیک کن.
- **ویندوز:** روی فایل **`start-windows.bat`** دوبار کلیک کن.

سایت خودش توی مرورگر باز می‌شه. 🎉
اگه باز نشد، این آدرس رو توی مرورگر بزن: **http://localhost:8080**

برای بستن سایت، پنجرهٔ سیاه (ترمینال) رو ببند.

## مشکل داری؟

| مشکل | راه‌حل |
|---|---|
| مک می‌گه «نمی‌شه بازش کرد چون از یه توسعه‌دهندهٔ ناشناسه» | روی فایل **راست‌کلیک** کن، **Open** رو بزن، بعد دوباره **Open**. |
| ویندوز می‌گه `python` پیدا نشد | پایتون رو دوباره نصب کن و این بار تیک `Add Python to PATH` رو بزن. |
| می‌گه پورت 8080 درگیره | یه بار دیگه سایت بازه. اون پنجره رو ببند و دوباره امتحان کن. |

## روش دستی (برای کسایی که با ترمینال کار می‌کنن)

</div>

```bash
python3 serve.py
```

<div dir="rtl">

روی ویندوز به جای `python3` بنویس `python`.
اگه می‌خوای روی یه پورت دیگه اجرا بشه: `python3 serve.py 3000`

</div>

---

<a id="english"></a>

## English

A clothing store website with an animated clothes rack. Click any item to see it up close.

### How to run it (3 steps)

1. **Download:** click the green **`<> Code`** button at the top of this page → **`Download ZIP`**, then unzip it.
2. **Install Python (one time only):**
   - **Mac:** usually already installed, so skip this step.
   - **Windows:** install it from [python.org/downloads](https://www.python.org/downloads/). ⚠️ Tick **`Add Python to PATH`** during setup.
3. **Run:** in the unzipped folder, double-click
   - **Mac:** `start-mac.command`
   - **Windows:** `start-windows.bat`

The site opens in your browser by itself. If it doesn't, go to **http://localhost:8080**.
To stop the site, close the black terminal window.

**Mac says the file is from an unidentified developer?** Right-click the file → **Open** → **Open**.

**Prefer the terminal?**

```bash
python3 serve.py
```

### What's inside

| File / folder | What it is |
|---|---|
| `site/` | The website itself |
| `serve.py` | A tiny local server that runs the site. Nothing to install: it only needs Python. |
| `start-mac.command` | Double-click to run on Mac |
| `start-windows.bat` | Double-click to run on Windows |
