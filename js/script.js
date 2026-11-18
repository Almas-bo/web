/* ==========================================================================
   KicksLab — core script (loaded on every page)
   Contents:
     1. Storage helpers          6. Product card + favourites + cart
     2. Utilities / toast        7. Currency (REST API: open.er-api.com)
     3. Theme (light / dark)     8. Newsletter form
     4. Navigation + auth slot   9. Scroll reveal, footer clock, init
     5. Form validation engine
   Everything is exposed on window.KL so page scripts can reuse it.
   ========================================================================== */
(function () {
    "use strict";

    const KL = (window.KL = {});

    /* ---------- 1. Storage helpers (safe against disabled storage) ---------- */
    KL.store = {
        get(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                return raw === null ? fallback : JSON.parse(raw);
            } catch (e) { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); return true; }
            catch (e) { return false; }
        },
        remove(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }
    };

    /* ---------- 2. Utilities ---------- */
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    KL.$ = $; KL.$$ = $$;

    /** Escape user-provided text before inserting it with innerHTML. */
    KL.esc = (str) => String(str).replace(/[&<>"']/g, (c) => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));

    /** Small non-blocking notification in the bottom-right corner. */
    KL.toast = function (message, type) {
        let wrap = $(".toast-wrap");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.className = "toast-wrap";
            wrap.setAttribute("role", "status");
            wrap.setAttribute("aria-live", "polite");
            document.body.appendChild(wrap);
        }
        const el = document.createElement("div");
        el.className = "toast" + (type === "error" ? " error" : "");
        el.textContent = message;
        wrap.appendChild(el);
        setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, 2600);
        setTimeout(() => el.remove(), 3000);
    };

    /* ---------- 3. Theme (light / dark) — choice is kept in localStorage ---------- */
    KL.theme = {
        get() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; },
        set(mode) {
            document.documentElement.setAttribute("data-theme", mode);
            KL.store.set("kl_theme", mode);
            $$("[data-theme-toggle]").forEach((btn) => {
                btn.setAttribute("aria-pressed", String(mode === "dark"));
                btn.setAttribute("aria-label", mode === "dark" ? "Switch to light mode" : "Switch to dark mode");
            });
        },
        toggle() { this.set(this.get() === "dark" ? "light" : "dark"); }
    };

    function initTheme() {
        KL.theme.set(KL.theme.get());          // sync the switch with the mode applied in <head>
        $$("[data-theme-toggle]").forEach((btn) => btn.addEventListener("click", () => KL.theme.toggle()));
    }

    /* ---------- 4. Navigation + authentication state ---------- */
    KL.auth = {
        users() { return KL.store.get("kl_users", []); },
        currentEmail() { return KL.store.get("kl_session", null); },
        current() {
            const email = this.currentEmail();
            return this.users().find((u) => u.email === email) || null;
        },
        findByEmail(email) { return this.users().find((u) => u.email === String(email).trim().toLowerCase()); },
        signup({ name, email, phone, password }) {
            email = email.trim().toLowerCase();
            if (this.findByEmail(email)) return { ok: false, error: "An account with this email already exists." };
            const users = this.users();
            users.push({ name: name.trim(), email, phone: phone.trim(), password, createdAt: new Date().toISOString() });
            if (!KL.store.set("kl_users", users)) return { ok: false, error: "Could not save data. Is browser storage disabled?" };
            return { ok: true };
        },
        login(email, password) {
            const user = this.findByEmail(email);
            if (!user) return { ok: false, error: "No account found with this email.", field: "email" };
            if (user.password !== password) return { ok: false, error: "Incorrect password.", field: "password" };
            KL.store.set("kl_session", user.email);
            return { ok: true, user };
        },
        logout() { KL.store.remove("kl_session"); },
        update(email, patch) {
            const users = this.users().map((u) => (u.email === email ? Object.assign({}, u, patch) : u));
            KL.store.set("kl_users", users);
        },
        remove(email) {
            KL.store.set("kl_users", this.users().filter((u) => u.email !== email));
            this.logout();
        }
    };

    function initNav() {
        // Mobile menu
        const toggle = $("#menuToggle"), links = $("#navLinks");
        if (toggle && links) {
            toggle.addEventListener("click", () => {
                const open = links.classList.toggle("open");
                toggle.setAttribute("aria-expanded", String(open));
            });
            // close the menu after choosing a link
            $$("a", links).forEach((a) => a.addEventListener("click", () => {
                links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
            }));
        }

        // Highlight the current page
        const here = location.pathname.split("/").pop() || "index.html";
        $$("#navLinks a").forEach((a) => {
            if (a.getAttribute("href") === here) { a.classList.add("active"); a.setAttribute("aria-current", "page"); }
        });

        // Login / profile area
        const slot = $("#authSlot");
        if (slot) {
            const user = KL.auth.current();
            if (user) {
                slot.innerHTML = `<a class="user-chip" href="profile.html" title="Open profile">
                    <span class="avatar">${KL.esc(user.name.charAt(0).toUpperCase())}</span>
                    <span class="name">${KL.esc(user.name.split(" ")[0])}</span></a>`;
            } else {
                slot.innerHTML = `<a class="btn btn-sm btn-ghost-light" href="login.html">Log in</a>
                                  <a class="btn btn-sm" href="signup.html">Sign up</a>`;
            }
        }
    }

    /* ---------- 5. Form validation engine ----------
       We deliberately do NOT use HTML validation attributes. Every <form> has
       `novalidate`; rules below produce messages shown under each field.        */
    KL.rules = {
        required: (label) => (v) => (v.trim() ? "" : `${label} is required.`),
        name: (v) => {
            if (!v.trim()) return "";
            return /^[\p{L}][\p{L}\s'.-]{1,49}$/u.test(v.trim()) ? "" : "Use 2–50 letters only (no digits or symbols).";
        },
        email: (v) => {
            if (!v.trim()) return "";
            // local part @ domain . tld (2+ letters), no spaces
            return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v.trim())
                ? "" : "Enter a valid email, e.g. name@example.com.";
        },
        phone: (v) => {
            if (!v.trim()) return "";
            const digits = v.replace(/\D/g, "");
            const okChars = /^\+?[\d\s\-()]+$/.test(v.trim());
            return okChars && digits.length >= 10 && digits.length <= 15
                ? "" : "Enter a phone number with 10–15 digits, e.g. +7 701 123 45 67.";
        },
        password: (v) => {
            if (!v) return "";
            const problems = [];
            if (v.length < 8) problems.push("at least 8 characters");
            if (!/[a-z]/.test(v)) problems.push("a lowercase letter");
            if (!/[A-Z]/.test(v)) problems.push("an uppercase letter");
            if (!/\d/.test(v)) problems.push("a digit");
            if (!/[^A-Za-z0-9]/.test(v)) problems.push("a special character");
            return problems.length ? "Password needs " + problems.join(", ") + "." : "";
        },
        minLength: (label, n) => (v) => (!v.trim() || v.trim().length >= n ? "" : `${label} must be at least ${n} characters.`),
        match: (otherName, message) => (v, form) => (v === form.elements[otherName].value ? "" : message)
    };

    /** Password strength 0–4 for the meter. */
    KL.passwordStrength = (v) => [/.{8,}/, /[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(v)).length;

    function fieldError(input) {
        return input.closest(".field") && $(".field-error", input.closest(".field"));
    }

    function showFieldState(input, message) {
        const err = fieldError(input);
        input.classList.toggle("invalid", !!message);
        input.classList.toggle("valid", !message && input.value !== "");
        input.setAttribute("aria-invalid", message ? "true" : "false");
        if (err) {
            err.textContent = message;
            err.classList.toggle("show", !!message);
            if (!err.id) err.id = "err-" + (input.id || input.name);
            input.setAttribute("aria-describedby", err.id);
        }
    }

    function checkField(form, schema, name) {
        const input = form.elements[name];
        if (!input) return "";
        for (const rule of schema[name]) {
            const msg = rule(input.value, form);
            if (msg) { showFieldState(input, msg); return msg; }
        }
        showFieldState(input, "");
        return "";
    }

    /**
     * Attach validation to a form.
     * @param form     <form> element (must have novalidate)
     * @param schema   { fieldName: [ruleFn, ...] } — rules run in order, first message wins
     * @param onValid  called with the form's values when every field passes
     */
    KL.validateForm = function (form, schema, onValid) {
        if (!form) return;
        form.setAttribute("novalidate", "");
        Object.keys(schema).forEach((name) => {
            const input = form.elements[name];
            if (!input) return;
            input.addEventListener("blur", () => { if (input.value !== "") checkField(form, schema, name); });
            input.addEventListener("input", () => { if (input.classList.contains("invalid")) checkField(form, schema, name); });
        });
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            let firstBad = null;
            Object.keys(schema).forEach((name) => {
                if (checkField(form, schema, name) && !firstBad) firstBad = form.elements[name];
            });
            if (firstBad) { firstBad.focus(); return; }
            const values = {};
            Object.keys(schema).forEach((name) => { values[name] = form.elements[name].value; });
            onValid(values, form);
        });
    };

    /** Show a success / error banner inside a form (element .form-alert). */
    KL.formAlert = function (form, message, type) {
        const box = $(".form-alert", form);
        if (!box) return;
        box.textContent = message;
        box.className = "form-alert show " + (type || "success");
    };

    /** Reveal / hide password buttons: <button data-pass-toggle="inputId"> */
    function initPasswordToggles() {
        $$("[data-pass-toggle]").forEach((btn) => btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.passToggle);
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            btn.textContent = show ? "Hide" : "Show";
            btn.setAttribute("aria-pressed", String(show));
        }));
    }

    /* ---------- 6. Product card, favourites and cart ---------- */
    KL.favs = {
        all() { return KL.store.get("kl_favs", []); },
        has(id) { return this.all().includes(id); },
        toggle(id) {
            const list = this.all();
            const i = list.indexOf(id);
            if (i >= 0) list.splice(i, 1); else list.push(id);
            KL.store.set("kl_favs", list);
            return i < 0;
        }
    };

    KL.cart = {
        items() { return KL.store.get("kl_cart", []); },
        count() { return this.items().reduce((n, i) => n + i.qty, 0); },
        save(items) { KL.store.set("kl_cart", items); updateCartUI(); },
        add(id) {
            const items = this.items();
            const row = items.find((i) => i.id === id);
            if (row) row.qty += 1; else items.push({ id, qty: 1 });
            this.save(items);
        },
        change(id, delta) {
            let items = this.items();
            const row = items.find((i) => i.id === id);
            if (!row) return;
            row.qty += delta;
            items = items.filter((i) => i.qty > 0);
            this.save(items);
        },
        clear() { this.save([]); },
        total() {
            return this.items().reduce((sum, i) => {
                const p = window.PRODUCTS.find((x) => x.id === i.id);
                return sum + (p ? p.price * i.qty : 0);
            }, 0);
        }
    };

    const STAR = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

    /** Build the HTML of one product card (used by home, shop and weather pages). */
    KL.productCard = function (p, delay) {
        const faved = KL.favs.has(p.id);
        return `<article class="product" style="animation-delay:${(delay || 0) * 50}ms" data-id="${p.id}">
            <div class="product-img${p.darkBg ? " dark-bg" : ""}">
                <img src="${p.img}" alt="${KL.esc(p.brand + " " + p.name)} sneakers" loading="lazy" width="400" height="400">
                <span class="product-tag">${KL.esc(p.type)}</span>
                <button type="button" class="fav-btn" data-fav="${p.id}" aria-pressed="${faved}"
                        aria-label="${faved ? "Remove from favourites" : "Add to favourites"}">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
            </div>
            <div class="product-body">
                <span class="product-brand">${KL.esc(p.brand)}</span>
                <h3>${KL.esc(p.name)}</h3>
                <div class="rating" aria-label="Rated ${p.rating} out of 5">${STAR(p.rating)}<small>${p.rating} (${p.reviews})</small></div>
                <p>${KL.esc(p.desc)}</p>
                <div class="product-foot">
                    <span class="price" data-price="${p.price}">${KL.money(p.price)}</span>
                    <button type="button" class="btn btn-sm" data-add="${p.id}">Add to cart</button>
                </div>
            </div>
        </article>`;
    };

    /** Global click handling for favourite + add-to-cart buttons (works for dynamic cards). */
    function initProductActions() {
        document.addEventListener("click", (e) => {
            const favBtn = e.target.closest("[data-fav]");
            if (favBtn) {
                const id = Number(favBtn.dataset.fav);
                const now = KL.favs.toggle(id);
                favBtn.setAttribute("aria-pressed", String(now));
                favBtn.setAttribute("aria-label", now ? "Remove from favourites" : "Add to favourites");
                KL.toast(now ? "Added to favourites ♥" : "Removed from favourites");
                document.dispatchEvent(new CustomEvent("kl:favs-changed"));
                return;
            }
            const addBtn = e.target.closest("[data-add]");
            if (addBtn) {
                const p = window.PRODUCTS.find((x) => x.id === Number(addBtn.dataset.add));
                KL.cart.add(p.id);
                KL.toast(`${p.name} added to cart`);
            }
        });
    }

    /* Cart drawer */
    function updateCartUI() {
        const count = KL.cart.count();
        $$("[data-cart-count]").forEach((b) => { b.textContent = count; b.hidden = count === 0; });
        renderCart();
    }

    function renderCart() {
        const list = $("#cartList");
        if (!list) return;
        const items = KL.cart.items();
        if (!items.length) {
            list.innerHTML = `<li class="empty-state">Your cart is empty.<br>Find a pair you love in the <a href="shop.html">shop</a>.</li>`;
        } else {
            list.innerHTML = items.map((i) => {
                const p = window.PRODUCTS.find((x) => x.id === i.id);
                return `<li class="cart-item">
                    <img src="${p.img}" alt="">
                    <div><h4>${KL.esc(p.name)}</h4><small>${KL.esc(p.brand)} · ${KL.money(p.price)}</small>
                        <div class="qty">
                            <button type="button" data-qty="-1" data-id="${p.id}" aria-label="Decrease quantity">−</button>
                            <span aria-live="polite">${i.qty}</span>
                            <button type="button" data-qty="1" data-id="${p.id}" aria-label="Increase quantity">+</button>
                        </div></div>
                    <strong>${KL.money(p.price * i.qty)}</strong>
                </li>`;
            }).join("");
        }
        const total = $("#cartTotal");
        if (total) total.textContent = KL.money(KL.cart.total());
        const checkout = $("#checkoutBtn");
        if (checkout) checkout.disabled = !items.length;
    }

    function initCart() {
        const dialog = $("#cartDialog");
        if (!dialog) return;
        $$("[data-cart-open]").forEach((b) => b.addEventListener("click", () => { renderCart(); dialog.showModal(); }));
        $("#cartClose").addEventListener("click", () => dialog.close());
        dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); }); // click on backdrop
        $("#cartList").addEventListener("click", (e) => {
            const b = e.target.closest("[data-qty]");
            if (b) KL.cart.change(Number(b.dataset.id), Number(b.dataset.qty));
        });
        $("#cartClear").addEventListener("click", () => { KL.cart.clear(); KL.toast("Cart cleared"); });
        $("#checkoutBtn").addEventListener("click", () => {
            const user = KL.auth.current();
            if (!user) {
                KL.toast("Please log in to check out.", "error");
                setTimeout(() => { location.href = "login.html?next=shop.html"; }, 900);
                return;
            }
            const orders = KL.store.get("kl_orders", []);
            orders.push({ email: user.email, items: KL.cart.items(), totalUSD: KL.cart.total(), date: new Date().toISOString() });
            KL.store.set("kl_orders", orders);
            KL.cart.clear();
            dialog.close();
            KL.toast("Order placed! Thank you 🎉 (demo checkout)");
        });
        updateCartUI();
    }

    /* ---------- 7. Currency — live rates from a public REST API ---------- */
    const CURRENCIES = { USD: { symbol: "$", locale: "en-US" }, KZT: { symbol: "₸", locale: "ru-KZ" }, EUR: { symbol: "€", locale: "de-DE" } };
    const FALLBACK_RATES = { USD: 1, KZT: 480, EUR: 0.92 };   // used when the API is unreachable

    KL.currency = {
        list: Object.keys(CURRENCIES),
        get() { return KL.store.get("kl_currency", "USD"); },
        set(code) { KL.store.set("kl_currency", code); document.dispatchEvent(new CustomEvent("kl:currency-changed")); },
        rates() { const c = KL.store.get("kl_rates", null); return c && c.rates ? c.rates : FALLBACK_RATES; },
        updatedAt() { const c = KL.store.get("kl_rates", null); return c ? c.time : null; }
    };

    KL.money = function (usd) {
        const code = KL.currency.get();
        const value = usd * (KL.currency.rates()[code] || 1);
        const cfg = CURRENCIES[code] || CURRENCIES.USD;
        return cfg.symbol + Math.round(value).toLocaleString(cfg.locale);
    };

    /** Fetch exchange rates (cached for 12 h). Resolves with { live: boolean }. */
    KL.loadRates = async function () {
        const cached = KL.store.get("kl_rates", null);
        if (cached && Date.now() - cached.ts < 12 * 3600 * 1000) return { live: true, cached: true };
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 8000);
            const res = await fetch("https://open.er-api.com/v6/latest/USD", { signal: ctrl.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();
            if (data.result !== "success") throw new Error("API error");
            KL.store.set("kl_rates", {
                ts: Date.now(), time: data.time_last_update_utc,
                rates: { USD: 1, KZT: data.rates.KZT, EUR: data.rates.EUR }
            });
            return { live: true };
        } catch (err) {
            return { live: false, error: err.message };
        }
    };

    function refreshPrices() {
        $$("[data-price]").forEach((el) => { el.textContent = KL.money(Number(el.dataset.price)); });
        renderCart();
    }

    /* ---------- 8. Newsletter form in the footer ---------- */
    function initNewsletter() {
        const form = $("#newsletterForm");
        if (!form) return;
        KL.validateForm(form, {
            email: [KL.rules.required("Email"), KL.rules.email]
        }, (values) => {
            const list = KL.store.get("kl_subscribers", []);
            const email = values.email.trim().toLowerCase();
            if (list.includes(email)) { KL.formAlert(form, "You are already subscribed.", "success"); return; }
            list.push(email);
            KL.store.set("kl_subscribers", list);
            form.reset();
            $$(".input", form).forEach((i) => i.classList.remove("valid"));
            KL.formAlert(form, "Thanks! You're on the list.", "success");
        });
    }

    /* ---------- 9. Scroll reveal, footer clock, init ---------- */
    function initReveal() {
        const items = $$(".reveal");
        if (!("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("in")); return; }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
        }, { threshold: 0.12 });
        items.forEach((i) => io.observe(i));
    }

    function initFooter() {
        const y = $("#year");
        if (y) y.textContent = new Date().getFullYear();
    }

    KL.refreshProducts = refreshPrices;

    document.addEventListener("DOMContentLoaded", () => {
        initTheme();
        initNav();
        initPasswordToggles();
        initProductActions();
        initCart();
        initNewsletter();
        initFooter();
        initReveal();
        document.addEventListener("kl:currency-changed", refreshPrices);
        KL.loadRates().then(refreshPrices);
    });
})();
