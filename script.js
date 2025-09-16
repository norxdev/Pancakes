// --- Global Data ---
let latestData = {};
let itemMapping = {};
let summaryVisible = true; // controls visibility of current summary
let activeSection = "armor"; // "armor", "potion", or "misc"
let dailyData = {};  // holds 24h volume data

// --- Utils ---
function formatNum(num){ return Number(num)?.toLocaleString() || '—'; }

// --- Fetch Mapping ---
async function fetchItemMappingOnce(){
    if(Object.keys(itemMapping).length > 0) return;
    try{
        const res = await fetch("https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/mapping");
        const mapping = await res.json();
        mapping.forEach(item => itemMapping[String(item.id)] = item);
    }catch(err){ console.warn("Mapping fetch failed", err); }
}

// --- Profit Calculations ---
function calculateArmorProfit(set){
    let totalCost = set.items.reduce((s,i)=>s+(latestData.data?.[i.id]?.low||0),0);
    const sellPrice = latestData.data?.[set.setId]?.high||0;
    const profit = Math.round(sellPrice*0.98 - totalCost);
    const roi = totalCost ? ((profit / totalCost) * 100).toFixed(2) : 0;
    return {profit, totalCost, roi};
}

function calculatePotionProfit(p){
    const id3 = String(p.id3), id4 = String(p.id4);
    const buy = latestData.data?.[id3]?.low;
    const sell = latestData.data?.[id4]?.high;

    if(buy === undefined || sell === undefined){
        return {profit:0, roi:0, buy:0, sell:0, buyLimit:null, buyLimitProfit:null};
    }

    const totalBuy = buy * 4;
    const totalSell = sell * 3 * 0.98;
    const profit = totalSell - totalBuy;
    const perDose = Math.round(profit/3);
    const mapped = itemMapping[id4];
    const limit = mapped?.limit ?? null;

    return {profit: perDose, buy, sell, buyLimit: limit, buyLimitProfit: limit ? perDose*limit : null};
}

function calculateMiscProfit(item){
    const buy = latestData.data?.[item.id]?.low || 0;
    const sell = latestData.data?.[item.id]?.high || 0;
    const profit = Math.round(sell * 0.98 - buy);
    const mapped = itemMapping[item.id];
    const limit = mapped?.limit ?? null;
    return {profit, buy, sell, buyLimit: limit, buyLimitProfit: limit ? profit*limit : null};
}

// --- Section Rendering ---
function createArmorSections(){
    const container = document.getElementById("armorSection");
    if(!container) return;
    container.innerHTML = "";
    armorSetsData.forEach((set,i)=>{
        const div = document.createElement("div");
        div.className="set-wrapper";
        div.id=`armor-set-${i}`;
        div.innerHTML=`
            <div class="set-title">${set.name} Set</div>
            <div class="cards">
                ${set.items.map(it=>`
                    <a class="card" href="https://prices.runescape.wiki/osrs/item/${it.id}" target="_blank">
                        <div class="item-label">
                            <img class="item-icon" src="https://oldschool.runescape.wiki/images/${it.imgName}.png">${it.name}
                        </div>
                        <div id="armor-${it.id}">Loading...</div>
                    </a>`).join("")}
                <div class="card total">
                    <div>Total Pieces Cost:</div>
                    <div id="armor-total-${i}">Loading...</div>
                </div>
                <a class="card total" href="https://prices.runescape.wiki/osrs/item/${set.setId}" target="_blank">
                    <div class="item-label">
                        <img class="item-icon" src="https://oldschool.runescape.wiki/images/${set.setImgName}.png">${set.name} Set Price
                    </div>
                    <div id="armor-setPrice-${i}">Loading...</div>
                </a>
            </div>
            <div class="profit-box" id="armor-profit-${i}">Loading...</div>`;
        container.appendChild(div);
    });
}

