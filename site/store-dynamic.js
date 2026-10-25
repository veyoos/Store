/**
 * store-dynamic.js
 * اتصال فرانت‌اند رگال به پایگاه داده MySQL و سیستم ثبت سفارش
 * ایمن‌سازی شده جهت جلوگیری از هرگونه تداخل با هیدریشن React و Next.js
 */
(function() {
    'use strict';

    let storeData = {
        products: [],
        settings: {}
    };

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
                }
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

    // پیدا کردن اطلاعات محصول در دیتابیس با تطبیق عنوان یا اسلاگ
    function findProduct(nameText) {
        if (!nameText || !storeData.products) return null;
        const cleanName = nameText.trim().toLowerCase();
        return storeData.products.find(p => {
            return (p.title && cleanName.includes(p.title.toLowerCase())) ||
                   (p.title_fa && cleanName.includes(p.title_fa.toLowerCase())) ||
                   (p.slug && cleanName.includes(p.slug.toLowerCase()));
        });
    }

    // ۲. تزریق استایل‌های مورد نیاز
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

            /* دکمه ورود به پنل مدیریت */
            .admin-floating-link {
                position: fixed;
                bottom: 45px;
                right: 16px;
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #cbd5e1;
                font-size: 12px;
                padding: 6px 14px;
                border-radius: 20px;
                text-decoration: none;
                z-index: 9999;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
                font-family: system-ui, sans-serif;
            }
            .admin-floating-link:hover {
                background: #1e293b;
                color: #fff;
                transform: translateY(-2px);
            }

            /* مودال ثبت سفارش */
            .order-modal-backdrop {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(6px);
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
                max-width: 440px;
                padding: 26px 22px;
                color: #f1f5f9;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
                animation: modalFadeIn 0.25s ease-out;
            }
            @keyframes modalFadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .order-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 18px;
                border-bottom: 1px solid #1e2433;
                padding-bottom: 12px;
            }
            .order-modal-title { font-size: 17px; font-weight: 700; color: #fff; }
            .order-modal-close {
                background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; line-height: 1;
            }
            .order-product-card {
                background: #1a1e29;
                border-radius: 10px;
                padding: 12px 14px;
                margin-bottom: 18px;
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
                margin-top: 8px;
            }
            .order-submit-btn:hover { background: #1d4ed8; }
            .order-submit-btn:disabled { background: #475569; cursor: not-allowed; }
            .order-result-msg {
                margin-top: 12px; padding: 10px; border-radius: 8px; font-size: 13px; text-align: center; display: none;
            }
        `;
        document.head.appendChild(style);
    }

    // ۳. ایجاد مودال ثبت سفارش در صفحه
    function createOrderModal() {
        if (document.getElementById('orderModalBackdrop')) return;

        const modalHtml = `
            <div class="order-modal-backdrop" id="orderModalBackdrop">
                <div class="order-modal">
                    <div class="order-modal-header">
                        <span class="order-modal-title">🛍️ ثبت سفارش آنلاین</span>
                        <button class="order-modal-close" id="orderModalCloseBtn">&times;</button>
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

                const payload = {
                    product_id: document.getElementById('orderProdId').value,
                    product_title: document.getElementById('orderProdTitle').value,
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
                            msgBox.innerText = '✅ ' + (data.message || 'سفارش با موفقیت ثبت شد!');
                            document.getElementById('orderForm').reset();
                            setTimeout(closeOrderModal, 2500);
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

    function openOrderModal(product) {
        createOrderModal();
        try {
            document.getElementById('orderProdId').value = product.id || '';
            document.getElementById('orderProdTitle').value = product.title || '';
            document.getElementById('orderModalProdName').innerText = product.title || '';
            document.getElementById('orderModalProdFa').innerText = product.title_fa || product.color || '';
            document.getElementById('orderModalProdPrice').innerText = product.formatted_price || (product.price ? product.price + ' تومان' : 'تماس بگیرید');
            
            const msgBox = document.getElementById('orderResultMsg');
            if (msgBox) msgBox.style.display = 'none';
            
            const backdrop = document.getElementById('orderModalBackdrop');
            if (backdrop) backdrop.style.display = 'flex';
        } catch (e) {}
    }

    function closeOrderModal() {
        const modal = document.getElementById('orderModalBackdrop');
        if (modal) modal.style.display = 'none';
    }

    // ۴. افزودن دکمه شناور مدیریت فروشگاه
    function addAdminButton() {
        if (document.getElementById('adminFloatingBtn')) return;
        try {
            const link = document.createElement('a');
            link.id = 'adminFloatingBtn';
            link.className = 'admin-floating-link';
            link.href = getBasePath() + 'admin/';
            link.target = '_blank';
            link.innerHTML = '⚙️ <span>پنل مدیریت دیتابیس</span>';
            document.body.appendChild(link);
        } catch (e) {}
    }

    // ۵. اتصال داده‌های دیتابیس به پنجره Focus جزئیات محصول
    function observeProductFocus() {
        try {
            const observer = new MutationObserver(function() {
                const infoEl = document.querySelector('.focus-info .info');
                if (infoEl) {
                    const nameEl = infoEl.querySelector('.info-name');
                    if (nameEl && !infoEl.dataset.metaInjected) {
                        const prodName = nameEl.textContent.trim();
                        const matched = findProduct(prodName);
                        
                        if (matched) {
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
                                        openOrderModal(matched);
                                    }
                                });
                                ctaBtn.parentNode.replaceChild(newCta, ctaBtn);
                            }
                        }
                    }
                } else {
                    const existingInfo = document.querySelector('.info');
                    if (existingInfo) delete existingInfo.dataset.metaInjected;
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        } catch (e) {}
    }

    // راه‌اندازی پس از بارگذاری کامل صفحه تا مانع رندر فرانت نشود
    function init() {
        try {
            injectStyles();
            addAdminButton();
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
