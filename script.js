// --- Global Data ---
let latestData = {};
let volumesData = {};
let itemMapping = {};
let refreshInterval = null;
let lastRefresh = Date.now();
let showF2P = localStorage.getItem("f2pFilter") === "true";
let flippingMode = localStorage.getItem("flippingMode") || "piecesToSet"; 

// --- Sorting State ---
let summarySort = { column: "profit", direction: "desc" };


// --- Utils ---
function formatNum(num) { return Number(num)?.toLocaleString() || '—'; }
function getF2PIcon(isF2P) {
    return isF2P ? `<img src="https://oldschool.runescape.wiki/images/F2P_icon.png" alt="F2P">` : '';
}
function calculatePieceSales(set) {
    let gross = 0;
    let tax = 0;

    set.items.forEach(item => {
        const price = getSellPrice(item.id);
        gross += price;
        tax += Math.floor(Math.min(price * 0.02, 5_000_000));
    });

    return { gross, tax };
}
function getBuyPrice(itemId) {
    const low = Number(latestData.data?.[itemId]?.low || 0);
    const high = Number(latestData.data?.[itemId]?.high || 0);
    if (!low && !high) return 0;
    return Math.min(low || Infinity, high || Infinity);
}

function getSellPrice(itemId) {
    const low = Number(latestData.data?.[itemId]?.low || 0);
    const high = Number(latestData.data?.[itemId]?.high || 0);
    if (!low && !high) return 0;
    return Math.max(low, high);
}

function getVisibleSetIndex() {
    return armorSetsData.findIndex((_, i) => {
        const el = document.getElementById(`armor-set-${i}`);
        return el && el.style.display !== "none";
    });
}



// --- Fetch Item Mapping ---
async function fetchItemMappingOnce() {
    if (Object.keys(itemMapping).length) return;
    try {
        const res = await fetch("https://prices.runescape.wiki/api/v1/osrs/mapping");
        const mapping = await res.json();
        mapping.forEach(item => itemMapping[String(item.id)] = item);
    } catch(e) { console.warn("Mapping fetch failed", e); }
}

// --- Profit Calculation ---
function calculateArmorProfit(set) {
const totalPiecesCost = set.items.reduce(
    (s, i) => s + getBuyPrice(i.id),
    0
);

const setSellPrice = getSellPrice(set.setId);


    let profit = 0;
    let totalCost = 0;

    if(flippingMode === "piecesToSet") { 
        // Buy pieces → sell full set
        totalCost = totalPiecesCost;
        const tax = Math.floor(Math.min(setSellPrice * 0.02, 5_000_000));
        profit = Math.floor(setSellPrice - tax - totalCost);
    } else { 
    // Buy set → sell pieces individually (per-piece tax)
    totalCost = getBuyPrice(set.setId);


    const { gross, tax } = calculatePieceSales(set);

    profit = Math.floor(gross - tax - totalCost);
}


    const roi = totalCost ? ((profit / totalCost) * 100).toFixed(2) : '0.00';
    return { profit, totalCost, roi };
}



// --- Refresh Indicator ---
function getFreshnessColor() {
    const diff = (Date.now()-lastRefresh)/1000;
    if(diff<60) return "green";
    if(diff<300) return "yellow";
    return "red";
}
function formatTimeAgo(ms) {
    const diff = Math.floor((Date.now()-ms)/1000);
    if(diff<60) return `${diff}s ago`;
    if(diff<3600) return `${Math.floor(diff/60)}m ago`;
    return `${Math.floor(diff/3600)}h ago`;
}
function updateRefreshIndicator() {
    const dot = document.querySelector(".refresh-dot");
    const timeEl = document.getElementById("refreshTime");
    if(!dot||!timeEl) return;
    dot.style.backgroundColor = getFreshnessColor();
    timeEl.textContent = lastRefresh ? formatTimeAgo(lastRefresh) : "";
}
async function refreshData() { lastRefresh=Date.now(); updateRefreshIndicator(); await fetchLatestPrices(); }
function startRefreshTicker() { if(refreshInterval) clearInterval(refreshInterval); refreshInterval=setInterval(updateRefreshIndicator,15000); }

