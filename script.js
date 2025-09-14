// --- Global Data ---
let latestData = {};
let itemMapping = {};
let summaryVisible = true; // controls visibility of current summary
let activeSection = "armor"; // "armor" or "potion"

// --- Armor Sets ---
const armorSets = [
    { name: "Sunfire Fanatic", items: [
        {name: "Helm", id: "28933", imgName: "Sunfire_fanatic_helm"},
        {name: "Cuirass", id: "28936", imgName: "Sunfire_fanatic_cuirass"},
        {name: "Chausses", id: "28939", imgName: "Sunfire_fanatic_chausses"}
    ], setId: "29424", setImgName: "Sunfire_fanatic_armour_set" },
    { name: "Blood Moon", items: [
        {name: "Chestplate", id: "29022", imgName: "Blood_moon_chestplate_detail"},
        {name: "Helm", id: "29028", imgName: "Blood_moon_helm_detail"},
        {name: "Tassets", id: "29025", imgName: "Blood_moon_tassets_detail"},
        {name: "Dual Macuahuitl", id: "28997", imgName: "Dual_macuahuitl_detail"}
    ], setId: "31136", setImgName: "Blood_moon_armour_set_detail" },
    { name: "Blue Moon", items: [
        {name: "Chestplate", id: "29013", imgName: "Blue_moon_chestplate_detail"},
        {name: "Helm", id: "29019", imgName: "Blue_moon_helm_detail"},
        {name: "Spear", id: "28988", imgName: "Blue_moon_spear_detail"},
        {name: "Tassets", id: "29016", imgName: "Blue_moon_tassets_detail"}
    ], setId: "31139", setImgName: "Blue_moon_armour_set_detail" },
    { name: "Eclipse Moon", items: [
        {name: "Chestplate", id: "29004", imgName: "Eclipse_moon_chestplate_detail"},
        {name: "Helm", id: "29010", imgName: "Eclipse_moon_helm_detail"},
        {name: "Tassets", id: "29007", imgName: "Eclipse_moon_tassets_detail"},
        {name: "Atlatl", id: "29000", imgName: "Eclipse_atlatl_detail"}
    ], setId: "31142", setImgName: "Eclipse_moon_armour_set_detail" }
];

// --- Utils ---
function formatNum(num){ return Number(num)?.toLocaleString() || '—'; }

// --- Fetch Mapping ---
async function fetchItemMappingOnce(){
    if(Object.keys(itemMapping).length>0) return;
    try{
        const res = await fetch("https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/mapping");
        const mapping = await res.json();
        mapping.forEach(item => itemMapping[String(item.id)] = item);
    }catch(err){ console.warn("Mapping fetch failed", err); }
}

// --- Armor Profit ---
function calculateArmorProfit(set){
    let totalCost = set.items.reduce((s,i)=>s+(latestData.data?.[i.id]?.low||0),0);
    const sellPrice = latestData.data?.[set.setId]?.high||0;
    const profit = sellPrice*0.98 - totalCost;
    return {profit, totalCost};
}

