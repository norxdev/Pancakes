// --- Global Data ---
let latestData = {};
let itemMapping = {};
let summaryVisible = true;

// --- Utils ---
function formatNum(num) {
    return Number(num)?.toLocaleString() || '—';
}

// --- Fetch Item Mapping ---
async function fetchItemMappingOnce() {
    if (Object.keys(itemMapping).length > 0) return;
    try {
        const res = await fetch("https://prices.runescape.wiki/api/v1/osrs/mapping");
        const mapping = await res.json();
        mapping.forEach(item => itemMapping[String(item.id)] = item);
    } catch (err) {
        console.warn("Mapping fetch failed", err);
    }
}

// --- Profit Calculations ---
function calculateArmorProfit(set) {
    let totalCost = set.items.reduce((s, i) => s + (latestData.data?.[i.id]?.low || 0), 0);
    const sellPrice = latestData.data?.[set.setId]?.high || 0;
    const profit = Math.round(sellPrice * 0.98 - totalCost); // 2% tax included
    const roi = totalCost ? ((profit / totalCost) * 100).toFixed(2) : 0;
    return { profit, totalCost, roi };
}

// --- Apply F2P Filter (summary rows + armorSection sets) ---
function applyF2PFilter(onlyF2P) {
    // Summary table rows
    document.querySelectorAll("#armorSummaryTable tbody tr").forEach(row => {
        const isF2P = row.getAttribute("data-f2p") === "true";
        row.style.display = (onlyF2P && !isF2P) ? "none" : "";
    });

    // Armor sections (sets)
    armorSetsData.forEach((set, i) => {
        const setEl = document.getElementById(`armor-set-${i}`);
        if (!setEl) return;
        if (onlyF2P && !set.isF2P) {
            setEl.style.display = "none";
        } else {
            setEl.style.display = "";
        }
    });
}

// --- Section Rendering (Sorted by Set Name & F2P Filter) ---
function createArmorSections() {
    const container = document.getElementById("armorSection");
    if (!container) return;
    container.innerHTML = "";

// Sort sets alphabetically by name, but keep original index
const sortedSets = armorSetsData
    .map((set, idx) => ({ ...set, originalIndex: idx }))
    .sort((a, b) => a.name.localeCompare(b.name));

sortedSets.forEach(set => {
    const idx = set.originalIndex;
    const div = document.createElement("div");
    div.className = "set-wrapper";
    div.id = `armor-set-${idx}`;
    div.dataset.f2p = set.isF2P ? "true" : "false";

    div.innerHTML = `
        <div class="set-title">${set.name}</div>
        <div class="cards">
            ${set.items.map(it => `
                <a class="card" href="https://prices.runescape.wiki/osrs/item/${it.id}" target="_blank">
                    <div class="item-label">
                        <img class="item-icon" src="https://oldschool.runescape.wiki/images/${it.imgName}.png" loading="lazy" alt="${it.name}">${it.name}
                    </div>
                    <div id="armor-${it.id}">Loading...</div>
                </a>`).join("")}
            <div class="card total">
                <div>Total Pieces Cost:</div>
                <div id="armor-total-${idx}">Loading...</div>
            </div>
            <a class="card total" href="https://prices.runescape.wiki/osrs/item/${set.setId}" target="_blank">
                <div class="item-label">
                    <img class="item-icon" src="https://oldschool.runescape.wiki/images/${set.setImgName}.png" loading="lazy" alt="${set.name}">${set.name} Price
                </div>
                <div id="armor-setPrice-${idx}">Loading...</div>
            </a>
        </div>
        <div class="profit-box" id="armor-profit-${idx}">Loading...</div>`;

    container.appendChild(div);
});


    // Apply saved F2P filter after rendering
    const savedFilter = localStorage.getItem("f2pFilter") === "true";
    applyF2PFilter(savedFilter);
}



// --- Update Prices ---
function updateArmorPrices() {
    armorSetsData.forEach((set, i) => {
        let totalCost = 0;
        set.items.forEach(item => {
            const low = latestData.data?.[item.id]?.low || 0;
            totalCost += low;
            const elem = document.getElementById(`armor-${item.id}`);
            if (elem) elem.innerText = low ? formatNum(low) + " gp" : "—";
        });

        const totalElem = document.getElementById(`armor-total-${i}`);
        if (totalElem) totalElem.innerText = totalCost ? formatNum(totalCost) + " gp" : "—";

        const setPrice = latestData.data?.[set.setId]?.high || 0;
        const setPriceElem = document.getElementById(`armor-setPrice-${i}`);
        if (setPriceElem) setPriceElem.innerText = setPrice ? formatNum(setPrice) + " gp" : "—";

        const profitElem = document.getElementById(`armor-profit-${i}`);
        if (profitElem) {
            const profit = Math.round(setPrice * 0.98 - totalCost);
            const roi = totalCost ? ((profit / totalCost) * 100).toFixed(2) : 0;
            profitElem.innerHTML = `
                <div><strong>Profit per set (after tax):</strong> ${profit ? formatNum(profit) + " gp" : "—"}</div>
                <div><strong>ROI:</strong> ${profit ? roi + "%" : "—"}</div>
            `;
        }
    });

    const savedFilter = localStorage.getItem("f2pFilter") === "true";
    if (savedFilter) applyF2PFilter(true);
}

