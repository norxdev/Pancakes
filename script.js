// --- Global Data ---
let latestData = {};
let volumesData = {};
let itemMapping = {};
let gridOptions;

// --- Utils ---
function formatNum(num) {
    return Number(num)?.toLocaleString() || '—';
}

// --- Fetch Item Mapping ---
async function fetchItemMappingOnce() {
    if (Object.keys(itemMapping).length) return;
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
    const totalCost = set.items.reduce((sum, i) => sum + (latestData.data?.[i.id]?.low || 0), 0);
    const sellPrice = Number(latestData.data?.[set.setId]?.high) || 0;
    const tax = Math.min(sellPrice * 0.02, 5_000_000);
    const profit = Math.round(sellPrice - tax - totalCost);
    const roi = totalCost ? ((profit / totalCost) * 100).toFixed(2) : 0;
    return { profit, totalCost, roi };
}

// --- Helper: Filter F2P sets ---
function getFilteredArmorSets() {
    const f2pOnly = document.getElementById("f2pFilter")?.checked;
    if (!f2pOnly) return armorSetsData;
    return armorSetsData.filter(set => set.isF2P);
}

// --- Helper: Flatten sets for AG Grid ---
function flattenArmorSets(sets) {
    return sets.flatMap(set => set.items.map(item => ({
        ...item,
        setName: set.name,
        setImgName: set.setImgName,
        isF2P: set.isF2P
    })));
}

// --- Create Detailed Armor Sections ---
function createArmorSections() {
    const container = document.getElementById("armorSection");
    if (!container) return;
    container.innerHTML = "";

    const setsToRender = getFilteredArmorSets();

    setsToRender.forEach((set, i) => {
        const div = document.createElement("div");
        div.className = "set-wrapper";
        div.id = `armor-set-${i}`;
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
                            <div class="volume">Loading...</div>
                        </div>
                        <div class="card-right">
                            <div class="item-price">Loading...</div>
                        </div>
                    </a>`).join("")}
                <div class="card total">
                    <div class="card-left"></div>
                    <div class="card-middle">Total Pieces Cost:</div>
                    <div class="card-right" id="armor-total-${i}">Loading...</div>
                </div>
                <a class="card total" href="https://prices.runescape.wiki/osrs/item/${set.setId}" target="_blank">
                    <div class="card-left">
                        <img class="item-icon" src="https://oldschool.runescape.wiki/images/${set.setImgName}.png" loading="lazy" alt="${set.name}">
                    </div>
                    <div class="card-middle">
                        <div class="item-name">${set.name} Price</div>
                        <div class="volume">Loading...</div>
                    </div>
                    <div class="card-right" id="armor-setPrice-${i}">Loading...</div>
                </a>
            </div>
            <div class="profit-box" id="armor-profit-${i}">Loading...</div>
        `;
        container.appendChild(div);
    });
}

// --- Render AG Grid ---
function renderArmorGrid() {
    if (!latestData.data || !armorSetsData.length) return;

    const setsToRender = getFilteredArmorSets();

    let rowData = setsToRender.map((set, idx) => {
        const { profit, totalCost, roi } = calculateArmorProfit(set);
        return {
            armorSet: set.name,
            profitPerSet: profit,
            roi: roi,
            totalPiecesCost: totalCost,
            setIndex: armorSetsData.indexOf(set) // always map back to original index
        };
    });

    rowData.sort((a, b) => b.profitPerSet - a.profitPerSet);

    const columnDefs = [
        { 
            headerName: "Armor Set", 
            field: "armorSet", 
            sortable: true, 
            filter: 'agTextColumnFilter',
            cellRenderer: params => {
                const set = armorSetsData[params.data.setIndex];
                const f2pIcon = set.isF2P 
                    ? `<img src='https://oldschool.runescape.wiki/images/Free-to-play_icon.png' 
                            alt='F2P' 
                            style='width:16px;height:16px;vertical-align:middle;margin-left:4px;'>`
                    : '';
                return `${set.name}${f2pIcon}`;
            },
            cellStyle: { display: 'flex', alignItems: 'center' } 
        },
        { 
            headerName: "Profit per set", 
            field: "profitPerSet", 
            sortable: true, 
            filter: 'agNumberColumnFilter',
            valueFormatter: params => formatNum(params.value) + " gp",
            cellClass: params => params.value >= 0 ? 'profit-positive' : 'profit-negative',
            cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }
        },
        { 
            headerName: "ROI %", 
            field: "roi", 
            sortable: true,
            filter: 'agNumberColumnFilter',
            valueFormatter: params => params.value + "%",
            cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }
        },
        { 
            headerName: "Total Pieces Cost", 
            field: "totalPiecesCost", 
            sortable: true,
            filter: 'agNumberColumnFilter',
            valueFormatter: params => formatNum(params.value) + " gp",
            cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }
        }
    ];

    const gridDiv = document.getElementById('gridContainer');

    if (!gridOptions) {
        gridOptions = {
            columnDefs,
            defaultColDef: { sortable: true, resizable: true, filter: true, floatingFilter: false },
            rowData,
            rowHeight: 50,
            headerHeight: 45,
            animateRows: true,
            onRowClicked: params => {
                const setDiv = document.getElementById(`armor-set-${params.data.setIndex}`);
                if (setDiv) setDiv.scrollIntoView({ behavior: "smooth" });
            },
            suppressDragLeaveHidesColumns: true,
            onGridReady: params => {
                params.api.sizeColumnsToFit();
                params.api.setSortModel([{ colId: 'profitPerSet', sort: 'desc' }]);
            }
        };

        new agGrid.Grid(gridDiv, gridOptions);
    } else {
        gridOptions.api.setRowData(rowData);
        gridOptions.api.refreshCells();
        gridOptions.api.setSortModel([{ colId: 'profitPerSet', sort: 'desc' }]);
    }
}