// --- Create Armor Sections ---
function createArmorSections() {
    const container = document.getElementById("armorSection");
    if (!container) return;
    container.innerHTML = "";

    const pieceTemplate = document.getElementById("pieceTemplate");
    const setTemplate = document.getElementById("setTemplate");

    armorSetsData.forEach((set, idx) => {
        // Clone set template
        const setEl = setTemplate.content.cloneNode(true);
        const wrapper = setEl.querySelector(".set-wrapper");
        wrapper.id = `armor-set-${idx}`;
        wrapper.dataset.f2p = set.isF2P ? "true" : "false";
        wrapper.style.display = "none";

        // Populate pieces
        const piecesList = wrapper.querySelector(".pieces-list");
        set.items.forEach(item => {
            const pieceEl = pieceTemplate.content.cloneNode(true);
            const pieceCard = pieceEl.querySelector(".piece-card");
            const img = pieceEl.querySelector("img.piece-icon");

            img.src = `https://oldschool.runescape.wiki/images/${item.imgName}.png`;
            img.alt = item.name;

            pieceCard.onclick = () =>
                window.open(`https://prices.runescape.wiki/osrs/item/${item.id}`, "_blank");

            pieceEl.querySelector(".piece-name").textContent = item.name;
            pieceEl.querySelector(".piece-volume").textContent = "Loading volume...";
            pieceEl.querySelector(".piece-price-buy").textContent = "Loading...";
            piecesList.appendChild(pieceEl);
        });

        // Set main card info
        const mainCard = wrapper.querySelector(".set-main-card .set-main-info");
        const mainImg = mainCard.querySelector("img");
        mainImg.src = `https://oldschool.runescape.wiki/images/${set.setImgName}.png`;
        mainImg.alt = set.name;
        mainCard.onclick = () =>
            window.open(`https://prices.runescape.wiki/osrs/item/${set.setId}`, "_blank");
        mainCard.querySelector(".piece-name").textContent = set.name;
        mainCard.querySelector(".piece-volume").id = `armor-setVolume-${idx}`;
        mainCard.querySelector(".piece-price-buy").id = `armor-setSell-${idx}`;

        // Bottom summary
        const bottomSummary = wrapper.querySelector(".set-bottom-summary");
        wrapper.querySelector(".set-profit").id = `armor-setProfitRange-${idx}`;
        wrapper.querySelector(".set-roi").id = `armor-setROI-${idx}`;
        wrapper.querySelector(".set-total-buy").textContent =
            flippingMode === "piecesToSet"
                ? "Loading total buy cost..."
                : "Loading total sell price...";

        // ---- Reorder layout based on flipping mode ----
        const piecesListEl = piecesList;
        const totalBuyEl = wrapper.querySelector(".set-total-buy");
        const setCardEl = wrapper.querySelector(".set-main-card");

        // ---- Reorder layout based on flipping mode ----
const children = [piecesListEl, totalBuyEl, setCardEl, bottomSummary];

// Remove existing children without wiping the whole wrapper
children.forEach(el => {
    if (el && el.parentNode === wrapper) wrapper.removeChild(el);
});

if (flippingMode === "piecesToSet") {
    wrapper.appendChild(piecesListEl);
    wrapper.appendChild(totalBuyEl);
    wrapper.appendChild(setCardEl);
} else {
    wrapper.appendChild(setCardEl);
    wrapper.appendChild(piecesListEl);
    wrapper.appendChild(totalBuyEl);
}

// Always append bottom summary last
wrapper.appendChild(bottomSummary);


        // Finally add wrapper to container
        container.appendChild(wrapper);
    });
}