function createPotionSections(){
    const container = document.getElementById("potionSection");
    if(!container) return;
    container.innerHTML="";
    potionData.forEach((p,i)=>{
        const div = document.createElement("div");
        div.className="set-wrapper";
        div.id=`potion-${i}`;
        div.innerHTML=`
            <div class="set-title">${p.name}
                <span id="p-buyLimit-${i}" class="buy-limit">(Buy limit: —)</span>
            </div>
            <div class="cards">
                <a class="card" href="https://prices.runescape.wiki/osrs/item/${p.id3}" target="_blank">
                    <div class="item-label"><img class="item-icon" src="https://oldschool.runescape.wiki/images/${p.imgName}(3)_detail.png">Buy 3-dose</div>
                    <div id="p3-${p.id3}">Loading...</div>
                </a>
                <a class="card" href="https://prices.runescape.wiki/osrs/item/${p.id4}" target="_blank">
                    <div class="item-label"><img class="item-icon" src="https://oldschool.runescape.wiki/images/${p.imgName}(4)_detail.png">Sell 4-dose</div>
                    <div id="p4-${p.id4}">Loading...</div>
                </a>
            </div>
            <div class="profit-box" id="potion-profit-${i}">Loading...</div>`;
        container.appendChild(div);
    });
}

function createMiscSections(){
    const container = document.getElementById("miscSection");
    if(!container) return;
    container.innerHTML="";
    miscItemsData.forEach((item,i)=>{
        const div = document.createElement("div");
        div.className="set-wrapper";
        div.id=`misc-${i}`;
        div.innerHTML=`
            <div class="set-title">${item.name}
                <span id="m-buyLimit-${i}" class="buy-limit">(Buy limit: —)</span>
            </div>
            <div class="cards">
                <a class="card" href="https://prices.runescape.wiki/osrs/item/${item.id}" target="_blank">
                    <div class="item-label">
                        <img class="item-icon" src="https://oldschool.runescape.wiki/images/${item.imgName}.png">${item.name}
                    </div>
                    <div id="m-price-${item.id}">Loading...</div>
                </a>
            </div>
            <div class="profit-box" id="misc-profit-${i}">Loading...</div>`;
        container.appendChild(div);
    });
}

// --- Update Prices ---
function updateArmorPrices(){
    armorSetsData.forEach((set, i) => {
        let totalCost = 0;
        set.items.forEach(item => {
            const low = latestData.data?.[item.id]?.low || 0;
            totalCost += low;
            const elem = document.getElementById(`armor-${item.id}`);
            if(elem) elem.innerText = low ? formatNum(low) + " gp" : "—";
        });
        const totalElem = document.getElementById(`armor-total-${i}`);
        if(totalElem) totalElem.innerText = totalCost ? formatNum(totalCost) + " gp" : "—";
        const setPrice = latestData.data?.[set.setId]?.high || 0;
        const setPriceElem = document.getElementById(`armor-setPrice-${i}`);
        if(setPriceElem) setPriceElem.innerText = setPrice ? formatNum(setPrice) + " gp" : "—";
        const profitElem = document.getElementById(`armor-profit-${i}`);
        if(profitElem){
            const profit = Math.round(setPrice * 0.98 - totalCost);
            profitElem.innerText = profit ? formatNum(profit) + " gp" : "—";
        }
    });
}

function updatePotionPrices(){
    potionData.forEach((p,i)=>{
        const {profit,buy,sell,buyLimit,buyLimitProfit} = calculatePotionProfit(p);
        const p3Elem = document.getElementById(`p3-${p.id3}`);
        const p4Elem = document.getElementById(`p4-${p.id4}`);
        const profitBox = document.getElementById(`potion-profit-${i}`);
        const bl = document.getElementById(`p-buyLimit-${i}`);
        if(p3Elem) p3Elem.innerText = buy ? formatNum(buy)+" gp" : "—";
        if(p4Elem) p4Elem.innerText = sell ? formatNum(sell)+" gp" : "—";
        if(profitBox){
            let html = `Profit per dose: ${formatNum(profit)} gp`;
            if(buyLimit) html += `<br>Profit @ limit (${formatNum(buyLimit)}): ${formatNum(buyLimitProfit)} gp`;
            profitBox.innerHTML = html;
        }
        if(bl) bl.innerText = buyLimit ? `(Buy limit: ${formatNum(buyLimit)})` : "(Buy limit: —)";
    });
}

