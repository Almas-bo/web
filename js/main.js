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
document.querySelectorAll('.bg-color-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const current = document.body.style.backgroundColor;
        let color;
        do {
            color = bgColors[Math.floor(Math.random() * bgColors.length)];
        } while (bgColors.length > 1 && toRgb(color) === current);
        applyBg(color);
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
            const submitButton = contactForm.querySelector('[type="submit"]');
            const submittedName = f.name.value.trim();
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            window.setTimeout(function () {
                showAlert(box, 'Thanks, ' + submittedName + '! Your message passed validation. This project demo does not connect to a mail server.');
                contactForm.reset();
                clearState(contactForm);
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }, 450);
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
            showAlert(box, 'Thanks, ' + f.name.value.trim() + '! This signup demo does not create an account yet.');
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

document.querySelectorAll('.theme-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
        const isNight = document.body.classList.toggle('theme-night');
        button.setAttribute('aria-pressed', String(isNight));
        button.textContent = isNight ? '☀️ Day mode' : '🌙 Night mode';
    });
});

document.querySelectorAll('.navbar-nav').forEach(function (menu) {
    menu.addEventListener('keydown', function (event) {
        const menuLinks = Array.from(menu.querySelectorAll('a[href]'));
        const currentIndex = menuLinks.indexOf(document.activeElement);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex;
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = (currentIndex + 1) % menuLinks.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = (currentIndex - 1 + menuLinks.length) % menuLinks.length;
                break;
            case 'Home':
                nextIndex = 0;
                break;
            case 'End':
                nextIndex = menuLinks.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        menuLinks[nextIndex].focus();
    });
});

const productFilter = document.getElementById('productFilter');
if (productFilter) {
    const products = Array.from(document.querySelectorAll('[data-product-card]'), function (card) {
        return {
            element: card,
            isNew: card.dataset.new === 'true',
            isSale: card.dataset.sale === 'true',
            price: Number(card.dataset.price)
        };
    });
    const count = document.getElementById('productCount');

    function filterProducts(filter) {
        return products.filter(function (product) {
            switch (filter) {
                case 'new':
                    return product.isNew;
                case 'sale':
                    return product.isSale;
                case 'under-140':
                    return product.price < 140;
                case 'all':
                default:
                    return true;
            }
        });
    }

    function renderProducts() {
        const visibleProducts = filterProducts(productFilter.value);
        products.forEach(function (product) {
            product.element.hidden = !visibleProducts.includes(product);
        });
        count.textContent = visibleProducts.length + ' product' + (visibleProducts.length === 1 ? '' : 's');
    }

    productFilter.addEventListener('change', renderProducts);
    renderProducts();
}

document.querySelectorAll('.rating-star').forEach(function (star) {
    star.addEventListener('click', function () {
        const rating = Number(star.dataset.rating);
        document.querySelectorAll('.rating-star').forEach(function (item) {
            const isSelected = Number(item.dataset.rating) <= rating;
            item.classList.toggle('selected', isSelected);
            item.setAttribute('aria-pressed', String(isSelected));
        });
        const message = document.getElementById('ratingMessage');
        message.textContent = 'Thank you for rating KicksLab ' + rating + ' out of 5 stars!';
        playNotificationSound();
    });
});

const notice = document.createElement('div');
notice.className = 'shop-notice';
notice.setAttribute('role', 'status');
notice.setAttribute('aria-live', 'polite');
document.body.appendChild(notice);

let noticeTimeout;
document.querySelectorAll('[data-cart-action]').forEach(function (button) {
    button.addEventListener('click', function () {
        const card = button.closest('.card');
        const productName = card.querySelector('.card-title').textContent.trim();
        notice.textContent = productName + ' added to your demo cart.';
        notice.classList.add('show');
        card.classList.remove('cart-bump');
        void card.offsetWidth;
        card.classList.add('cart-bump');
        playNotificationSound();
        window.clearTimeout(noticeTimeout);
        noticeTimeout = window.setTimeout(function () {
            notice.classList.remove('show');
        }, 2400);
    });
});

let audioContext;
let activeSound;
function playNotificationSound() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;

    if (!audioContext) audioContext = new AudioContextConstructor();
    if (activeSound) activeSound.stop();

    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 660;
    volume.gain.setValueAtTime(0.08, audioContext.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    activeSound = oscillator;
    oscillator.onended = function () {
        if (activeSound === oscillator) activeSound = null;
    };
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
}