// --- Update Armor Prices ---
function updateArmorPrices() {
    armorSetsData.forEach((set, idx) => {
        const container = document.getElementById(`armor-set-${idx}`);
        if (!container) return;

        let totalBuy = 0;
        let gain = 0;

        const pieceCards = container.querySelectorAll(".pieces-list .piece-card");

        pieceCards.forEach((pieceCard, i) => {
            const item = set.items[i];
            const buy = getBuyPrice(item.id);
const sell = getSellPrice(item.id);
            const vol = Number(volumesData.data?.[item.id] || 0);

            pieceCard.querySelector(".piece-price-buy").textContent =
    flippingMode === "piecesToSet"
        ? buy ? `Buy Price: ${formatNum(buy)} gp` : "Buy Price: —"
        : sell ? `Sell Price: ${formatNum(sell)} gp` : "Sell Price: —";


            const volEl = pieceCard.querySelector(".piece-volume");
            if (volEl) volEl.textContent = vol ? `Daily vol: ${formatNum(vol)}` : "Daily vol: —";

            if (flippingMode === "piecesToSet") {
    totalBuy += buy;
}

        });

        const totalBuyEl = container.querySelector(".set-total-buy");
        const sellEl = container.querySelector(`#armor-setSell-${idx}`);

        if (flippingMode === "piecesToSet") {
            const setSell = getSellPrice(set.setId);

            const tax = Math.floor(Math.min(setSell * 0.02, 5_000_000));
            gain = Math.floor(setSell - tax - totalBuy);

            if (totalBuyEl) totalBuyEl.textContent = `Total buy cost: ${formatNum(totalBuy)} gp`;
            if (sellEl) sellEl.textContent = `Sell price: ${formatNum(setSell)} gp`;

        } else {
            const setCost = getBuyPrice(set.setId);

const { gross, tax } = calculatePieceSales(set);

gain = Math.floor(gross - tax - setCost);

if (totalBuyEl) totalBuyEl.textContent = `Total sell price: ${formatNum(gross)} gp`;
if (sellEl) sellEl.textContent = `Buy price: ${formatNum(setCost)} gp`;

        }

        const profitEl = container.querySelector(`#armor-setProfitRange-${idx}`);
        if (profitEl) {
            profitEl.innerHTML = `Profit (after tax): <span class="${
                gain >= 0 ? "profit-positive" : "profit-negative"
            }">${formatNum(gain)} gp</span>`;
        }

        const roiEl = container.querySelector(`#armor-setROI-${idx}`);
const roiBase =
    flippingMode === "piecesToSet"
        ? totalBuy
        : getBuyPrice(set.setId);

if (roiEl) {
    const roi = roiBase ? ((gain / roiBase) * 100).toFixed(2) : '0.00';
    roiEl.textContent = `ROI (after tax): ${roi}%`;
}

    });
}


// --- Update Volumes ---
function updateVolumes() {
    armorSetsData.forEach((set,idx)=>{
        set.items.forEach(item=>{
            const vol=Number(volumesData.data?.[item.id]||0);
            const pieceCard=document.querySelector(`#armor-set-${idx} .piece-card img[alt="${item.name}"]`)?.closest(".piece-card");
            if(pieceCard){
                const volEl=pieceCard.querySelector(".piece-volume");
                if(volEl) volEl.textContent=vol?`Daily vol: ${formatNum(vol)}`:"Daily vol: —";
            }
        });
        const setVol=Number(volumesData.data?.[set.setId]||0);
        const setVolEl=document.getElementById(`armor-setVolume-${idx}`);
        if(setVolEl) setVolEl.textContent=setVol?`Set daily vol: ${formatNum(setVol)}`:"Set daily vol: —";
    });
}

// --- F2P Filter (summary only) ---
function applyF2PFilter(onlyF2P){
    document.querySelectorAll("#armorSummaryTable tbody tr").forEach(row=>{
        const isF2P=row.getAttribute("data-f2p")==="true";
        row.style.display=(onlyF2P && !isF2P)?"none":"";
    });
}

