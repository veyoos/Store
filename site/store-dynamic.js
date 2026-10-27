/**
 * store-dynamic.js
 * اتصال فرانت‌اند رگال به پایگاه داده MySQL، مدیریت محصولات پویا،
 * تگ‌های آویزان انتخاب سایز (سمت چپ)، ردیابی رنگ انتخابی (سمت راست)
 * و ثبت رنگ و سایز در سیستم سفارشات آنلاین
 */
(function() {
    'use strict';

    let storeData = {
        products: [],
        settings: {}
    };

    window.__SELECTED_COLOR__ = '';
    window.__SELECTED_SIZE__ = '';

    const getBasePath = () => {
        if (window.STORE_BASE_PATH) return window.STORE_BASE_PATH;
        const p = window.location.pathname.replace(/\/index\.(html|php)$/i, '').replace(/\/+$/, '');
        return p ? (p + '/') : '/';
    };

    // ۱. دریافت داده‌های محصولات و تنظیمات از API دیتابیس
    async function loadStoreData() {
        try {
            const res = await fetch(getBasePath() + 'api/products.php');
            if (res.ok) {
                const data = await res.json();
                if (data.products && Array.isArray(data.products) && data.products.length > 0) {
                    storeData.products = data.products;
                }
                if (data.settings) {
                    storeData.settings = data.settings;
                    updateMarquee(data.settings.marquee_text);
                    if (data.settings.store_title) {
                        document.title = data.settings.store_title;
                    }
                    applyLogo(data.settings);
                }
                updateCatalogUI();
            }
        } catch (e) {
            console.warn("API fallback mode:", e);
        }
    }

    // به‌روزرسانی متن نوار متحرک
    function updateMarquee(text) {
        if (!text) return;
        try {
            const tracks = document.querySelectorAll('.marquee-track span');
            tracks.forEach(span => {
                span.textContent = text + '  •  ' + text + '  •  ';
            });
        } catch (e) {}
    }

    // به‌روزرسانی لوگو و اندازه آن در بالای صفحه
    function applyLogo(settings) {
        if (!settings) return;
        try {
            const logoImg = document.querySelector('header img');
            if (logoImg) {
                if (settings.logo_url) {
                    let logoSrc = settings.logo_url;
                    if (!logoSrc.startsWith('http') && !logoSrc.startsWith('/')) {
                        logoSrc = getBasePath() + logoSrc;
                    }
                    logoImg.src = logoSrc;
                    logoImg.srcset = '';
                }
                if (settings.logo_height) {
                    logoImg.style.height = settings.logo_height + 'px';
                    logoImg.style.maxHeight = settings.logo_height + 'px';
                }
                if (settings.logo_width && settings.logo_width !== 'auto') {
                    logoImg.style.width = settings.logo_width + 'px';
                    logoImg.style.maxWidth = settings.logo_width + 'px';
                }
            }
        } catch (e) {}
    }

    // پیدا کردن اطلاعات محصول در دیتابیس با تطبیق عنوان یا اسلاگ
    function findProduct(nameText) {
        if (!nameText || !storeData.products) return null;
        const cleanName = nameText.trim().toLowerCase();
        return storeData.products.find(p => {
            const tEn = (p.title || '').trim().toLowerCase();
            const tFa = (p.title_fa || '').trim().toLowerCase();
            const s = (p.slug || '').trim().toLowerCase();
            return (tEn && (cleanName.includes(tEn) || tEn.includes(cleanName))) ||
                   (tFa && (cleanName.includes(tFa) || tFa.includes(cleanName))) ||
                   (s && (cleanName.includes(s) || s.includes(cleanName)));
        });
    }

    function getCurrentlyFocusedProduct() {
        const nameEl = document.querySelector('.focus-info .info .info-name');
        if (nameEl) {
            return findProduct(nameEl.textContent);
        }
        return null;
    }

    // ۲. تزریق استایل‌های مورد نیاز (شامل برچسب‌های آویزان سایز و فرم سفارش)
    function injectStyles() {
        if (document.getElementById('store-dynamic-styles')) return;
        const style = document.createElement('style');
        style.id = 'store-dynamic-styles';
        style.textContent = `
            .dynamic-product-meta {
                margin: 10px 0 14px 0;
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
                font-family: system-ui, -apple-system, sans-serif;
            }
            .dynamic-price {
                font-size: 19px;
                font-weight: 700;
                color: #22c55e;
                direction: rtl;
            }
            .dynamic-badge {
                font-size: 11px;
                font-weight: 600;
                padding: 3px 8px;
                border-radius: 999px;
                letter-spacing: 0.02em;
            }
            .badge-instock { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
            .badge-outstock { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }

            /* دکمه‌های شناور پایین صفحه */
            .floating-actions-bar {
                position: fixed;
                bottom: 45px;
                right: 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 9999;
                font-family: system-ui, -apple-system, sans-serif;
            }

            /* حفظ تناسب طبیعی و ابعاد محصولات روی رگال */
            .garment-layer img {
                object-fit: contain !important;
                object-position: center top !important;
            }
            .fg-layer img {
                object-fit: contain !important;
                object-position: center top !important;
            }

            /* نمای طبیعی و متناسب کناری برای محصولات روی رگال */
            .garment-layer.layer-custom.layer-side img,
            .layer-side img[src*="upload"],
            .layer-side img[src*="uploads"] {
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                margin: 0 auto !important;
                object-fit: contain !important;
                object-position: center top !important;
                transform: scaleX(0.75) !important;
                transform-origin: center top !important;
            }

            /* نمای روبرو برای محصولات روی رگال */
            .garment-layer.layer-custom.layer-front img,
            .layer-front img[src*="upload"],
            .layer-front img[src*="uploads"] {
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                margin: 0 auto !important;
                object-fit: contain !important;
                object-position: center top !important;
                transform: scale(1) !important;
            }

            /* نمایش تمیز عکس محصول در صفحه فوکوس و جزئیات */
            .fg-layer.fg-custom img,
            .fg-layer img[src*="upload"],
            .fg-layer img[src*="uploads"] {
                width: 100% !important;
                height: 100% !important;
                margin: 0 auto !important;
                object-fit: contain !important;
                object-position: center top !important;
            }

            /* حذف کامل نوار سبز رنگ متحرک پایین صفحه */
            .bg-brand,
            div[class*="bg-brand"] {
                display: none !important;
            }

            .floating-btn {
                background: rgba(15, 23, 42, 0.88);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.18);
                color: #f1f5f9;
                font-size: 12px;
                font-weight: 600;
                padding: 8px 16px;
                border-radius: 20px;
                text-decoration: none;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                box-shadow: 0 10px 20px rgba(0,0,0,0.3);
            }
            .floating-btn:hover {
                background: #1e293b;
                color: #fff;
                transform: translateY(-2px);
                border-color: rgba(255, 255, 255, 0.35);
            }
            .floating-btn-catalog {
                background: #2563eb;
                border-color: #3b82f6;
            }
            .floating-btn-catalog:hover {
                background: #1d4ed8;
            }

            /* برچسب‌های آویزان انتخاب سایز در سمت چپ پیراهن (قرینه تگ‌های رنگ در سمت راست) */
            .focus-sizes-wrap {
                right: calc(var(--fiw, 400px) * .44);
                top: calc(var(--fiw, 400px) * .08);
                --tag-string: 34px;
                --tag-step: 18px;
                position: absolute;
                z-index: 100;
                pointer-events: auto;
                direction: ltr;
            }
            @media (max-width: 640px) {
                .focus-sizes-wrap {
                    right: auto;
                    left: 10px;
                    top: calc(var(--fiw, 320px) * .12);
                }
            }
            .size-tags {
                display: flex;
                flex-direction: row-reverse;
                gap: 6px;
                pointer-events: none;
            }
            @media (max-width: 640px) {
                .size-tags {
                    flex-direction: column;
                    gap: 0;
                }
            }
            .size-tagwrap {
                transform-origin: 50% 0;
                pointer-events: none;
                animation: 3.6s ease-in-out infinite sway;
                position: relative;
            }
            .size-tagwrap .string {
                background: #ffffff;
                opacity: 0.55;
                width: 1px;
                margin-inline: auto;
            }
            .size-tag-hit {
                pointer-events: auto;
                cursor: pointer;
                background: transparent;
                border: none;
                padding: 0;
                margin-inline: -1px;
                min-width: 44px;
                min-height: 48px;
                display: flex;
                justify-content: center;
                outline: none;
            }
            .size-tag {
                box-sizing: border-box;
                clip-path: polygon(22% 0, 78% 0, 100% 12%, 100% 100%, 0 100%, 0 12%);
                background: rgba(255, 255, 255, 0.2);
                width: 44px;
                height: 92px;
                padding: 1px;
                transition: transform .35s cubic-bezier(.3, 1.6, .5, 1), box-shadow 0.25s;
                display: block;
                position: relative;
            }
            .size-tag-face {
                box-sizing: border-box;
                background: #171b26;
                width: 100%;
                height: 100%;
                color: #e2e8f0;
                letter-spacing: .08em;
                font-weight: 700;
                font-size: 13px;
                font-family: system-ui, -apple-system, sans-serif;
                clip-path: polygon(22% 0, 78% 0, 100% 12%, 100% 100%, 0 100%, 0 12%);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.12);
                user-select: none;
            }
            .size-tag-face:before {
                content: "";
                background: #475569;
                border-radius: 50%;
                width: 6px;
                height: 6px;
                margin-left: -3px;
                position: absolute;
                top: 5px;
                left: 50%;
                box-shadow: inset 0 0 0 1px rgba(0,0,0,0.5);
            }
            .size-tag-hit:hover .size-tag {
                transform: rotate(6deg) translateY(-2px);
                box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);
            }
            .size-tagwrap.on .size-tag {
                transform: translateY(14px);
                box-shadow: 0 0 20px rgba(56, 189, 248, 0.65);
            }
            .size-tagwrap.on .size-tag-face {
                background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);
                color: #ffffff;
                border-color: #38bdf8;
                text-shadow: 0 1px 3px rgba(0,0,0,0.5);
            }
            .size-tagwrap.on .size-tag-face:after {
                content: "";
                background: #38bdf8;
                height: 3px;
                position: absolute;
                inset: auto 6px 6px;
                border-radius: 2px;
            }

            /* مودال ثبت سفارش */
            .order-modal-backdrop, .catalog-modal-backdrop {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(8px);
                z-index: 100000;
                align-items: center;
                justify-content: center;
                padding: 16px;
                direction: rtl;
                font-family: system-ui, -apple-system, sans-serif;
            }
            .order-modal {
                background: #12141a;
                border: 1px solid #282d3c;
                border-radius: 16px;
                width: 100%;
                max-width: 470px;
                padding: 24px 22px;
                color: #f1f5f9;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
                animation: modalFadeIn 0.25s ease-out;
                max-height: 92vh;
                overflow-y: auto;
            }
            .catalog-modal {
                background: #12141a;
                border: 1px solid #282d3c;
                border-radius: 16px;
                width: 100%;
                max-width: 920px;
                max-height: 88vh;
                display: flex;
                flex-direction: column;
                color: #f1f5f9;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
                animation: modalFadeIn 0.25s ease-out;
            }
            @keyframes modalFadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .modal-header-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 18px 22px;
                border-bottom: 1px solid #1e2433;
            }
            .modal-header-bar h3 { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
            .modal-close-icon {
                background: none; border: none; color: #94a3b8; font-size: 26px; cursor: pointer; line-height: 1;
            }
            .modal-close-icon:hover { color: #fff; }

            /* چیپ‌های انتخاب رنگ و سایز در فرم سفارش */
            .order-chip-group {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 6px;
            }
            .order-chip {
                padding: 6px 14px;
                border-radius: 8px;
                background: #171b26;
                border: 1px solid #2d3548;
                color: #cbd5e1;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                user-select: none;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .order-chip:hover {
                border-color: #38bdf8;
                color: #fff;
                background: #1e2433;
            }
            .order-chip.active {
                background: #0284c7;
                color: #fff;
                border-color: #38bdf8;
                box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
            }
            .order-chip-color-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                display: inline-block;
                border: 1px solid rgba(255,255,255,0.3);
            }

            /* گرید محصولات در مودال کاتالوگ */
            .catalog-grid {
                padding: 20px 24px;
                overflow-y: auto;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 18px;
            }
            .catalog-card {
                background: #171a23;
                border: 1px solid #242938;
                border-radius: 12px;
                padding: 14px;
                display: flex;
                flex-direction: column;
                transition: transform 0.2s, border-color 0.2s;
            }
            .catalog-card:hover {
                transform: translateY(-3px);
                border-color: #3b82f6;
            }
            .catalog-img-wrap {
                width: 100%;
                height: 200px;
                background: #0b0d12;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                margin-bottom: 12px;
            }
            .catalog-img-wrap img {
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
            }
            .catalog-card-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
            .catalog-card-fa { font-size: 13px; color: #94a3b8; margin-bottom: 8px; }
            .catalog-card-footer {
                margin-top: auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-top: 10px;
                border-top: 1px solid #202534;
            }
            .catalog-card-price { font-size: 15px; font-weight: 700; color: #22c55e; }
            .catalog-card-btn {
                background: #2563eb;
                color: #fff;
                border: none;
                border-radius: 6px;
                padding: 6px 12px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }
            .catalog-card-btn:hover { background: #1d4ed8; }

            /* فرم سفارش */
            .order-product-card {
                background: #1a1e29;
                border-radius: 10px;
                padding: 12px 14px;
                margin-bottom: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border: 1px solid #23293a;
            }
            .order-product-name { font-size: 14px; font-weight: 600; color: #e2e8f0; }
            .order-product-price { font-size: 15px; font-weight: 700; color: #22c55e; }
            .order-form-group { margin-bottom: 14px; }
            .order-form-group label {
                display: block; font-size: 12px; font-weight: 500; color: #94a3b8; margin-bottom: 6px;
            }
            .order-form-group input, .order-form-group textarea {
                width: 100%;
                background: #090b0e;
                border: 1px solid #2d3446;
                border-radius: 8px;
                padding: 10px 12px;
                color: #fff;
                font-size: 14px;
                box-sizing: border-box;
            }
            .order-form-group input:focus, .order-form-group textarea:focus {
                outline: none; border-color: #3b82f6;
            }
            .order-submit-btn {
                width: 100%;
                background: #2563eb;
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
                margin-top: 10px;
            }
            .order-submit-btn:hover { background: #1d4ed8; }
            .order-submit-btn:disabled { background: #475569; cursor: not-allowed; }
            .order-result-msg {
                margin-top: 12px; padding: 10px; border-radius: 8px; font-size: 13px; text-align: center; display: none;
            }
        `;
        document.head.appendChild(style);
    }

    // ۳. ایجاد مودال ثبت سفارش با انتخاب رنگ و سایز
    function createOrderModal() {
        if (document.getElementById('orderModalBackdrop')) return;

        const modalHtml = `
            <div class="order-modal-backdrop" id="orderModalBackdrop">
                <div class="order-modal">
                    <div class="modal-header-bar" style="padding: 0 0 14px 0; margin-bottom: 16px;">
                        <span style="font-size: 17px; font-weight: 700; color: #fff;">🛍️ ثبت سفارش آنلاین</span>
                        <button class="modal-close-icon" id="orderModalCloseBtn">&times;</button>
                    </div>
                    <div class="order-product-card">
                        <div>
                            <div class="order-product-name" id="orderModalProdName">نام محصول</div>
                            <div style="font-size: 12px; color: #94a3b8;" id="orderModalProdFa">کالکشن جدید</div>
                        </div>
                        <div class="order-product-price" id="orderModalProdPrice">۰ تومان</div>
                    </div>
                    <form id="orderForm">
                        <input type="hidden" id="orderProdId" name="product_id">
                        <input type="hidden" id="orderProdTitle" name="product_title">
                        <input type="hidden" id="orderSelectedColor" name="selected_color">
                        <input type="hidden" id="orderSelectedSize" name="selected_size">

                        <div class="order-form-group" id="orderColorSection">
                            <label>🎨 رنگ انتخابی:</label>
                            <div id="orderColorChips" class="order-chip-group"></div>
                        </div>

                        <div class="order-form-group" id="orderSizeSection">
                            <label>📏 سایز انتخابی:</label>
                            <div id="orderSizeChips" class="order-chip-group"></div>
                        </div>
                        
                        <div class="order-form-group">
                            <label>نام و نام خانوادگی خریدار *</label>
                            <input type="text" id="orderCustName" required placeholder="مثال: علی رضایی">
                        </div>
                        <div class="order-form-group">
                            <label>شماره تماس همراه *</label>
                            <input type="tel" id="orderCustPhone" required placeholder="مثال: 09123456789" style="direction: ltr; text-align: right;">
                        </div>
                        <div class="order-form-group">
                            <label>آدرس و شهر جهت ارسال</label>
                            <textarea id="orderCustAddress" rows="2" placeholder="استان، شهر، آدرس دقیق، کدپستی"></textarea>
                        </div>
                        <button type="submit" class="order-submit-btn" id="orderSubmitBtn">ثبت سفارش و ارسال به فروشگاه</button>
                    </form>
                    <div class="order-result-msg" id="orderResultMsg"></div>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div.firstElementChild);

        const closeBtn = document.getElementById('orderModalCloseBtn');
        if (closeBtn) closeBtn.addEventListener('click', closeOrderModal);

        const backdrop = document.getElementById('orderModalBackdrop');
        if (backdrop) {
            backdrop.addEventListener('click', function(e) {
                if (e.target === this) closeOrderModal();
            });
        }

        const form = document.getElementById('orderForm');
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                const btn = document.getElementById('orderSubmitBtn');
                const msgBox = document.getElementById('orderResultMsg');
                
                if (btn) {
                    btn.disabled = true;
                    btn.innerText = 'در حال ثبت...';
                }
                if (msgBox) msgBox.style.display = 'none';

                const prodTitle = document.getElementById('orderProdTitle').value;
                const chosenColor = document.getElementById('orderSelectedColor').value;
                const chosenSize = document.getElementById('orderSelectedSize').value;

                const payload = {
                    product_id: document.getElementById('orderProdId').value,
                    product_title: prodTitle,
                    selected_color: chosenColor,
                    selected_size: chosenSize,
                    customer_name: document.getElementById('orderCustName').value,
                    customer_phone: document.getElementById('orderCustPhone').value,
                    customer_address: document.getElementById('orderCustAddress').value
                };

                try {
                    const res = await fetch(getBasePath() + 'api/orders.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (msgBox) {
                        msgBox.style.display = 'block';
                        if (data.success) {
                            msgBox.style.background = '#064e3b';
                            msgBox.style.color = '#a7f3d0';
                            let details = '';
                            if (chosenColor) details += ` (رنگ: ${chosenColor})`;
                            if (chosenSize) details += ` (سایز: ${chosenSize})`;
                            msgBox.innerText = `✅ سفارش شما برای «${prodTitle}»${details} با موفقیت ثبت شد!`;
                            document.getElementById('orderForm').reset();
                            setTimeout(closeOrderModal, 3000);
                        } else {
                            msgBox.style.background = '#450a0a';
                            msgBox.style.color = '#fca5a5';
                            msgBox.innerText = '❌ ' + (data.message || 'خطا در ثبت سفارش');
                        }
                    }
                } catch (err) {
                    if (msgBox) {
                        msgBox.style.display = 'block';
                        msgBox.style.background = '#450a0a';
                        msgBox.style.color = '#fca5a5';
                        msgBox.innerText = '❌ ارتباط با سرور برقرار نشد.';
                    }
                } finally {
                    if (btn) {
                        btn.disabled = false;
                        btn.innerText = 'ثبت سفارش و ارسال به فروشگاه';
                    }
                }
            });
        }
    }

    function openOrderModal(product, defaultColor, defaultSize) {
        createOrderModal();
        try {
            document.getElementById('orderProdId').value = product.id || '';
            document.getElementById('orderProdTitle').value = product.title_fa || product.title || '';
            document.getElementById('orderModalProdName').innerText = product.title || '';
            document.getElementById('orderModalProdFa').innerText = product.title_fa || product.color || '';
            document.getElementById('orderModalProdPrice').innerText = product.formatted_price || (product.price ? product.price.toLocaleString() + ' ' + (product.currency || 'تومان') : 'تماس بگیرید');

            // تنظیم رنگ انتخابی
            let activeColor = defaultColor || window.__SELECTED_COLOR__;
            if (!activeColor && product.color) {
                activeColor = product.color.split('/')[0].trim();
            }

            const colorContainer = document.getElementById('orderColorChips');
            colorContainer.innerHTML = '';

            let colorList = [];
            if (product.colourways) {
                let cw = product.colourways;
                if (typeof cw === 'string') {
                    try { cw = JSON.parse(cw); } catch(e) { cw = []; }
                }
                if (Array.isArray(cw) && cw.length > 0) {
                    colorList = cw.map(c => ({
                        label: c.label || c.name,
                        hex: c.hex || c.code || '#1e1e1e'
                    }));
                }
            }
            if (colorList.length === 0 && product.color) {
                const parts = product.color.split(/[\/,]/).map(s => s.trim()).filter(Boolean);
                colorList = parts.map(p => ({ label: p, hex: '#1e1e1e' }));
            }
            if (colorList.length === 0) {
                colorList = [{ label: activeColor || 'پیش‌فرض', hex: '#1e1e1e' }];
            }

            if (!activeColor && colorList.length > 0) {
                activeColor = colorList[0].label;
            }
            document.getElementById('orderSelectedColor').value = activeColor;

            colorList.forEach(col => {
                const chip = document.createElement('div');
                chip.className = 'order-chip' + (col.label === activeColor ? ' active' : '');
                chip.innerHTML = `<span class="order-chip-color-dot" style="background:${col.hex}"></span> <span>${col.label}</span>`;
                chip.addEventListener('click', () => {
                    colorContainer.querySelectorAll('.order-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    document.getElementById('orderSelectedColor').value = col.label;
                    window.__SELECTED_COLOR__ = col.label;
                });
                colorContainer.appendChild(chip);
            });

            // تنظیم سایز انتخابی
            let activeSize = defaultSize || window.__SELECTED_SIZE__;
            let sizeList = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
            if (product.sizes) {
                const customSizes = product.sizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                if (customSizes.length > 0) sizeList = customSizes;
            }

            if (!activeSize || !sizeList.includes(activeSize)) {
                activeSize = sizeList.includes('M') ? 'M' : sizeList[0];
            }
            document.getElementById('orderSelectedSize').value = activeSize;

            const sizeContainer = document.getElementById('orderSizeChips');
            sizeContainer.innerHTML = '';
            sizeList.forEach(sz => {
                const chip = document.createElement('div');
                chip.className = 'order-chip' + (sz === activeSize ? ' active' : '');
                chip.innerText = sz;
                chip.addEventListener('click', () => {
                    sizeContainer.querySelectorAll('.order-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    document.getElementById('orderSelectedSize').value = sz;
                    window.__SELECTED_SIZE__ = sz;
                    
                    // به‌روزرسانی هایلایت تگ آویزان مربوطه
                    const wrap = document.getElementById('focusSizesWrap');
                    if (wrap) {
                        wrap.querySelectorAll('.size-tagwrap').forEach(tw => {
                            tw.classList.toggle('on', tw.dataset.size === sz);
                        });
                    }
                });
                sizeContainer.appendChild(chip);
            });

            const msgBox = document.getElementById('orderResultMsg');
            if (msgBox) msgBox.style.display = 'none';
            
            const backdrop = document.getElementById('orderModalBackdrop');
            if (backdrop) backdrop.style.display = 'flex';
        } catch (e) {
            console.error("openOrderModal error:", e);
        }
    }

    function closeOrderModal() {
        const modal = document.getElementById('orderModalBackdrop');
        if (modal) modal.style.display = 'none';
    }

    // ۴. ایجاد مودال کالکشن کامل محصولات
    function createCatalogModal() {
        if (document.getElementById('catalogModalBackdrop')) return;

        const modalHtml = `
            <div class="catalog-modal-backdrop" id="catalogModalBackdrop">
                <div class="catalog-modal">
                    <div class="modal-header-bar">
                        <h3>📦 کالکشن کامل لباس‌های فروشگاه</h3>
                        <button class="modal-close-icon" id="catalogModalCloseBtn">&times;</button>
                    </div>
                    <div class="catalog-grid" id="catalogGrid">
                        <!-- کارت‌های محصولات به صورت پویا اضافه می‌شوند -->
                    </div>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div.firstElementChild);

        const closeBtn = document.getElementById('catalogModalCloseBtn');
        if (closeBtn) closeBtn.addEventListener('click', closeCatalogModal);

        const backdrop = document.getElementById('catalogModalBackdrop');
        if (backdrop) {
            backdrop.addEventListener('click', function(e) {
                if (e.target === this) closeCatalogModal();
            });
        }
    }

    function openCatalogModal() {
        createCatalogModal();
        renderCatalogCards();
        const backdrop = document.getElementById('catalogModalBackdrop');
        if (backdrop) backdrop.style.display = 'flex';
    }

    function closeCatalogModal() {
        const backdrop = document.getElementById('catalogModalBackdrop');
        if (backdrop) backdrop.style.display = 'none';
    }

    function renderCatalogCards() {
        const grid = document.getElementById('catalogGrid');
        if (!grid) return;

        const base = getBasePath();
        grid.innerHTML = '';

        if (!storeData.products || storeData.products.length === 0) {
            grid.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;grid-column:1/-1;">محصولی یافت نشد.</div>';
            return;
        }

        storeData.products.forEach(p => {
            let imgSrc = '';
            if (p.front_image) {
                let clean = p.front_image.replace(/^\/+/, '');
                if (clean.includes('uploads/')) {
                    clean = clean.substring(clean.indexOf('uploads/'));
                }
                imgSrc = base + clean;
            } else {
                imgSrc = base + '_next/image?url=%2Fproducts%2F' + encodeURIComponent(p.slug) + '-front.webp&w=384&q=75';
            }

            const sizesLabel = p.sizes ? p.sizes.split(',').join(' • ') : 'S • M • L • XL • XXL';

            const card = document.createElement('div');
            card.className = 'catalog-card';
            card.innerHTML = `
                <div class="catalog-img-wrap">
                    <img src="${imgSrc}" onerror="this.src='${base}_next/image?url=%2Fproducts%2F${encodeURIComponent(p.slug)}-side.webp&w=384&q=75'">
                </div>
                <div class="catalog-card-title">${p.title}</div>
                <div class="catalog-card-fa">${p.title_fa || p.color || ''}</div>
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
                    ${p.is_available ? '<span style="color:#4ade80;">● موجود در انبار</span>' : '<span style="color:#f87171;">● ناموجود</span>'}
                    ${p.color ? ' | رنگ: ' + p.color : ''}
                    <div style="margin-top: 4px; color: #64748b;">سایزها: ${sizesLabel}</div>
                </div>
                <div class="catalog-card-footer">
                    <div class="catalog-card-price">${p.formatted_price || (p.price.toLocaleString() + ' ' + (p.currency || 'تومان'))}</div>
                    <button class="catalog-card-btn" data-slug="${p.slug}">🛍️ سفارش</button>
                </div>
            `;

            card.querySelector('.catalog-card-btn').addEventListener('click', () => {
                closeCatalogModal();
                if (p.buy_url && p.buy_url.trim() !== '') {
                    window.open(p.buy_url, '_blank');
                } else {
                    openOrderModal(p);
                }
            });

            grid.appendChild(card);
        });
    }

    function updateCatalogUI() {
        const btn = document.getElementById('catalogFloatingBtn');
        if (btn && storeData.products) {
            btn.innerHTML = `📦 <span>مشاهده همه محصولات (${storeData.products.length})</span>`;
        }
    }

    // ۵. افزودن دکمه‌های شناور (مشاهده محصولات + پنل مدیریت)
    function addFloatingButtons() {
        if (document.getElementById('floatingActionsBar')) return;
        try {
            const bar = document.createElement('div');
            bar.id = 'floatingActionsBar';
            bar.className = 'floating-actions-bar';

            const catalogBtn = document.createElement('button');
            catalogBtn.id = 'catalogFloatingBtn';
            catalogBtn.className = 'floating-btn floating-btn-catalog';
            catalogBtn.innerHTML = '📦 <span>مشاهده همه محصولات</span>';
            catalogBtn.addEventListener('click', openCatalogModal);

            const adminLink = document.createElement('a');
            adminLink.id = 'adminFloatingBtn';
            adminLink.className = 'floating-btn';
            adminLink.href = getBasePath() + 'admin/';
            adminLink.target = '_blank';
            adminLink.innerHTML = '⚙️ <span>پنل مدیریت</span>';

            bar.appendChild(catalogBtn);
            bar.appendChild(adminLink);
            document.body.appendChild(bar);
        } catch (e) {}
    }

    // ۶. تزریق برچسب‌های آویزان سایز به اسلاید فوکوس
    function injectSizeHangingTags(slide, product) {
        if (!slide) return;

        const currentSlug = product ? (product.slug || product.id) : 'default';
        const existingWrap = slide.querySelector('#focusSizesWrap');
        if (existingWrap && existingWrap.dataset.prodSlug === String(currentSlug)) {
            return;
        }
        if (existingWrap) {
            existingWrap.remove();
        }

        let sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        if (product && product.sizes) {
            const parsed = product.sizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
            if (parsed.length > 0) sizes = parsed;
        }

        if (!window.__SELECTED_SIZE__ || !sizes.includes(window.__SELECTED_SIZE__)) {
            window.__SELECTED_SIZE__ = sizes.includes('M') ? 'M' : sizes[0];
        }

        const wrap = document.createElement('div');
        wrap.id = 'focusSizesWrap';
        wrap.className = 'focus-sizes-wrap';
        wrap.dataset.prodSlug = String(currentSlug);

        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags size-tags';

        sizes.forEach((sz, idx) => {
            const isSelected = sz === window.__SELECTED_SIZE__;
            const tagWrap = document.createElement('div');
            tagWrap.className = 'size-tagwrap' + (isSelected ? ' on' : '');
            tagWrap.dataset.size = sz;
            tagWrap.style.animationDelay = `${-(0.85 * idx)}s`;

            const stringDiv = document.createElement('div');
            stringDiv.className = 'string';
            stringDiv.style.height = `calc(var(--tag-string, 34px) + ${idx} * var(--tag-step, 18px))`;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'tag-hit size-tag-hit';
            btn.setAttribute('aria-label', `Size: ${sz}`);
            btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag size-tag';

            const faceSpan = document.createElement('span');
            faceSpan.className = 'tag-face size-tag-face';
            faceSpan.textContent = sz;

            tagSpan.appendChild(faceSpan);
            btn.appendChild(tagSpan);
            tagWrap.appendChild(stringDiv);
            tagWrap.appendChild(btn);

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.__SELECTED_SIZE__ = sz;
                wrap.querySelectorAll('.size-tagwrap').forEach(tw => {
                    const on = tw.dataset.size === sz;
                    tw.classList.toggle('on', on);
                    const b = tw.querySelector('.size-tag-hit');
                    if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
                });

                // به‌روزرسانی فیلد فرم در صورت باز بودن
                const hiddenInput = document.getElementById('orderSelectedSize');
                if (hiddenInput) hiddenInput.value = sz;
                const sizeChips = document.querySelectorAll('#orderSizeChips .order-chip');
                sizeChips.forEach(c => c.classList.toggle('active', c.innerText.trim() === sz));
            });

            tagsContainer.appendChild(tagWrap);
        });

        wrap.appendChild(tagsContainer);
        slide.appendChild(wrap);
    }

    // همگام‌سازی رنگ انتخابی از تگ‌های رنگ روی رگال
    function syncActiveColorFromTags(product) {
        const activeColorEl = document.querySelector('.focus-tags-wrap .tagwrap.on .tag-face');
        if (activeColorEl) {
            window.__SELECTED_COLOR__ = activeColorEl.textContent.trim();
        } else if (product && product.color) {
            window.__SELECTED_COLOR__ = product.color.split('/')[0].trim();
        }
    }

    // ۷. اتصال داده‌های دیتابیس به پنجره Focus جزئیات محصول در رگال
    function observeProductFocus() {
        try {
            const observer = new MutationObserver(function() {
                const infoEl = document.querySelector('.focus-info .info');
                const focusSlide = document.querySelector('.focus-slide');

                if (infoEl) {
                    const nameEl = infoEl.querySelector('.info-name');
                    if (nameEl) {
                        const prodName = nameEl.textContent.trim();
                        const matched = findProduct(prodName);
                        
                        // تزریق برچسب‌های آویزان سایز در سمت چپ
                        if (focusSlide) {
                            injectSizeHangingTags(focusSlide, matched);
                        }

                        // ردیابی کلیک روی تگ‌های رنگ سمت راست
                        const tagsWrap = document.querySelector('.focus-tags-wrap');
                        if (tagsWrap && !tagsWrap.dataset.listenerAttached) {
                            tagsWrap.dataset.listenerAttached = 'true';
                            tagsWrap.addEventListener('click', function() {
                                setTimeout(() => syncActiveColorFromTags(matched), 100);
                            });
                        }
                        syncActiveColorFromTags(matched);

                        if (matched && !infoEl.dataset.metaInjected) {
                            infoEl.dataset.metaInjected = 'true';
                            
                            let metaEl = infoEl.querySelector('.dynamic-product-meta');
                            if (!metaEl) {
                                metaEl = document.createElement('div');
                                metaEl.className = 'dynamic-product-meta';
                                
                                const priceSpan = document.createElement('span');
                                priceSpan.className = 'dynamic-price';
                                priceSpan.innerText = matched.formatted_price || (matched.price ? matched.price.toLocaleString() + ' ' + (matched.currency || 'تومان') : '');
                                
                                const badge = document.createElement('span');
                                badge.className = 'dynamic-badge ' + (matched.is_available ? 'badge-instock' : 'badge-outstock');
                                badge.innerText = matched.is_available ? 'موجود در انبار' : 'اتمام موجودی';

                                metaEl.appendChild(priceSpan);
                                metaEl.appendChild(badge);

                                if (matched.title_fa) {
                                    const faTitle = document.createElement('div');
                                    faTitle.style.cssText = 'width: 100%; font-size: 13px; color: #cbd5e1; margin-top: 2px;';
                                    faTitle.innerText = matched.title_fa;
                                    metaEl.appendChild(faTitle);
                                }

                                nameEl.insertAdjacentElement('afterend', metaEl);
                            }

                            const ctaBtn = infoEl.querySelector('.info-cta');
                            if (ctaBtn) {
                                ctaBtn.textContent = matched.is_available ? 'خرید / ثبت سفارش' : 'ناموجود';
                                ctaBtn.removeAttribute('target');
                                
                                const newCta = ctaBtn.cloneNode(true);
                                newCta.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!matched.is_available) {
                                        alert('این محصول در حال حاضر ناموجود است.');
                                        return;
                                    }
                                    if (matched.buy_url && matched.buy_url.trim() !== '') {
                                        window.open(matched.buy_url, '_blank');
                                    } else {
                                        openOrderModal(matched, window.__SELECTED_COLOR__, window.__SELECTED_SIZE__);
                                    }
                                });
                                ctaBtn.parentNode.replaceChild(newCta, ctaBtn);
                            }
                        }
                    }
                } else {
                    const existingInfo = document.querySelector('.info');
                    if (existingInfo) delete existingInfo.dataset.metaInjected;
                    const existingSizes = document.getElementById('focusSizesWrap');
                    if (existingSizes) existingSizes.remove();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        } catch (e) {
            console.error("observeProductFocus error:", e);
        }
    }

    // راه‌اندازی پس از بارگذاری کامل صفحه
    function init() {
        try {
            injectStyles();
            addFloatingButtons();
            if (window.__DB_SETTINGS__) {
                applyLogo(window.__DB_SETTINGS__);
            }
            loadStoreData().then(() => {
                observeProductFocus();
            });
        } catch (e) {
            console.error("Store dynamic init error:", e);
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(init, 300);
    } else {
        window.addEventListener('load', () => {
            setTimeout(init, 300);
        });
    }
})();