// --- Update Summary Table ---
function updateSummaries(sortKey = 'profit') {
    const armorSummary = document.getElementById("armorSummary");
    if (!armorSummary) return;

    armorSummary.style.display = summaryVisible ? "block" : "none";

    const list = armorSetsData.map((s, i) => {
        const calc = calculateArmorProfit(s) || {};
        return { ...calc, name: s.name, index: i };
    });

    list.sort((a, b) => {
        if (sortKey === 'name') return a.name.localeCompare(b.name);
        return b[sortKey] - a[sortKey];
    });

    armorSummary.innerHTML = `
    <div class="summary-controls">
        <label for="sortDropdown">Sort by:</label>
        <select id="sortDropdown">
            <option value="profit">Profit per set</option>
            <option value="roi">ROI %</option>
            <option value="name">Name</option>
            <option value="totalCost">Total pieces cost</option>
        </select>

        <label class="f2p-filter" style="margin-left:12px;">
            <input type="checkbox" id="f2pFilter"> Show F2P sets only
        </label>
    </div>

    <table class="summary-table" id="armorSummaryTable">
        <thead>
            <tr>
                <th>Armor Set</th>
                <th>Profit per set</th>
                <th>ROI %</th>
                <th>Total Pieces Cost</th>
            </tr>
        </thead>
        <tbody>
            ${list.map(l => `
                <tr class="${l.profit >= 0 ? 'profit-positive' : 'profit-negative'}"
                    data-index="${l.index}"
                    data-f2p="${armorSetsData[l.index].isF2P ? "true" : "false"}">
                    <td style="text-align:left">${l.name}</td>
                    <td style="text-align:left">${formatNum(l.profit)} gp</td>
                    <td style="text-align:left">${l.roi}%</td>
                    <td style="text-align:left">${formatNum(l.totalCost)} gp</td>
                </tr>
            `).join("")}
        </tbody>
    </table>
    `;

    const savedSort = localStorage.getItem("sortKey") || sortKey;
    const sortDropdown = document.getElementById("sortDropdown");
    if (sortDropdown) {
        sortDropdown.value = savedSort;
        sortDropdown.addEventListener("change", (e) => {
            const newSort = e.target.value;
            localStorage.setItem("sortKey", newSort);
            updateSummaries(newSort);
        });
    }

    const savedFilter = localStorage.getItem("f2pFilter") === "true";
    const f2pCheckbox = document.getElementById("f2pFilter");
    if (f2pCheckbox) {
        f2pCheckbox.checked = savedFilter;
        applyF2PFilter(savedFilter);

        f2pCheckbox.addEventListener("change", function () {
            const onlyF2P = this.checked;
            localStorage.setItem("f2pFilter", onlyF2P ? "true" : "false");
            applyF2PFilter(onlyF2P);
        });
    }

    document.querySelectorAll("#armorSummaryTable tbody tr").forEach(row => {
        row.addEventListener("click", () => {
            const idx = row.getAttribute("data-index");
            document.getElementById(`armor-set-${idx}`)?.scrollIntoView({ behavior: "smooth" });
        });
    });
}

// --- Toggle Summary Button ---
document.getElementById("toggleSummary")?.addEventListener("click", () => {
    summaryVisible = !summaryVisible;
    document.getElementById("toggleSummary").innerText = summaryVisible ? "Hide Summary ▲" : "Show Summary ▼";
    updateSummaries(localStorage.getItem("sortKey") || "profit");
});

// --- Floating Buttons ---
document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const icon = document.querySelector('#backToTop .floating-icon');
    if (icon) {
        icon.classList.add('bounce-icon');
        setTimeout(() => icon.classList.remove('bounce-icon'), 400);
    }
});

document.getElementById('refreshData')?.addEventListener('click', async () => {
    const icon = document.querySelector('#refreshData .floating-icon');
    if (icon) icon.classList.add('spin-icon');
    await fetchLatestPrices();
    if (icon) setTimeout(() => icon.classList.remove('spin-icon'), 500);
});

// --- Fetch Latest Prices ---
async function fetchLatestPrices() {
    try {
        const res = await fetch("https://prices.runescape.wiki/api/v1/osrs/latest");
        latestData = await res.json();
        updateArmorPrices();
        updateSummaries(localStorage.getItem("sortKey") || "profit");
    } catch (err) {
        console.warn("Failed to fetch latest prices", err);
    }
}

// --- Feedback button ---
function initFeedbackButton() {
    const fb = document.getElementById('feedbackBtn');
    if (fb) {
        fb.addEventListener('click', () => {
            window.open('https://www.armourflipper.com/feedback', '_blank');
        });
    }
}

// --- Init ---
window.addEventListener("load", async () => {
    await fetchItemMappingOnce();

    // Restore saved F2P filter state
    const savedFilter = localStorage.getItem("f2pFilter") === "true";

    createArmorSections(savedFilter);
    initFeedbackButton();
    await fetchLatestPrices();
});
