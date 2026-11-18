# KicksLab 👟

Multi-page responsive sneaker store — Web Development final project (group **SE-2506**).
Team: Yersultan Sansyzbay, Almas Bekenov, Dinmukhamed Bolat.

- **Purpose:** help shoppers find the right sneakers quickly — and match them to the weather.
- **Audience:** students/young professionals, runners and gym-goers, parents buying kids' shoes.

## Pages (8)
`index.html` · `shop.html` · `weather.html` · `about.html` · `contact.html` · `signup.html` · `login.html` · `profile.html`

## Requirement checklist
| Requirement | Where |
|---|---|
| Responsive (Flexbox + CSS Grid, desktop/tablet/mobile) | `css/style.css` |
| Light/Dark toggle, saved in `localStorage` (`kl_theme`) | header switch, `js/script.js` |
| Auth simulation (sign up → log in → profile) | `js/auth.js`, `js/script.js` |
| Form validation (email, password, required, phone) with on-page messages, no HTML validation attributes, `novalidate` | `KL.validateForm` in `js/script.js` |
| Search / filter / sort, results saved in `localStorage` | `shop.html`, `js/shop.js` |
| Animated buttons & UI effects | `css/style.css` |
| Public APIs: Open-Meteo (weather) + open.er-api.com (currency), loading + error states | `js/weather.js`, `js/script.js` |

## Run locally
Open `index.html`, or `python3 -m http.server` and visit http://localhost:8000.

## Hosting
GitHub Pages: Settings → Pages → deploy from branch `main` / root.
