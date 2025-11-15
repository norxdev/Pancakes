// --- Global Data ---
let latestData = {};
let volumesData = {};
let itemMapping = {};
let refreshInterval = null;
let lastRefresh = Date.now();
let showF2P = localStorage.getItem("f2pFilter") === "true";

// --- Sorting State ---
let summarySort = { column: "profit", direction: "desc" };

// --- Utils ---
function formatNum(num) { return Number(num)?.toLocaleString() || '—'; }
function getF2PIcon(isF2P) {
    return isF2P ? `<img src="https://oldschool.runescape.wiki/images/F2P_icon.png" alt="F2P">` : '';
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
    const totalCost = set.items.reduce((s,i)=>s+(latestData.data?.[i.id]?.low||0),0);
    const sellPrice = Number(latestData.data?.[set.setId]?.high)||0;
    const tax = Math.min(sellPrice*0.02,5_000_000);
    const profit = Math.round(sellPrice-tax-totalCost);
    const roi = totalCost ? ((profit/totalCost)*100).toFixed(2) : 0;
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
    const container=document.getElementById("armorSection");
    if(!container) return;
    container.innerHTML="";
    armorSetsData.forEach((set,idx)=>{
        const div=document.createElement("div");
        div.className="set-wrapper";
        div.id=`armor-set-${idx}`;
        div.dataset.f2p=set.isF2P?"true":"false";
        div.style.display="none";

        // Full clickable piece image + div
        const piecesList=`<div class="pieces-list">${set.items.map(it=>`
            <div class="piece-card" onclick="window.open('https://prices.runescape.wiki/osrs/item/${it.id}','_blank')">
                <div class="piece-left">
                    <div class="piece-icon-box">
                        <img src="https://oldschool.runescape.wiki/images/${it.imgName}.png" 
                            alt="${it.name}" loading="lazy" class="piece-icon">
                    </div>
                    <div class="piece-info">
                        <div class="piece-name">${it.name}</div>
                        <div class="piece-volume">Loading volume...</div>
                    </div>
                </div>
                <div class="piece-price-buy">Loading...</div>
            </div>`).join("")}</div>`;

        const totalBuyDiv=`<div class="set-total-buy">Loading total buy cost...</div>`;

        const setBottom=`<div class="set-main-card">
            <div class="piece-card set-main-info" onclick="window.open('https://prices.runescape.wiki/osrs/item/${set.setId}','_blank')">
                <div class="piece-left">
                    <div class="piece-icon-box">
                        <img src="https://oldschool.runescape.wiki/images/${set.setImgName}.png"
                            alt="${set.name}" loading="lazy">
                    </div>
                    <div class="piece-info">
                        <div class="piece-name">${set.name}</div>
                        <div class="piece-volume" id="armor-setVolume-${idx}">Loading set volume...</div>
                    </div>
                </div>
                <div class="piece-price-buy" id="armor-setSell-${idx}">Loading set sell price...</div>
            </div>
            <div class="set-bottom-summary">
                <div id="armor-setProfitRange-${idx}" class="set-profit">Loading profit after tax...</div>
                <div id="armor-setROI-${idx}" class="set-roi">Loading ROI...</div>
            </div>
        </div>`;

        div.innerHTML=piecesList+totalBuyDiv+setBottom;
        container.appendChild(div);
    });
}

