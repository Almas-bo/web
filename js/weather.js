/* ==========================================================================
   KicksLab — "Sneaker Weather" page.
   Uses the free Open-Meteo public APIs (no API key):
     • geocoding-api.open-meteo.com  → city name  → latitude / longitude
     • api.open-meteo.com            → current weather for those coordinates
   The weather is turned into a recommendation from our own catalogue.
   ========================================================================== */
(function () {
    "use strict";
    const { $, $$ } = KL;

    // WMO weather codes → label + emoji + condition group
    function describe(code) {
        if (code === 0) return { text: "Clear sky", icon: "☀️", group: "clear" };
        if (code <= 3) return { text: "Partly cloudy", icon: "⛅", group: "clear" };
        if (code === 45 || code === 48) return { text: "Foggy", icon: "🌫️", group: "clear" };
        if (code >= 51 && code <= 57) return { text: "Drizzle", icon: "🌦️", group: "rain" };
        if (code >= 61 && code <= 67) return { text: "Rain", icon: "🌧️", group: "rain" };
        if (code >= 71 && code <= 77) return { text: "Snow", icon: "❄️", group: "snow" };
        if (code >= 80 && code <= 82) return { text: "Rain showers", icon: "🌧️", group: "rain" };
        if (code === 85 || code === 86) return { text: "Snow showers", icon: "🌨️", group: "snow" };
        if (code >= 95) return { text: "Thunderstorm", icon: "⛈️", group: "rain" };
        return { text: "Unknown", icon: "🌡️", group: "clear" };
    }

    /** Decide which product tags suit the weather and explain why. */
    function recommend(temp, group) {
        if (group === "rain") return { tag: "wet", why: "It's wet outside — pick water-resistant shoes with a grippy sole." };
        if (group === "snow") return { tag: "grip", why: "Snow and ice: you want deep tread for traction." };
        if (temp <= 8) return { tag: "warm", why: "It's cold — choose a closed knit upper that keeps your feet warm." };
        if (temp >= 24) return { tag: "breathable", why: "It's hot — light, breathable mesh keeps your feet cool." };
        return { tag: "casual", why: "Mild and dry — perfect weather for everyday sneakers." };
    }

    const result = $("#weatherResult");
    const statusBox = $("#weatherStatus");
    const form = $("#cityForm");

    function setStatus(type, message) {
        if (!type) { statusBox.hidden = true; statusBox.innerHTML = ""; return; }
        statusBox.hidden = false;
        statusBox.className = "status " + type;
        statusBox.innerHTML = (type === "loading" ? '<span class="loader" aria-hidden="true"></span>' : "") +
            `<span>${KL.esc(message)}</span>`;
        statusBox.setAttribute("role", type === "error" ? "alert" : "status");
    }

    /** fetch() with a timeout and a readable error. */
    async function getJSON(url) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 10000);
        try {
            const res = await fetch(url, { signal: ctrl.signal });
            if (!res.ok) throw new Error("The weather service answered with an error (" + res.status + ").");
            return await res.json();
        } catch (err) {
            if (err.name === "AbortError") throw new Error("The request took too long. Please try again.");
            if (err instanceof TypeError) throw new Error("Could not reach the weather service. Check your internet connection.");
            throw err;
        } finally { clearTimeout(timer); }
    }

    async function loadWeather(city) {
        const button = $("button[type=submit]", form);
        button.disabled = true;
        result.hidden = true;
        setStatus("loading", `Looking up the weather in ${city}…`);
        try {
            const geo = await getJSON(
                "https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=" + encodeURIComponent(city));
            if (!geo.results || !geo.results.length) throw new Error(`We couldn't find a city called "${city}". Check the spelling.`);
            const place = geo.results[0];
            const w = await getJSON(
                "https://api.open-meteo.com/v1/forecast?timezone=auto&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code" +
                `&latitude=${place.latitude}&longitude=${place.longitude}`);
            render(place, w.current);
            KL.store.set("kl_last_city", place.name);
            setStatus(null);
        } catch (err) {
            setStatus("error", err.message);
        } finally { button.disabled = false; }
    }

    function render(place, cur) {
        const info = describe(cur.weather_code);
        const temp = Math.round(cur.temperature_2m);
        const rec = recommend(temp, info.group);
        let picks = window.PRODUCTS.filter((p) => p.tags.includes(rec.tag));
        if (!picks.length) picks = window.PRODUCTS.slice(0, 3);

        $("#wPlace").textContent = [place.name, place.country].filter(Boolean).join(", ");
        $("#wIcon").textContent = info.icon;
        $("#wTemp").textContent = temp + "°C";
        $("#wText").textContent = info.text;
        $("#wFeels").textContent = Math.round(cur.apparent_temperature) + "°C";
        $("#wWind").textContent = Math.round(cur.wind_speed_10m) + " km/h";
        $("#wHumidity").textContent = Math.round(cur.relative_humidity_2m) + "%";
        $("#wWhy").textContent = rec.why;
        $("#wPicks").innerHTML = picks.map((p, i) => KL.productCard(p, i)).join("");
        result.hidden = false;
    }

    function init() {
        KL.validateForm(form, {
            city: [
                KL.rules.required("City"),
                (v) => (!v.trim() || /^[\p{L}][\p{L}\s.'-]{1,59}$/u.test(v.trim()) ? "" : "Use letters only, e.g. Almaty or New York.")
            ]
        }, (values) => loadWeather(values.city.trim()));

        $$("[data-city]").forEach((btn) => btn.addEventListener("click", () => {
            form.elements.city.value = btn.dataset.city;
            loadWeather(btn.dataset.city);
        }));

        const last = KL.store.get("kl_last_city", "Astana");   // remember the last search
        form.elements.city.value = last;
        loadWeather(last);
    }

    document.addEventListener("DOMContentLoaded", init);
})();