// --- Summary Table ---
function getSortValue(col,row){
    switch(col){
        case"name": return row.name.toLowerCase();
        case"profit": return Number(row.profit);
        case"roi": return Number(row.roi);
        case"cost": return Number(row.totalCost);
        default: return row.name.toLowerCase();
    }
}
function sortSummary(list){
    const {column,direction}=summarySort;
    return list.sort((a,b)=>{
        const va=getSortValue(column,a), vb=getSortValue(column,b);
        if(va<vb) return direction==="asc"?-1:1;
        if(va>vb) return direction==="asc"?1:-1;
        return 0;
    });
}
function updateSortArrows(){
    const headers=document.querySelectorAll("#armorSummaryTable thead th");
    headers.forEach(th=>{
        const col=th.getAttribute("data-col");
        th.innerHTML=th.textContent.replace(/[\u25B2\u25BC]/g,'');
        if(col===summarySort.column){
            const arrow=summarySort.direction==="asc"?' \u25B2':' \u25BC';
            th.innerHTML+=arrow;
        }
    });
}
function updateSummaryTableBody() {
    const tbody = document.querySelector("#armorSummaryTable tbody");
    if (!tbody) return;

    const list = sortSummary(
        armorSetsData.map((s, i) => {
            const { profit, totalCost, roi } = calculateArmorProfit(s);
            return {
                profit,
                totalCost,
                roi,
                name: s.name,
                index: i
            };
        })
    );

    tbody.innerHTML = "";
    const rowTemplate = document.getElementById("summaryRowTemplate");

    list.forEach(l => {
        const rowEl = rowTemplate.content.cloneNode(true);
        const tr = rowEl.querySelector("tr");

        tr.dataset.index = l.index;
        tr.dataset.f2p = armorSetsData[l.index].isF2P;

        tr.querySelector(".summary-name").textContent = l.name;

        const profitEl = tr.querySelector(".summary-profit");
        profitEl.textContent = `${formatNum(l.profit)} gp`;
        profitEl.className = `summary-profit ${
            l.profit >= 0 ? "profit-positive" : "profit-negative"
        }`;

        tr.querySelector(".summary-roi").textContent = `${l.roi}%`;

        // ✅ single source of truth
        tr.querySelector(".summary-cost").textContent =
            `${formatNum(l.totalCost)} gp`;

        tr.addEventListener("click", () => {
            const idx = tr.dataset.index;
            window.location.hash = `#${armorSetsData[idx].setImgName}`;
            showSingleSet(idx);
        });

        tbody.appendChild(tr);
    });

    applyF2PFilter(showF2P);
}



function initSummaryTable(){
    const armorSummary=document.getElementById("armorSummary");
    if(!armorSummary) return;
    armorSummary.innerHTML=`
        <table class="summary-table" id="armorSummaryTable">
            <thead>
                <tr>
                    <th data-col="name">Armor Set</th>
                    <th data-col="profit">Profit per set</th>
                    <th data-col="roi">ROI %</th>
                    <th data-col="cost" id="summaryCostHeader">Total Pieces Cost</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>`;
    document.querySelectorAll("#armorSummaryTable thead th").forEach(th=>{
        th.addEventListener("click",()=>{
            const col=th.getAttribute("data-col");
            if(summarySort.column===col) summarySort.direction=summarySort.direction==="asc"?"desc":"asc";
            else { summarySort.column=col; summarySort.direction="asc"; }
            updateSummaryTableBody();
            updateSortArrows();
        });
    });
    updateSummaryTableBody();
    updateSortArrows();
}

function initF2PToggle() {
    const f2pFilter = document.getElementById("f2pFilter");
    if (!f2pFilter) return;

    f2pFilter.checked = showF2P;

    f2pFilter.addEventListener("change", function () {
        showF2P = this.checked;
        localStorage.setItem("f2pFilter", showF2P ? "true" : "false");
        applyF2PFilter(showF2P);
    });
}


// --- Show only single set by index ---
function showSingleSet(idx){
    document.querySelector(".main-content").style.display="none";
    document.getElementById("armorSummary").style.display="none";
    const armorSection=document.getElementById("armorSection");
    armorSection.style.display="block";
    armorSetsData.forEach((s,i)=>{
        const el=document.getElementById(`armor-set-${i}`);
        if(el) el.style.display=i==idx?"block":"none";
    });
    updateLeftControls(true);
    window.scrollTo({top:0,behavior:"smooth"});
}

// --- Flip Mode ---
function updateModeUI() {
    const btn = document.getElementById("modeToggle");
    if (btn) {
        btn.textContent =
            flippingMode === "piecesToSet"
                ? "Buy Pieces → Sell Set"
                : "Buy Set → Sell Pieces";
    }

    const costHeader = document.getElementById("summaryCostHeader");
    if (costHeader) {
        costHeader.textContent =
            flippingMode === "piecesToSet"
                ? "Total Pieces Cost"
                : "Total Set Cost";
    }

    updateSummaryTableBody();
    updateArmorPrices();
}


