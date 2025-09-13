// --- Global Data ---
let latestData = {};

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

// --- Utility ---
function formatNum(num){ return num.toLocaleString(); }

// --- Armor Flip Functions ---
function calculateArmorProfit(set){
    let piecesTotal = set.items.reduce((sum,item)=>sum+(latestData.data[item.id]?.low || 0),0);
    const setSell = latestData.data[set.setId]?.high || 0;
    const setSellAfterTax = setSell * 0.98;
    const profit = setSellAfterTax - piecesTotal;
    const roi = piecesTotal ? ((profit/piecesTotal)*100).toFixed(2) : 0;
    return {profit, roi, cost: piecesTotal};
}

function createArmorSections(){
    const container = document.getElementById("armorSection");
    container.innerHTML = "";
    armorSets.forEach((set,index)=>{
        const div = document.createElement("div");
        div.className = "set-wrapper";
        div.id = `armor-set-${index}`;

        div.innerHTML = `
            <div class="set-title">${set.name} Set</div>
            <div class="cards">
                ${set.items.map(item=>`
                    <div class="card">
                        <div class="item-label">
                            <img class="item-icon" src="https://oldschool.runescape.wiki/images/${item.imgName}.png" alt="${item.name}"> ${item.name}
                        </div>
                        <div id="armor-${item.id}">Loading...</div>
                    </div>`).join("")}
                <div class="card total">
                    <div>Total Pieces Cost:</div>
                    <div id="armor-total-${index}">Loading...</div>
                </div>
                <div class="card total" onclick="window.open('https://prices.runescape.wiki/osrs/item/${set.setId}','_blank')">
                    <div class="item-label">
                        <img class="item-icon" src="https://oldschool.runescape.wiki/images/${set.setImgName}.png" alt="${set.name}"> Set Price:
                    </div>
                    <div id="armor-setPrice-${index}">Loading...</div>
                </div>
            </div>
            <div class="profit-box" id="armor-profit-${index}">Loading...</div>
            <div>
                <label>Number of Sets: </label>
                <input type="number" id="armor-numSets-${index}" value="1" min="1">
                <button onclick="updateArmorProfit(${index})">Refresh</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function updateArmorProfit(index){
    const set = armorSets[index];
    const numSets = parseInt(document.getElementById(`armor-numSets-${index}`).value);
    const {profit, roi} = calculateArmorProfit(set);
    document.getElementById(`armor-profit-${index}`).innerHTML =
        `Profit per set (after 2% tax): <span>${formatNum(profit)} gp</span><br>`+
        `Total profit for ${numSets} set(s): <span>${formatNum(profit*numSets)} gp</span><br>`+
        `ROI per set: <span>${roi}%</span>`;
}

// --- Potion Flip Functions ---
function calculatePotionProfit(potion){
    const buyData = latestData.data[potion.id3]; // 3-dose
    const sellData = latestData.data[potion.id4]; // 4-dose
    if(!buyData || !sellData) return {profit:0, roi:0, buy:0, sell:0};

    const totalBuy = buyData.low * 4;                 // cost for 4 3-dose
    const totalSell = sellData.high * 3 * 0.98;       // revenue from 3 4-dose with 2% tax
    const totalProfit = totalSell - totalBuy;
    const profitPerDose = totalProfit / 3;            // divide by 3 sold 4-dose potions
    const roi = totalBuy ? ((totalProfit / totalBuy) * 100).toFixed(2) : 0;

    return {profit: profitPerDose, roi, buy: buyData.low, sell: sellData.high};
}

function createPotionSections(){
    const container = document.getElementById("potionSection");
    container.innerHTML = "";
    potionData.forEach((potion,index)=>{
        const div = document.createElement("div");
        div.className = "set-wrapper";
        div.id = `potion-${index}`;
        div.innerHTML = `
            <div class="set-title">${potion.name}</div>
            <div class="cards">
                <div class="card">
                    <div class="item-label">
                        <img class="item-icon" src="https://oldschool.runescape.wiki/images/${potion.imgName}(3)_detail.png" alt="${potion.name}"> Buy 3 Dose
                    </div>
                    <div id="p3-${potion.id3}">Loading...</div>
                </div>
                <div class="card">
                    <div class="item-label">
                        <img class="item-icon" src="https://oldschool.runescape.wiki/images/${potion.imgName}(4)_detail.png" alt="${potion.name}"> Sell 4 Dose
                    </div>
                    <div id="p4-${potion.id4}">Loading...</div>
                </div>
            </div>
            <div class="profit-box" id="potion-profit-${index}">Loading...</div>
        `;
        container.appendChild(div);
    });
}

function updatePotionPrices(){
    potionData.forEach((potion,index)=>{
        const {profit, roi, buy, sell} = calculatePotionProfit(potion);

        const p3 = document.getElementById(`p3-${potion.id3}`);
        const p4 = document.getElementById(`p4-${potion.id4}`);
        const profitBox = document.getElementById(`potion-profit-${index}`);

        if(p3) p3.innerText = buy ? formatNum(buy)+' gp' : 'Loading...';
        if(p4) p4.innerText = sell ? formatNum(sell)+' gp' : 'Loading...';
        if(profitBox) profitBox.innerHTML =
            `Profit per single dose (after tax): <span>${formatNum(profit)} gp</span><br>`+
            `ROI: <span>${roi}%</span>`;
    });
}

// --- Fetch Prices ---
async function fetchPrices(){
    try{
        const res = await fetch("https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/latest");
        latestData = await res.json();

        // Update Armor
        if(document.getElementById("armorSection").style.display !== "none"){
            armorSets.forEach((set,index)=>{
                let piecesTotal = 0;
                set.items.forEach(item=>{
                    const price = latestData.data[item.id]?.low || 0;
                    document.getElementById(`armor-${item.id}`).innerText = formatNum(price)+' gp';
                    piecesTotal += price;
                });
                document.getElementById(`armor-total-${index}`).innerText = formatNum(piecesTotal);
                const setPrice = latestData.data[set.setId]?.high || 0;
                document.getElementById(`armor-setPrice-${index}`).innerText = formatNum(setPrice);
                updateArmorProfit(index);
            });
        }

        // Update Potions
        if(document.getElementById("potionSection").style.display !== "none"){
            updatePotionPrices();
        }

        const now = new Date();
        document.getElementById("lastRefreshed").innerText = `Last Refreshed: ${now.toLocaleTimeString()}`;
    } catch(err){ console.error(err); }
}

// --- Mode Switching ---
function showArmorFlips(){
    document.getElementById("armorSection").style.display = "block";
    document.getElementById("potionSection").style.display = "none";
    createArmorSections();
    fetchPrices();
}

function showPotionFlips(){
    document.getElementById("armorSection").style.display = "none";
    document.getElementById("potionSection").style.display = "block";
    createPotionSections();
    fetchPrices();
}

// --- Event Listeners ---
document.getElementById("armorBtn").addEventListener("click", ()=>{
    document.getElementById("armorBtn").classList.add("active");
    document.getElementById("potionBtn").classList.remove("active");
    showArmorFlips();
});

document.getElementById("potionBtn").addEventListener("click", ()=>{
    document.getElementById("potionBtn").classList.add("active");
    document.getElementById("armorBtn").classList.remove("active");
    showPotionFlips();
});

// --- Initial Load ---
showArmorFlips();
setInterval(fetchPrices, 60000);