function updateMiscPrices(){
    miscItemsData.forEach((item,i)=>{
        const {profit,buy,sell,buyLimit,buyLimitProfit} = calculateMiscProfit(item);
        const priceElem = document.getElementById(`m-price-${item.id}`);
        const profitBox = document.getElementById(`misc-profit-${i}`);
        const bl = document.getElementById(`m-buyLimit-${i}`);
        if(priceElem) priceElem.innerText = sell ? formatNum(sell) + " gp" : "—";
        if(profitBox){
            let html = `Profit per item: ${formatNum(profit)} gp`;
            if(buyLimit) html += `<br>Profit @ limit (${formatNum(buyLimit)}): ${formatNum(buyLimitProfit)} gp`;
            profitBox.innerHTML = html;
        }
        if(bl) bl.innerText = buyLimit ? `(Buy limit: ${formatNum(buyLimit)})` : "(Buy limit: —)";
    });
}

// --- Update Summaries ---
function updateSummaries(){
    const armorSummary = document.getElementById("armorSummary");
    const potionSummary = document.getElementById("potionSummary");
    const miscSummary = document.getElementById("miscSummary");

    if(armorSummary) armorSummary.style.display = (activeSection==="armor" && summaryVisible) ? "block" : "none";
    if(potionSummary) potionSummary.style.display = (activeSection==="potion" && summaryVisible) ? "block" : "none";
    if(miscSummary) miscSummary.style.display = (activeSection==="misc" && summaryVisible) ? "block" : "none";

    // Armor summary
    if(activeSection==="armor" && armorSummary){
        const list = armorSetsData.map((s,i)=>{
            const calc = calculateArmorProfit(s);
            const pieceVolumes = s.items.map(it => {
                const d = dailyData.data?.[it.id];
                return d?.highPriceVolume || d?.lowPriceVolume || 0;
            });
            const dailyVol = pieceVolumes.length ? Math.min(...pieceVolumes) : 0;
            return { ...calc, name:s.name, index:i, dailyVol };
        }).sort((a,b)=>b.profit-a.profit);

        armorSummary.innerHTML = `<table class="summary-table">
            <thead><tr><th>Armor Set</th><th>Profit per Set</th><th>Daily Volume</th></tr></thead>
            <tbody>` +
            list.map(x=>`<tr class="summary-row" onclick="document.getElementById('armor-set-${x.index}')?.scrollIntoView({behavior:'smooth'})">
                <td>${x.name}</td>
                <td>${formatNum(x.profit)} gp</td>
                <td>${formatNum(x.dailyVol)}</td>
            </tr>`).join("") +
            `</tbody></table>`;
    }

    // Potion summary
    if(activeSection==="potion" && potionSummary){
        const list = potionData.map((p,i)=>{
            const calc = calculatePotionProfit(p);
            const d = dailyData.data?.[p.id4];
            const dailyVol = d?.highPriceVolume || d?.lowPriceVolume || 0;
            return { ...calc, name:p.name, index:i, dailyVol };
        }).sort((a,b)=>(b.buyLimitProfit||0)-(a.buyLimitProfit||0));

        potionSummary.innerHTML = `<table class="summary-table">
            <thead><tr><th>Potion</th><th>Profit @ Buy Limit</th><th>Daily Volume</th></tr></thead>
            <tbody>` +
            list.map(x=>`<tr class="summary-row" onclick="document.getElementById('potion-${x.index}')?.scrollIntoView({behavior:'smooth'})">
                <td>${x.name}</td>
                <td>${x.buyLimitProfit?formatNum(x.buyLimitProfit)+" gp":"—"}</td>
                <td>${formatNum(x.dailyVol)}</td>
            </tr>`).join("") +
            `</tbody></table>`;
    }

    // Misc summary
    if(activeSection==="misc" && miscSummary){
        const list = miscItemsData.map((item,i)=>{
            const calc = calculateMiscProfit(item);
            const d = dailyData.data?.[item.id];
            const dailyVol = d?.highPriceVolume || d?.lowPriceVolume || 0;
            return { ...calc, name:item.name, index:i, dailyVol };
        }).sort((a,b)=>(b.buyLimitProfit||0)-(a.buyLimitProfit||0));

        miscSummary.innerHTML = `<table class="summary-table">
            <thead><tr><th>Item</th><th>Profit @ Buy Limit</th><th>Daily Volume</th></tr></thead>
            <tbody>` +
            list.map(x=>`<tr class="summary-row" onclick="document.getElementById('misc-${x.index}')?.scrollIntoView({behavior:'smooth'})">
                <td>${x.name}</td>
                <td>${x.buyLimitProfit?formatNum(x.buyLimitProfit)+" gp":"—"}</td>
                <td>${formatNum(x.dailyVol)}</td>
            </tr>`).join("") +
            `</tbody></table>`;
    }
}

