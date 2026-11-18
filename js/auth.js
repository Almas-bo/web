/* ==========================================================================
   KicksLab — authentication simulation + contact form + profile page.
   There is no backend, so accounts live in localStorage ("kl_users") and the
   logged-in user's email in "kl_session".
   ========================================================================== */
(function () {
    "use strict";
    const { $, $$ } = KL;
    const page = document.body.dataset.page;

    /* ----- Sign up: stores name, email, phone and password locally ----- */
    function initSignup() {
        const form = $("#signupForm");
        if (KL.auth.current()) { location.replace("profile.html"); return; }

        const meter = $("#strengthBar");
        form.elements.password.addEventListener("input", (e) => {
            const s = KL.passwordStrength(e.target.value);
            meter.style.width = (s / 5) * 100 + "%";
            meter.style.background = s <= 2 ? "var(--danger)" : s <= 4 ? "#e8a200" : "var(--success)";
        });

        KL.validateForm(form, {
            name: [KL.rules.required("Name"), KL.rules.name],
            email: [KL.rules.required("Email"), KL.rules.email],
            phone: [KL.rules.required("Phone number"), KL.rules.phone],
            password: [KL.rules.required("Password"), KL.rules.password],
            confirm: [KL.rules.required("Password confirmation"), KL.rules.match("password", "Passwords do not match.")]
        }, (values) => {
            const res = KL.auth.signup(values);
            if (!res.ok) { KL.formAlert(form, res.error, "error"); return; }
            KL.formAlert(form, "Account created! Redirecting to log in…", "success");
            setTimeout(() => { location.href = "login.html?registered=1"; }, 1100);
        });
    }

    /* ----- Log in: checks credentials, then redirects to the profile page ----- */
    function initLogin() {
        const form = $("#loginForm");
        if (KL.auth.current()) { location.replace("profile.html"); return; }
        if (new URLSearchParams(location.search).get("registered")) {
            KL.formAlert(form, "Account created — you can log in now.", "success");
        }
        KL.validateForm(form, {
            email: [KL.rules.required("Email"), KL.rules.email],
            password: [KL.rules.required("Password")]
        }, (values) => {
            const res = KL.auth.login(values.email, values.password);
            if (!res.ok) {
                const field = form.elements[res.field];
                field.classList.add("invalid");
                const err = $(".field-error", field.closest(".field"));
                err.textContent = res.error; err.classList.add("show");
                field.focus();
                return;
            }
            KL.formAlert(form, "Welcome back, " + res.user.name.split(" ")[0] + "!", "success");
            const next = new URLSearchParams(location.search).get("next");
            const safe = next && /^[a-z]+\.html$/.test(next) ? next : "profile.html";
            setTimeout(() => { location.href = safe; }, 600);
        });
    }

    /* ----- Contact form: saves messages locally ----- */
    function initContact() {
        const form = $("#contactForm");
        const user = KL.auth.current();
        if (user) {                                  // pre-fill for logged-in users
            form.elements.name.value = user.name;
            form.elements.email.value = user.email;
            form.elements.phone.value = user.phone;
        }
        KL.validateForm(form, {
            name: [KL.rules.required("Name"), KL.rules.name],
            email: [KL.rules.required("Email"), KL.rules.email],
            phone: [KL.rules.required("Phone number"), KL.rules.phone],
            topic: [KL.rules.required("Topic")],
            message: [KL.rules.required("Message"), KL.rules.minLength("Message", 10)]
        }, (values) => {
            const inbox = KL.store.get("kl_messages", []);
            inbox.push(Object.assign({ date: new Date().toISOString() }, values));
            KL.store.set("kl_messages", inbox);
            form.elements.message.value = "";
            $$(".input", form).forEach((i) => i.classList.remove("valid"));
            KL.formAlert(form, "Thank you, " + values.name.trim().split(" ")[0] + "! Your message was sent. We reply within 24 hours.", "success");
        });
    }

    /* ----- Profile: shows stored details, lets the user edit / log out ----- */
    function initProfile() {
        const user = KL.auth.current();
        if (!user) { location.replace("login.html?next=profile.html"); return; }

        function fill() {
            const u = KL.auth.current();
            $("#pAvatar").textContent = u.name.charAt(0).toUpperCase();
            $("#pName").textContent = u.name;
            $("#pEmail").textContent = u.email;
            $("#dName").textContent = u.name;
            $("#dEmail").textContent = u.email;
            $("#dPhone").textContent = u.phone;
            $("#dPass").textContent = "•".repeat(Math.min(u.password.length, 12));
            $("#dSince").textContent = new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
            const favs = KL.favs.all().length;
            const orders = KL.store.get("kl_orders", []).filter((o) => o.email === u.email).length;
            $("#sFavs").textContent = favs;
            $("#sCart").textContent = KL.cart.count();
            $("#sOrders").textContent = orders;
            const faved = window.PRODUCTS.filter((p) => KL.favs.has(p.id));
            $("#favList").innerHTML = faved.length
                ? faved.map((p, i) => KL.productCard(p, i)).join("")
                : `<p class="hint">No favourites yet. Tap the heart on any sneaker in the <a href="shop.html">shop</a>.</p>`;
        }
        fill();
        document.addEventListener("kl:favs-changed", fill);

        // Edit name + phone
        const form = $("#editForm");
        form.elements.name.value = user.name;
        form.elements.phone.value = user.phone;
        KL.validateForm(form, {
            name: [KL.rules.required("Name"), KL.rules.name],
            phone: [KL.rules.required("Phone number"), KL.rules.phone]
        }, (values) => {
            KL.auth.update(user.email, { name: values.name.trim(), phone: values.phone.trim() });
            fill();
            KL.formAlert(form, "Profile updated.", "success");
            KL.toast("Profile updated");
        });

        $("#logoutBtn").addEventListener("click", () => {
            KL.auth.logout();
            location.href = "index.html";
        });
        $("#deleteBtn").addEventListener("click", () => {
            if (confirm("Delete your account? This removes your data from this browser.")) {
                KL.auth.remove(user.email);
                location.href = "index.html";
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (page === "signup") initSignup();
        if (page === "login") initLogin();
        if (page === "contact") initContact();
        if (page === "profile") initProfile();
    });
})();