function createArmorSections(){
    const container = document.getElementById("armorSection");
    container.innerHTML = "";
    armorSets.forEach((set,i)=>{
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
                    <div>Total Pieces:</div>
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

// --- Potion Profit ---
function calculatePotionProfit(p){
    const id3=String(p.id3), id4=String(p.id4);
    const buy=latestData.data?.[id3]?.low, sell=latestData.data?.[id4]?.high;
    if(!buy||!sell) return {profit:0, roi:0, buy:0, sell:0, buyLimit:null, buyLimitProfit:null};
    const totalBuy=buy*4, totalSell=sell*3*0.98;
    const profit=totalSell-totalBuy, perDose=Math.round(profit/3);
    const mapped=itemMapping[id4], limit=mapped?.limit??null;
    return {profit:perDose, buy, sell, buyLimit:limit, buyLimitProfit:limit?perDose*limit:null};
}

function createPotionSections(){
    const container = document.getElementById("potionSection");
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

// --- Update Summaries ---
function updateSummaries(){
    const armorSummary = document.getElementById("armorSummary");
    const potionSummary = document.getElementById("potionSummary");

    if(armorSummary) armorSummary.style.display = (activeSection==="armor" && summaryVisible) ? "block" : "none";
    if(potionSummary) potionSummary.style.display = (activeSection==="potion" && summaryVisible) ? "block" : "none";

    if(activeSection==="armor" && armorSummary){
        const list = armorSets.map((s,i)=>({ ...calculateArmorProfit(s), name:s.name, index:i }))
            .sort((a,b)=>b.profit-a.profit);
        armorSummary.innerHTML = `<table class="summary-table">
            <thead><tr><th>Armor Set</th><th>Profit</th></tr></thead>
            <tbody>` +
            list.map(x=>`<tr class="summary-row" onclick="document.getElementById('armor-set-${x.index}').scrollIntoView({behavior:'smooth'})">
                <td>${x.name}</td><td>${formatNum(x.profit)} gp</td>
            </tr>`).join("") +
            `</tbody></table>`;
    }

    if(activeSection==="potion" && potionSummary){
        const list = potionData.map((p,i)=>({ ...calculatePotionProfit(p), name:p.name, index:i }))
            .sort((a,b)=>(b.buyLimitProfit||0)-(a.buyLimitProfit||0));
        potionSummary.innerHTML = `<table class="summary-table">
            <thead><tr><th>Potion</th><th>Profit @ Buy Limit</th></tr></thead>
            <tbody>` +
            list.map(x=>`<tr class="summary-row" onclick="document.getElementById('potion-${x.index}').scrollIntoView({behavior:'smooth'})">
                <td>${x.name}</td><td>${x.buyLimitProfit?formatNum(x.buyLimitProfit)+" gp":"—"}</td>
            </tr>`).join("") +
            `</tbody></table>`;
    }
}

// --- Update Potions ---
function updatePotionPrices(){
    potionData.forEach((p,i)=>{
        const {profit,buy,sell,buyLimit,buyLimitProfit} = calculatePotionProfit(p);
        document.getElementById(`p3-${p.id3}`).innerText=buy?formatNum(buy)+" gp":"—";
        document.getElementById(`p4-${p.id4}`).innerText=sell?formatNum(sell)+" gp":"—";
        const box = document.getElementById(`potion-profit-${i}`);
        if(box){
            let html=`Profit per dose: ${formatNum(profit)} gp`;
            if(buyLimit) html+=`<br>Profit @ limit (${formatNum(buyLimit)}): ${formatNum(buyLimitProfit)} gp`;
            box.innerHTML=html;
        }
        const bl = document.getElementById(`p-buyLimit-${i}`);
        if(bl) bl.innerText=buyLimit?`(Buy limit: ${formatNum(buyLimit)})`:"(Buy limit: —)";
    });
}

// --- Fetch Prices ---
async function fetchPrices(){
    try{
        await fetchItemMappingOnce();
        const res = await fetch("https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/latest");
        latestData = await res.json();

        if(activeSection==="armor"){
            armorSets.forEach((s,i)=>{
                let total=0;
                s.items.forEach(it=>{
                    const price = latestData.data[it.id]?.low||0;
                    document.getElementById(`armor-${it.id}`).innerText=formatNum(price)+" gp";
                    total+=price;
                });
                document.getElementById(`armor-total-${i}`).innerText=formatNum(total);
                document.getElementById(`armor-setPrice-${i}`).innerText=formatNum(latestData.data[s.setId]?.high||0);
            });
        }

        if(activeSection==="potion") updatePotionPrices();

        updateSummaries();
        document.getElementById("lastRefreshed").innerText="Last Refreshed: "+new Date().toLocaleTimeString();
    }catch(e){console.error(e);}
}

// --- Show Sections ---
function showArmorFlips(){
    activeSection = "armor";
    document.getElementById("armorSection").style.display="block";
    document.getElementById("potionSection").style.display="none";
    createArmorSections();
    summaryVisible = true;
    document.getElementById("toggleSummary").textContent = "Hide Summary ▲";
    fetchPrices();
}

function showPotionFlips(){
    activeSection = "potion";
    document.getElementById("armorSection").style.display="none";
    document.getElementById("potionSection").style.display="block";
    createPotionSections();
    summaryVisible = true;
    document.getElementById("toggleSummary").textContent = "Hide Summary ▲";
    fetchPrices();
}

// --- Toggle Summary ---
const toggleSummaryBtn = document.getElementById("toggleSummary");
if(toggleSummaryBtn){
    toggleSummaryBtn.addEventListener("click", ()=>{
        summaryVisible = !summaryVisible;
        toggleSummaryBtn.textContent = summaryVisible ? "Hide Summary ▲" : "Show Summary ▼";
        updateSummaries();
    });
}

// --- Init ---
document.getElementById("armorBtn").addEventListener("click",()=>showArmorFlips());
document.getElementById("potionBtn").addEventListener("click",()=>showPotionFlips());

showArmorFlips();
setInterval(fetchPrices,60000);
