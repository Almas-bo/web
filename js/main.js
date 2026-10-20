function updateDateTime() {
    const el = document.getElementById('datetime');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    }).replace(' at ', ', ');
}
updateDateTime();
setInterval(updateDateTime, 1000);

const bgColors = ['#f8f9fa', '#fff3cd', '#d1e7dd', '#cfe2ff', '#f8d7da', '#e2d9f3', '#ffe5d0'];
function applyBg(color) {
    document.body.style.transition = 'background-color 0.5s ease';
    document.body.style.backgroundColor = color;
}
try {
    const saved = localStorage.getItem('bgColor');
    if (saved) applyBg(saved);
} catch (e) {  }

document.querySelectorAll('.bg-color-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const current = document.body.style.backgroundColor;
        let color;
        do {
            color = bgColors[Math.floor(Math.random() * bgColors.length)];
        } while (bgColors.length > 1 && toRgb(color) === current);
        applyBg(color);
        try { localStorage.setItem('bgColor', color); } catch (e) {}
    });
});
function toRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return 'rgb(' + (n >> 16) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ')';
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setError(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    let fb = input.parentElement.querySelector('.invalid-feedback');
    if (!fb) {
        fb = document.createElement('div');
        fb.className = 'invalid-feedback';
        input.parentElement.appendChild(fb);
    }
    fb.textContent = message;
}
function setOk(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}
function clearState(form) {
    form.querySelectorAll('.is-invalid, .is-valid').forEach(function (i) {
        i.classList.remove('is-invalid', 'is-valid');
    });
}
function checkRequired(input, label) {
    if (!input.value.trim()) { setError(input, label + ' is required.'); return false; }
    setOk(input); return true;
}
function checkName(input) {
    if (!checkRequired(input, 'Name')) return false;
    if (input.value.trim().length < 2) { setError(input, 'Name must be at least 2 characters.'); return false; }
    return true;
}
function checkEmail(input) {
    if (!checkRequired(input, 'Email')) return false;
    if (!emailRe.test(input.value.trim())) { setError(input, 'Enter a valid email, e.g. name@example.com.'); return false; }
    return true;
}
function checkPassword(input) {
    if (!checkRequired(input, 'Password')) return false;
    const v = input.value;
    if (v.length < 8) { setError(input, 'Password must be at least 8 characters.'); return false; }
    if (!/\d/.test(v) || !/[A-Za-z]/.test(v)) { setError(input, 'Password must contain letters and numbers.'); return false; }
    return true;
}
function checkConfirm(pass, confirm) {
    if (!checkRequired(confirm, 'Password confirmation')) return false;
    if (confirm.value !== pass.value) { setError(confirm, 'Passwords do not match.'); return false; }
    return true;
}
function checkMessage(input) {
    if (!checkRequired(input, 'Message')) return false;
    if (input.value.trim().length < 10) { setError(input, 'Message must be at least 10 characters.'); return false; }
    return true;
}
function showAlert(box, text) {
    box.textContent = text;
    box.classList.remove('d-none');
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const f = contactForm.elements;
    const box = document.getElementById('contactSuccess');
    const validators = {
        name: function () { return checkName(f.name); },
        email: function () { return checkEmail(f.email); },
        message: function () { return checkMessage(f.message); }
    };
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        box.classList.add('d-none');
        const results = Object.keys(validators).map(function (k) { return validators[k](); });
        if (results.every(Boolean)) {
            showAlert(box, 'Thank you, ' + f.name.value.trim() + '! Your message has been sent.');
            contactForm.reset();
            clearState(contactForm);
        }
    });
    Object.keys(validators).forEach(function (k) {
        f[k].addEventListener('input', function () {
            if (f[k].classList.contains('is-invalid')) validators[k]();
        });
    });
}

const popup = document.getElementById('signupPopup');
if (popup) {
    const openers = document.querySelectorAll('.open-popup');
    const closeBtn = popup.querySelector('.popup-close');
    function openPopup() { popup.classList.add('show'); document.body.classList.add('popup-open'); }
    function closePopup() { popup.classList.remove('show'); document.body.classList.remove('popup-open'); }
    openers.forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); openPopup(); }); });
    closeBtn.addEventListener('click', closePopup);
    popup.addEventListener('click', function (e) { if (e.target === popup) closePopup(); }); // click outside
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePopup(); });

    const form = document.getElementById('signupForm');
    const f = form.elements;
    const box = document.getElementById('signupSuccess');
    const validators = {
        name: function () { return checkName(f.name); },
        email: function () { return checkEmail(f.email); },
        password: function () { return checkPassword(f.password); },
        confirm: function () { return checkConfirm(f.password, f.confirm); }
    };
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        box.classList.add('d-none');
        const results = Object.keys(validators).map(function (k) { return validators[k](); });
        if (results.every(Boolean)) {
            showAlert(box, 'Welcome to KicksLab, ' + f.name.value.trim() + '! You are subscribed.');
            form.reset();
            clearState(form);
            setTimeout(closePopup, 2000);
        }
    });
    Object.keys(validators).forEach(function (k) {
        f[k].addEventListener('input', function () {
            if (f[k].classList.contains('is-invalid')) validators[k]();
            if (k === 'password' && f.confirm.value) validators.confirm();
        });
    });
}

document.querySelectorAll('.faq-item').forEach(function (item) {
    const q = item.querySelector('.faq-question');
    const a = item.querySelector('.faq-answer');
    q.addEventListener('click', function () {
        const open = item.classList.toggle('open');
        q.setAttribute('aria-expanded', open);
        a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    });
});
