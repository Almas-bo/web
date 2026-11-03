# KicksLab 👟

KicksLab is a modern multi-page sneaker store built as a university web development project. The website provides a polished storefront experience with separate sections for men, women, and kids, along with a team page and a contact form.

## Team
- Yersultan Sansyzbay
- Almas Bekenov
- Dinmukhamed Bolat

## Project Overview
This project focuses on creating a responsive, visually clean, and user-friendly storefront using HTML, CSS, and Bootstrap. The design emphasizes a sleek orange-and-dark theme, promotional product cards, and easy navigation across multiple pages.

## Pages
- `index.html` — home page with featured products and promotional content
- `men.html` — men's sneaker collection
- `women.html` — women's sneaker collection
- `kids.html` — kids' sneaker collection
- `team.html` — team profile section
- `contact.html` — contact form and inquiry page

## Technologies Used
- HTML5
- CSS3
- Bootstrap 5
- Flexbox and responsive layout techniques
- JavaScript DOM APIs, events, arrays, objects, and higher-order functions

## Assignment 5: Advanced JavaScript and DOM Manipulation

The shared `js/main.js` file powers the interactive features on all pages:

- The home-page catalog filter uses a product data array, `filter()`, and a `switch` statement to show all products, new arrivals, sale items, or products below $140.
- The home page has an accessible five-star rating control that updates its selected state and confirmation message.
- The Day/Night button toggles a site-wide theme using a CSS class; the color button also changes the page background dynamically.
- Arrow keys move focus through navigation links. Home and End move focus to the first and last link.
- Add to Cart/Buy Now buttons show a live cart notification, animate the product card, and play a short Web Audio notification sound without overlapping sounds.
- Contact and subscription forms validate input and display feedback without reloading. Their responses are front-end demonstrations only; they do not send email or create accounts on a server.
- FAQ answers expand and collapse, and the footer clock updates every second.

HTML, styles, and behavior are kept in separate files. The JavaScript includes arrays, objects, loops, callbacks, `map()`, `filter()`, and `forEach()`.

### Assignment report checklist

`ASSIGNMENT-5-REPORT.pdf` contains the team names, group SE-2506, implementation steps, code and webpage screenshots, reflection, and the project's published URL. Before submission, commit and push the updated files, redeploy the site, and verify that the published version includes these changes.

## Responsive Design
The layout adapts for:
- Desktop
- Tablet
- Mobile

Bootstrap grid classes and custom CSS media queries ensure clear spacing, readable typography, and proper component stacking on smaller screens.

## Live Website
https://almas-bo.github.io/web/

## Local Preview
To run the project locally:

```bash
cd "c:\web 1 site\web"
py -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Repository
https://github.com/Almas-bo/web