// --- Update Armor Prices ---
function updateArmorPrices() {
    armorSetsData.forEach((set,idx)=>{
        const container=document.getElementById(`armor-set-${idx}`);
        if(!container) return;
        let totalBuy=0;
        const setSell=Number(latestData.data?.[set.setId]?.high)||0;
        const pieceCards=container.querySelectorAll(".pieces-list .piece-card");
        pieceCards.forEach((pieceCard,i)=>{
            const item=set.items[i];
            const low=Number(latestData.data?.[item.id]?.low||0);
            const vol=Number(volumesData.data?.[item.id]||0);
            totalBuy+=low;
            const buyEl=pieceCard.querySelector(".piece-price-buy");
            if(buyEl) buyEl.textContent=low?`Buy Price: ${formatNum(low)} gp`:"Buy Price: —";
            const volEl=pieceCard.querySelector(".piece-volume");
            if(volEl) volEl.textContent=vol?`Daily vol: ${formatNum(vol)}`:"Daily vol: —";
        });
        const totalBuyEl=container.querySelector(".set-total-buy");
        if(totalBuyEl) totalBuyEl.textContent=`Total buy cost: ${formatNum(totalBuy)} gp`;
        const tax=Math.min(setSell*0.02,5_000_000);
        const gain=setSell-tax-totalBuy;
        const sellEl=container.querySelector(`#armor-setSell-${idx}`);
        if(sellEl) sellEl.textContent=`Sell price: ${formatNum(setSell)} gp`;
        const profitEl=container.querySelector(`#armor-setProfitRange-${idx}`);
        if(profitEl){
            const gainColor=gain>=0?"profit-positive":"profit-negative";
            profitEl.innerHTML=`Set profit (after tax): <span class="${gainColor}">${formatNum(gain)} gp</span>`;
        }
        const roiEl=container.querySelector(`#armor-setROI-${idx}`);
        if(roiEl){
            const roiAfterTax=totalBuy?((gain/totalBuy)*100).toFixed(2):0;
            roiEl.textContent=`ROI (after tax): ${roiAfterTax}%`;
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
function updateSummaryTableBody(){
    const tbody=document.querySelector("#armorSummaryTable tbody");
    if(!tbody) return;
    let list=armorSetsData.map((s,i)=>({...calculateArmorProfit(s), name:s.name, index:i}));
    list=sortSummary(list);
    tbody.innerHTML=list.map(l=>`
        <tr data-index="${l.index}" data-f2p="${armorSetsData[l.index].isF2P}">
            <td>${l.name}</td>
            <td class="${l.profit>=0?'profit-positive':'profit-negative'}">${formatNum(l.profit)} gp</td>
            <td>${l.roi}%</td>
            <td>${formatNum(l.totalCost)} gp</td>
        </tr>`).join("");
    tbody.querySelectorAll("tr").forEach(row=>{
        row.addEventListener("click",()=>{
            const idx=row.getAttribute("data-index");
            window.location.hash=`#${armorSetsData[idx].setImgName}`;
            showSingleSet(idx);
        });
    });
}
function initSummaryTable(){
    const armorSummary=document.getElementById("armorSummary");
    if(!armorSummary) return;
    armorSummary.innerHTML=`
        <label style="display:block; margin-bottom:8px;">
            <input type="checkbox" id="f2pFilter"> Show only F2P sets
        </label>
        <table class="summary-table" id="armorSummaryTable">
            <thead>
                <tr>
                    <th data-col="name">Armor Set</th>
                    <th data-col="profit">Profit per set</th>
                    <th data-col="roi">ROI %</th>
                    <th data-col="cost">Total Pieces Cost</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>`;
    const f2pFilter=document.getElementById("f2pFilter");
    f2pFilter.checked=showF2P;
    f2pFilter.addEventListener("change",function(){
        showF2P=this.checked;
        localStorage.setItem("f2pFilter",this.checked?"true":"false");
        applyF2PFilter(this.checked);
    });
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
    document.getElementById('backBtn').style.display='inline-flex';
    window.scrollTo({top:0,behavior:"smooth"});
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
    if(!hash){ document.querySelector(".main-content").style.display="block";
        document.getElementById("armorSummary").style.display="block";
        document.getElementById("armorSection").style.display="none";
        document.getElementById('backBtn').style.display='none'; return; }
    const idx=armorSetsData.findIndex(s=>s.setImgName===hash);
    if(idx>=0) showSingleSet(idx);
}
window.addEventListener('hashchange',handleHashChange);
document.getElementById('backBtn')?.addEventListener('click',()=>{window.location.hash='';});

// --- Init ---
window.addEventListener("load",async()=>{
    startRefreshTicker();
    updateRefreshIndicator();
    await fetchItemMappingOnce();
    createArmorSections();
    initSummaryTable();
    document.getElementById("armorSection").style.display="none";

    // Handle hash first
    if(window.location.hash) handleHashChange();

    await fetchLatestPrices();
});
