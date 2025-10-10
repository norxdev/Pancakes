// --- Global Data ---
let latestData = {};
let volumesData = {};
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

// --- Apply F2P Filter ---
function applyF2PFilter(onlyF2P) {
    document.querySelectorAll("#armorSummaryTable tbody tr").forEach(row => {
        const isF2P = row.getAttribute("data-f2p") === "true";
        row.style.display = (onlyF2P && !isF2P) ? "none" : "";
    });

    armorSetsData.forEach((set, i) => {
        const setEl = document.getElementById(`armor-set-${i}`);
        if (!setEl) return;
        setEl.style.display = (onlyF2P && !set.isF2P) ? "none" : "";
    });
}

// --- Section Rendering ---
function createArmorSections() {
    const container = document.getElementById("armorSection");
    if (!container) return;
    container.innerHTML = "";

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
                        <div class="card-left">
                            <img class="item-icon" src="https://oldschool.runescape.wiki/images/${it.imgName}.png" loading="lazy" alt="${it.name}">
                        </div>
                        <div class="card-middle">
                            <div class="item-name">${it.name}</div>
                            <div class="volume"></div>
                        </div>
                        <div class="card-right">
                            <div class="item-price"></div>
                        </div>
                    </a>`).join("")}
                <div class="card total">
                    <div class="card-left"></div>
                    <div class="card-middle"><div>Total Pieces Cost:</div></div>
                    <div class="card-right" id="armor-total-${idx}"></div>
                </div>
                <a class="card total" href="https://prices.runescape.wiki/osrs/item/${set.setId}" target="_blank">
                    <div class="card-left">
                        <img class="item-icon" src="https://oldschool.runescape.wiki/images/${set.setImgName}.png" loading="lazy" alt="${set.name}">
                    </div>
                    <div class="card-middle">
                        <div class="item-name">${set.name} Price</div>
                        <div class="volume"></div>
                    </div>
                    <div class="card-right" id="armor-setPrice-${idx}"></div>
                </a>
            </div>
            <div class="profit-box" id="armor-profit-${idx}"></div>`;

        container.appendChild(div);
    });

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

            const priceEl = document.querySelector(`#armor-set-${i} .card[href*="${item.id}"] .card-right .item-price`);
            if (priceEl) priceEl.textContent = low ? formatNum(low) + " gp" : "";
        });

        const totalElem = document.getElementById(`armor-total-${i}`);
        if (totalElem) totalElem.innerText = totalCost ? formatNum(totalCost) + " gp" : "";

        const setPrice = latestData.data?.[set.setId]?.high || 0;
        const setPriceElem = document.getElementById(`armor-setPrice-${i}`);
        if (setPriceElem) setPriceElem.innerText = setPrice ? formatNum(setPrice) + " gp" : "";

        const profitElem = document.getElementById(`armor-profit-${i}`);
        if (profitElem) {
            const profit = Math.round(setPrice * 0.98 - totalCost);
            const roi = totalCost ? ((profit / totalCost) * 100).toFixed(2) : 0;
            profitElem.innerHTML = `
                <div><strong>Profit per set (after tax):</strong> ${profit ? formatNum(profit) + " gp" : ""}</div>
                <div><strong>ROI:</strong> ${profit ? roi + "%" : ""}</div>
            `;
        }
    });

    const savedFilter = localStorage.getItem("f2pFilter") === "true";
    if (savedFilter) applyF2PFilter(true);
}

// --- Update Volumes ---
function updateVolumes() {
    armorSetsData.forEach((set, i) => {
        set.items.forEach(item => {
            const vol = volumesData.data?.[item.id];
            const volEl = document.querySelector(`#armor-set-${i} .card[href*="${item.id}"] .card-middle .volume`);
            if (volEl) volEl.textContent = vol ? `Daily volume: ${formatNum(vol)}` : "";
        });

        const setVol = volumesData.data?.[set.setId];
        const setVolEl = document.querySelector(`#armor-set-${i} a.card.total[href*="${set.setId}"] .card-middle .volume`);
        if (setVolEl) setVolEl.textContent = setVol ? `Daily volume: ${formatNum(setVol)}` : "";
    });
}

// --- Sort + Summary ---
let currentSortKey = localStorage.getItem('sortKey') || 'profit';
let currentSortDir = localStorage.getItem('sortDir') || 'default';

