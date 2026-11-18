/* ==========================================================================
   KicksLab — product catalogue (static data used by shop, home and weather).
   Prices are stored in USD; script.js converts them to the chosen currency.
   `cats`   : which shop categories the product belongs to
   `tags`   : used by the weather page to match shoes to conditions
   ========================================================================== */
window.PRODUCTS = [
    {
        id: 1, name: "Air Pulse", brand: "Nike", cats: ["men"], price: 149, rating: 4.8, reviews: 214,
        img: "images/air-pulse.jpg", type: "running", tags: ["breathable", "dry"],
        desc: "Responsive foam and a glowing air unit for fast daily runs."
    },
    {
        id: 2, name: "Court Classic", brand: "KicksLab", cats: ["men", "women"], price: 99, rating: 4.5, reviews: 158,
        img: "images/court-classic.jpg", type: "casual", tags: ["casual", "dry"],
        desc: "Clean white leather low-top that goes with everything."
    },
    {
        id: 3, name: "Trainers Pro", brand: "KicksLab", cats: ["men"], price: 119, rating: 4.6, reviews: 97,
        img: "images/trainers-pro.jpg", type: "training", tags: ["wet", "warm", "grip"],
        desc: "Water-resistant knit upper with a chunky grip outsole for gym and city."
    },
    {
        id: 4, name: "Sunrise Runner", brand: "KicksLab", cats: ["men", "women"], price: 129, rating: 4.7, reviews: 176,
        img: "images/sunrise-runner.jpg", type: "running", tags: ["breathable", "dry"],
        desc: "Lightweight mesh runner with a sunrise-gradient midsole."
    },
    {
        id: 5, name: "Coral Trail", brand: "Nike", cats: ["women"], price: 139, rating: 4.9, reviews: 241,
        img: "images/coral-trail.jpg", type: "trail", tags: ["wet", "grip", "warm"],
        desc: "Aggressive tread and a sock-like fit for wet and muddy trails."
    },
    {
        id: 6, name: "Retro Pop Low", brand: "KicksLab", cats: ["women"], price: 89, rating: 4.4, reviews: 83,
        img: "images/retro-pop.jpg", type: "casual", tags: ["casual", "dry"],
        desc: "Colourful retro court shoe with striped panels."
    },
    {
        id: 7, name: "Cloud Step", brand: "KicksLab", cats: ["kids"], price: 59, rating: 4.6, reviews: 120,
        img: "images/kids-white.jpg", type: "everyday", tags: ["casual", "dry", "breathable"],
        desc: "Easy hook-and-loop straps so kids can get ready on their own."
    },
    {
        id: 8, name: "Sky Lace", brand: "KicksLab", cats: ["kids"], price: 49, rating: 4.3, reviews: 64,
        img: "images/kids-blue.jpg", type: "everyday", tags: ["casual", "dry"],
        desc: "Bright blue canvas sneakers for school and playground."
    },
    {
        id: 9, name: "Rocket Red", brand: "KicksLab", cats: ["kids"], price: 54, rating: 4.5, reviews: 71,
        img: "images/kids-red.jpg", type: "everyday", tags: ["casual", "dry"], darkBg: true,
        desc: "High-top style with a durable rubber toe cap."
    }
];