// --- Update Prices & Volumes ---
async function updateArmorData() {
    const setsToRender = getFilteredArmorSets();

    setsToRender.forEach((set, i) => {
        let totalCost = 0;
        set.items.forEach(item => {
            const low = Number(latestData.data?.[item.id]?.low) || 0;
            totalCost += low;

            const priceEl = document.querySelector(`#armor-set-${i} .card[href*="${item.id}"] .card-right .item-price`);
            if (priceEl) priceEl.textContent = low ? formatNum(low) + " gp" : "—";

            const vol = volumesData.data?.[item.id] || 0;
            const volEl = document.querySelector(`#armor-set-${i} .card[href*="${item.id}"] .card-middle .volume`);
            if (volEl) volEl.textContent = `Daily volume: ${formatNum(vol)}`;
        });

        const totalElem = document.getElementById(`armor-total-${i}`);
        if (totalElem) totalElem.innerText = totalCost ? formatNum(totalCost) + " gp" : "—";

        const setPrice = Number(latestData.data?.[set.setId]?.high) || 0;
        const setPriceElem = document.getElementById(`armor-setPrice-${i}`);
        if (setPriceElem) setPriceElem.innerText = setPrice ? formatNum(setPrice) + " gp" : "—";

        const setVol = volumesData.data?.[set.setId] || 0;
        const setVolEl = document.querySelector(`#armor-set-${i} a.card.total[href*="${set.setId}"] .card-middle .volume`);
        if (setVolEl) setVolEl.textContent = `Daily volume: ${formatNum(setVol)}`;

        const profitElem = document.getElementById(`armor-profit-${i}`);
        if (profitElem) {
            const tax = Math.min(setPrice * 0.02, 5_000_000);
            const profit = Math.round(setPrice - tax - totalCost);
            const roi = totalCost ? ((profit / totalCost) * 100).toFixed(2) : 0;

            profitElem.innerHTML = `
                <div><strong>Profit per set (after tax):</strong> ${profit ? formatNum(profit) + " gp" : "—"}</div>
                <div><strong>ROI:</strong> ${profit ? roi + "%" : "—"}</div>
            `;
        }
    });

    renderArmorGrid();
}

// --- Fetch Latest Prices ---
async function fetchLatestPrices() {
    try {
        const res = await fetch("https://prices.runescape.wiki/api/v1/osrs/latest");
        latestData = await res.json();
        await fetchDailyVolumes();
        updateArmorData();
    } catch (err) {
        console.warn("Failed to fetch latest prices", err);
    }
}

// --- Fetch Daily Volumes ---
async function fetchDailyVolumes() {
    try {
        const res = await fetch("https://prices.runescape.wiki/api/v1/osrs/volumes");
        volumesData = await res.json();
    } catch (err) {
        console.warn("Failed to fetch daily volumes", err);
    }
}

// --- Floating Buttons ---
function initFloatingButtons() {
    const backToTopBtn = document.getElementById('backToTop');
    const refreshBtn = document.getElementById('refreshData');

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            backToTopBtn.classList.add('bounce-icon');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => backToTopBtn.classList.remove('bounce-icon'), 400);
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.classList.add('spin-icon');
            fetchLatestPrices().finally(() => {
                setTimeout(() => refreshBtn.classList.remove('spin-icon'), 500);
            });
        });
    }
}

// --- F2P Checkbox Listener ---
function initF2PFilter() {
    const f2pCheckbox = document.getElementById("f2pFilter");
    if (!f2pCheckbox) return;

    f2pCheckbox.addEventListener("change", () => {
        createArmorSections();
        updateArmorData();
    });
}

// --- Init ---
window.addEventListener("load", async () => {
    await fetchItemMappingOnce();
    armorSetsData.sort((a, b) => a.name.localeCompare(b.name));

    initF2PFilter();         // initialize F2P checkbox listener
    createArmorSections();    // first render
    await fetchLatestPrices();
    initFloatingButtons();
});
// --- Auto-fit grid columns on window resize ---
window.addEventListener("resize", () => {
    if (gridOptions?.api) {
        gridOptions.api.sizeColumnsToFit();
    }
});