function initModeTabs() {
    const tabs = document.querySelectorAll(".mode-tab");

function setActiveTab(mode) {
    const armorSection = document.getElementById("armorSection");
    const isDetailView = armorSection.style.display !== "none"; // <-- check if we are viewing a set
    const visibleIdx = getVisibleSetIndex();

    flippingMode = mode;
    localStorage.setItem("flippingMode", flippingMode);

    tabs.forEach(tab =>
        tab.classList.toggle("active", tab.dataset.mode === mode)
    );

    // Rebuild layout + update prices
    createArmorSections();
    updateModeUI();
    updateArmorPrices();

    // Restore daily volumes immediately
    updateVolumes();

    // Only restore detail view if we were already viewing a set
    if (isDetailView && visibleIdx >= 0) {
        showSingleSet(visibleIdx);
    }
}





    tabs.forEach(tab => {
        tab.addEventListener("click", () => setActiveTab(tab.dataset.mode));
    });

    // Initialize active tab
    setActiveTab(flippingMode);
}





// --- Fetch Prices & Volumes ---
async function fetchLatestPrices(){
    try{
        const res=await fetch("https://prices.runescape.wiki/api/v1/osrs/latest");
        latestData=await res.json();
        updateArmorPrices();
        updateSummaryTableBody();
        await fetchDailyVolumes();
    } catch(e){ console.warn("Failed to fetch latest prices",e); }
}
async function fetchDailyVolumes(){
    try{
        const res=await fetch("https://prices.runescape.wiki/api/v1/osrs/volumes");
        volumesData=await res.json();
        updateVolumes();
    } catch(e){ console.warn("Failed to fetch volumes",e); }
}

// --- Hash handling ---
function handleHashChange(){
    const hash=window.location.hash.substring(1);
    if(!hash){
    document.querySelector(".main-content").style.display="block";
    document.getElementById("armorSummary").style.display="block";
    document.getElementById("armorSection").style.display="none";

    updateLeftControls(false);
    return;
}
    const idx=armorSetsData.findIndex(s=>s.setImgName===hash);
    if(idx>=0) showSingleSet(idx);
}
window.addEventListener('hashchange',handleHashChange);
document.getElementById('backBtn')?.addEventListener('click',()=>{window.location.hash='';});

// --- Init ---
function updateLeftControls(showDetail) {
    const backBtn = document.getElementById("backBtn");
    const f2pToggle = document.getElementById("f2pToggle");

    if (backBtn) backBtn.style.display = showDetail ? "inline-flex" : "none";
    if (f2pToggle) f2pToggle.style.display = showDetail ? "none" : "flex";
}




window.addEventListener("load", async () => {
    startRefreshTicker();
    updateRefreshIndicator();
    await fetchItemMappingOnce();
	
    createArmorSections();
    initSummaryTable();
    initF2PToggle();
	initModeTabs();

    document.getElementById("armorSection").style.display = "none";
    updateLeftControls(false);

    if (window.location.hash) handleHashChange();
    await fetchLatestPrices();
});


function initWhatsNew() {
    const btn = document.getElementById("whatsNewBtn");
    const popup = document.getElementById("whatsNewPopup");
    const closeBtn = document.getElementById("whatsNewClose");
    const list = document.getElementById("whatsNewList");

    if (!btn || !popup || !closeBtn || !list) return;

    // Populate the list safely, retrying if whatsNewItems isn't ready yet
    function populateList() {
        list.innerHTML = "";
        const items = window.whatsNewItems || [];
        if (items.length) {
            items.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                list.appendChild(li);
            });
        } else {
            const li = document.createElement("li");
            li.textContent = "No new updates at this time.";
            list.appendChild(li);
        }
    }

    // Retry a few times in case whatsNewItems isn't loaded yet
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = setInterval(() => {
        if (window.whatsNewItems || retryCount >= maxRetries) {
            populateList();
            clearInterval(retryInterval);
        }
        retryCount++;
    }, 100); // check every 100ms

    btn.addEventListener("click", () => popup.classList.add("visible"));
    closeBtn.addEventListener("click", () => popup.classList.remove("visible"));
    popup.addEventListener("click", (e) => { if (e.target === popup) popup.classList.remove("visible"); });
}

window.addEventListener("load", initWhatsNew);
