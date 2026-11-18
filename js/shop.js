/* ==========================================================================
   KicksLab — shop page: live search, filters, sorting, favourites.
   The chosen filters AND the last result list are saved to localStorage,
   so the page looks the same when the visitor comes back.
   ========================================================================== */
(function () {
    "use strict";
    const { $, $$ } = KL;
    const DEFAULTS = { q: "", cat: "all", brand: "all", price: "any", sort: "featured", favOnly: false };

    const PRICE_RANGES = {
        any: () => true,
        low: (p) => p.price < 100,
        mid: (p) => p.price >= 100 && p.price <= 130,
        high: (p) => p.price > 130
    };

    const SORTERS = {
        featured: (a, b) => a.id - b.id,
        "price-asc": (a, b) => a.price - b.price,
        "price-desc": (a, b) => b.price - a.price,
        rating: (a, b) => b.rating - a.rating
    };

    // Saved state, overridden by ?cat=men from links on the home page
    const state = Object.assign({}, DEFAULTS, KL.store.get("kl_filters", {}));
    const urlCat = new URLSearchParams(location.search).get("cat");
    if (["men", "women", "kids"].includes(urlCat)) state.cat = urlCat;

    const grid = $("#productGrid");
    const countEl = $("#resultCount");
    const searchInput = $("#searchInput");

    function applyFilters() {
        const q = state.q.trim().toLowerCase();
        return window.PRODUCTS
            .filter((p) => state.cat === "all" || p.cats.includes(state.cat))
            .filter((p) => state.brand === "all" || p.brand === state.brand)
            .filter(PRICE_RANGES[state.price] || PRICE_RANGES.any)
            .filter((p) => !state.favOnly || KL.favs.has(p.id))
            .filter((p) => !q || [p.name, p.brand, p.type, p.desc].join(" ").toLowerCase().includes(q))
            .sort(SORTERS[state.sort] || SORTERS.featured);
    }

    function render() {
        const results = applyFilters();
        if (!results.length) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.500-3.500"/></svg>
                <h3>No sneakers found</h3><p>Try a different keyword or reset the filters.</p>
                <button type="button" class="btn btn-sm" id="emptyReset">Reset filters</button></div>`;
        } else {
            grid.innerHTML = results.map((p, i) => KL.productCard(p, i)).join("");
        }
        countEl.textContent = `${results.length} of ${window.PRODUCTS.length} sneakers`;
        // save the state + the ids that are currently displayed
        KL.store.set("kl_filters", state);
        KL.store.set("kl_last_results", results.map((p) => p.id));
        syncControls();
    }

    /** Reflect state in the form controls and chips. */
    function syncControls() {
        searchInput.value = state.q;
        $$("[data-cat]").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === state.cat)));
        $("#brandSelect").value = state.brand;
        $("#priceSelect").value = state.price;
        $("#sortSelect").value = state.sort;
        $("#currencySelect").value = KL.currency.get();
        $("#favOnly").setAttribute("aria-pressed", String(state.favOnly));
    }

    function init() {
        // brand options come from the catalogue
        const brands = [...new Set(window.PRODUCTS.map((p) => p.brand))].sort();
        $("#brandSelect").innerHTML = `<option value="all">All brands</option>` +
            brands.map((b) => `<option value="${KL.esc(b)}">${KL.esc(b)}</option>`).join("");
        $("#currencySelect").innerHTML = KL.currency.list.map((c) => `<option value="${c}">${c}</option>`).join("");

        let timer;
        searchInput.addEventListener("input", () => {           // debounce typing
            state.q = searchInput.value;                  // keep state current immediately
            clearTimeout(timer);
            timer = setTimeout(render, 150);
        });
        $("#searchForm").addEventListener("submit", (e) => e.preventDefault());
        $("#clearSearch").addEventListener("click", () => { state.q = ""; render(); searchInput.focus(); });

        $$("[data-cat]").forEach((chip) => chip.addEventListener("click", () => { state.cat = chip.dataset.cat; render(); }));
        $("#brandSelect").addEventListener("change", (e) => { state.brand = e.target.value; render(); });
        $("#priceSelect").addEventListener("change", (e) => { state.price = e.target.value; render(); });
        $("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
        $("#favOnly").addEventListener("click", () => { state.favOnly = !state.favOnly; render(); });
        $("#resetFilters").addEventListener("click", resetAll);
        grid.addEventListener("click", (e) => { if (e.target.id === "emptyReset") resetAll(); });

        $("#currencySelect").addEventListener("change", (e) => {
            KL.currency.set(e.target.value);
            KL.toast("Prices shown in " + e.target.value);
        });
        document.addEventListener("kl:currency-changed", updateRateNote);
        document.addEventListener("kl:favs-changed", () => { if (state.favOnly) render(); });

        KL.loadRates().then((r) => { updateRateNote(r); KL.refreshProducts(); });
        render();
        updateRateNote();
    }

    function resetAll() {
        Object.assign(state, DEFAULTS);
        render();
        KL.toast("Filters reset");
    }

    function updateRateNote(result) {
        const note = $("#rateNote");
        if (!note) return;
        const code = KL.currency.get();
        if (code === "USD") { note.textContent = "Prices in US dollars."; return; }
        const updated = KL.currency.updatedAt();
        const live = KL.store.get("kl_rates", null);
        note.textContent = live
            ? `1 USD = ${KL.currency.rates()[code]} ${code} (live rate, ${updated ? updated.slice(0, 16) : "cached"})`
            : `1 USD ≈ ${KL.currency.rates()[code]} ${code} (offline estimate — live rates unavailable).`;
    }

    document.addEventListener("DOMContentLoaded", init);
})();