// --- Header Button Active ---
function updateActiveHeaderButton(section){
    document.getElementById("armorBtn")?.classList.toggle("active", section==="armor");
    document.getElementById("potionBtn")?.classList.toggle("active", section==="potion");
    document.getElementById("miscBtn")?.classList.toggle("active", section==="misc");
}

// --- Section Switch ---
function showArmorFlips(){
    activeSection = "armor";
    sessionStorage.setItem("activeSection","armor");
    document.getElementById("armorSection")?.style.setProperty("display","block");
    document.getElementById("potionSection")?.style.setProperty("display","none");
    document.getElementById("miscSection")?.style.setProperty("display","none");
    createArmorSections();
    document.getElementById("toggleSummary").textContent = summaryVisible ? "Hide Summary ▲" : "Show Summary ▼";
    updateActiveHeaderButton("armor");
    updateSummaries();
    fetchPrices();
}

function showPotionFlips(){
    activeSection = "potion";
    sessionStorage.setItem("activeSection","potion");
    document.getElementById("armorSection")?.style.setProperty("display","none");
    document.getElementById("potionSection")?.style.setProperty("display","block");
    document.getElementById("miscSection")?.style.setProperty("display","none");
    createPotionSections();
    document.getElementById("toggleSummary").textContent = summaryVisible ? "Hide Summary ▲" : "Show Summary ▼";
    updateActiveHeaderButton("potion");
    updateSummaries();
    fetchPrices();
}

function showMiscFlips(){
    activeSection = "misc";
    sessionStorage.setItem("activeSection","misc");
    document.getElementById("armorSection")?.style.setProperty("display","none");
    document.getElementById("potionSection")?.style.setProperty("display","none");
    document.getElementById("miscSection")?.style.setProperty("display","block");
    createMiscSections();
    document.getElementById("toggleSummary").textContent = summaryVisible ? "Hide Summary ▲" : "Show Summary ▼";
    updateActiveHeaderButton("misc");
    updateMiscPrices();
    updateSummaries();
}

// --- Fetch Prices ---
async function fetchPrices(){
    try{
        await fetchItemMappingOnce();

        const [latestRes, dailyRes] = await Promise.all([
            fetch("https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/latest"),
            fetch("https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/24h")
        ]);

        latestData = await latestRes.json();
        dailyData = await dailyRes.json();  

        if(activeSection==="armor") updateArmorPrices();
        if(activeSection==="potion") updatePotionPrices();
        if(activeSection==="misc") updateMiscPrices();
        updateSummaries();

        const ref = document.getElementById("lastRefreshed");
        if(ref) ref.innerText="Last Refreshed: "+new Date().toLocaleTimeString();

    }catch(e){ 
        console.error(e); 
    }
}

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('backToTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.getElementById('refreshData')?.addEventListener('click', () => fetchPrices());
    document.getElementById("toggleSummary")?.addEventListener("click", ()=>{
        summaryVisible = !summaryVisible;
        sessionStorage.setItem("summaryVisible", summaryVisible?"true":"false");
        document.getElementById("toggleSummary").textContent = summaryVisible ? "Hide Summary ▲" : "Show Summary ▼";
        updateSummaries();
    });
    const savedSection = sessionStorage.getItem("activeSection");
    const savedSummary = sessionStorage.getItem("summaryVisible");
    if(savedSection) activeSection = savedSection;
    if(savedSummary) summaryVisible = savedSummary === "true";
    document.getElementById("armorBtn")?.addEventListener("click", showArmorFlips);
    document.getElementById("potionBtn")?.addEventListener("click", showPotionFlips);
    document.getElementById("miscBtn")?.addEventListener("click", showMiscFlips);
    if(activeSection==="armor") showArmorFlips(); 
    else if(activeSection==="potion") showPotionFlips();
    else showMiscFlips();
    setInterval(fetchPrices,60000);
});