function updateSummaries(sortKey = currentSortKey, sortDir = currentSortDir) {
    const armorSummary = document.getElementById("armorSummary");
    if (!armorSummary) return;

    const loadingEl = document.getElementById("summaryLoading");
    if (!latestData.data || !armorSetsData.length) {
        if (loadingEl) loadingEl.style.display = "block";
        return;
    } else {
        if (loadingEl) loadingEl.style.display = "none";
    }

    armorSummary.style.display = summaryVisible ? "block" : "none";

    const list = armorSetsData.map((s, i) => ({ ...calculateArmorProfit(s), name: s.name, index: i }));

    const numericCols = ["profit", "roi", "totalCost"];
    list.sort((a, b) => {
        if (currentSortDir === 'default') return b.profit - a.profit;
        if (currentSortKey === 'name') return currentSortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        return currentSortDir === 'asc' ? a[currentSortKey] - b[currentSortKey] : b[currentSortKey] - a[currentSortKey];
    });

    armorSummary.innerHTML = `
        <label style="display:block; margin-bottom:8px;">
            <input type="checkbox" id="f2pFilter"> Show only F2P sets
        </label>
        <table class="summary-table" id="armorSummaryTable">
            <thead>
                <tr>
                    <th data-key="name">Armor Set <span class="sort-indicator">&nbsp;</span></th>
                    <th data-key="profit">Profit per set <span class="sort-indicator">&nbsp;</span></th>
                    <th data-key="roi">ROI % <span class="sort-indicator">&nbsp;</span></th>
                    <th data-key="totalCost">Total Pieces Cost <span class="sort-indicator">&nbsp;</span></th>
                </tr>
            </thead>
            <tbody>
                ${list.map(l => `
                    <tr class="${l.profit >= 0 ? 'profit-positive' : 'profit-negative'}"
                        data-index="${l.index}"
                        data-f2p="${armorSetsData[l.index].isF2P ? "true" : "false"}">
                        <td>${l.name}</td>
                        <td>${formatNum(l.profit)} gp</td>
                        <td>${l.roi}%</td>
                        <td>${formatNum(l.totalCost)} gp</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;

    // --- Sorting headers ---
    document.querySelectorAll("#armorSummaryTable thead th").forEach(th => {
        const key = th.getAttribute('data-key');
        const indicator = th.querySelector(".sort-indicator");
        indicator.innerHTML = '&nbsp;';
        if (key === currentSortKey) indicator.innerText = currentSortDir === 'asc' ? '▲' : currentSortDir === 'desc' ? '▼' : '';

        th.onclick = () => {
            const isNumeric = numericCols.includes(key);
            if (currentSortKey !== key) currentSortDir = isNumeric ? 'desc' : 'asc';
            else currentSortDir = currentSortDir === 'default' ? (isNumeric ? 'desc' : 'asc') : currentSortDir === 'asc' || currentSortDir === 'desc' ? (isNumeric ? 'asc' : 'desc') : 'default';
            currentSortKey = key;
            localStorage.setItem('sortKey', currentSortKey);
            localStorage.setItem('sortDir', currentSortDir);
            updateSummaries(currentSortKey, currentSortDir);
        };
    });

    // --- F2P Filter ---
    const f2pCheckbox = document.getElementById("f2pFilter");
    if (f2pCheckbox) {
        const savedFilter = localStorage.getItem("f2pFilter") === "true";
        f2pCheckbox.checked = savedFilter;
        applyF2PFilter(savedFilter);
        f2pCheckbox.addEventListener("change", function () {
            const onlyF2P = this.checked;
            localStorage.setItem("f2pFilter", onlyF2P ? "true" : "false");
            applyF2PFilter(onlyF2P);
        });
    }

    // --- Row click scroll ---
    document.querySelectorAll("#armorSummaryTable tbody tr").forEach(row => {
        row.addEventListener("click", () => {
            const idx = row.getAttribute("data-index");
            const targetEl = document.getElementById(`armor-set-${idx}`);
            if (!targetEl) return;
            if (targetEl.style.display === "none") targetEl.style.display = "";
            targetEl.scrollIntoView({ behavior: "smooth" });
            window.location.hash = `#${armorSetsData[idx].setImgName}`;
        });
    });
}

// --- Floating Buttons ---
document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const icon = document.querySelector('#backToTop .floating-icon');
    if (icon) { icon.classList.add('bounce-icon'); setTimeout(() => icon.classList.remove('bounce-icon'), 400); }
});

document.getElementById('refreshData')?.addEventListener('click', async () => {
    const icon = document.querySelector('#refreshData .floating-icon');
    if (icon) icon.classList.add('spin-icon');
    await fetchLatestPrices();
    if (icon) setTimeout(() => icon.classList.remove('spin-icon'), 500);
});

// --- Fetch Data ---
async function fetchDailyVolumes() {
    try {
        const res = await fetch("https://prices.runescape.wiki/api/v1/osrs/volumes");
        volumesData = await res.json();
        updateVolumes();
    } catch (err) { console.warn("Failed to fetch daily volumes", err); }
}

async function fetchLatestPrices() {
    try {
        const res = await fetch("https://prices.runescape.wiki/api/v1/osrs/latest");
        latestData = await res.json();
        updateArmorPrices();
        updateSummaries();
        await fetchDailyVolumes();
    } catch (err) { console.warn("Failed to fetch latest prices", err); }
}

// --- Feedback ---
function initFeedbackButton() {
    const fb = document.getElementById('feedbackBtn');
    if (fb) fb.addEventListener('click', () => window.location.href = 'https://www.armourflipper.com/feedback');
}

// --- Init ---
window.addEventListener("load", async () => {
    await fetchItemMappingOnce();
    const savedFilter = localStorage.getItem("f2pFilter") === "true";
    createArmorSections(savedFilter);
    initFeedbackButton();
    await fetchLatestPrices();

    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetSet = armorSetsData.find((s) => s.setImgName === hash);
        if (targetSet) {
            const targetEl = document.getElementById(`armor-set-${armorSetsData.indexOf(targetSet)}`);
            if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
        }
    }

    // --- AdSense check ---
    try { (adsbygoogle = window.adsbygoogle || []).push({}); } 
    catch (e) { console.warn('AdSense not loaded', e); }

    setTimeout(() => {
        document.querySelectorAll('.ad').forEach(container => {
            const ad = container.querySelector('ins.adsbygoogle');
            if (ad && ad.offsetHeight > 0) {
                container.style.display = 'block';
                container.style.visibility = 'visible';
            } else {
                container.style.display = 'none';
            }
        });
    }, 500);

});
