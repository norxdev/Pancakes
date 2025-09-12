const setsData = [
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

let latestData = {};

function formatNum(num){ return num.toLocaleString(); }

function createOverview(){
    const overviewEl = document.getElementById("overview");
    overviewEl.innerHTML = "";
    setsData.forEach((set,index)=>{
        const profitPerSet = calculateProfit(set).profit;
        const div = document.createElement("div");
        div.className = "overview-item";
        div.innerHTML = `<strong>${set.name}</strong><span>${formatNum(profitPerSet)} gp</span>`;
        div.onclick = ()=>{ document.getElementById(`set-${index}`).scrollIntoView({behavior:"smooth"}); };
        overviewEl.appendChild(div);
    });
}

function createSetSections(){
    const container = document.getElementById("setsContainer");
    container.innerHTML = "";
    setsData.forEach((set,index)=>{
        const setWrapper = document.createElement("div");
        setWrapper.className = "set-wrapper";
        setWrapper.id = `set-${index}`;

        setWrapper.innerHTML = `
            <div class="set-title">${set.name} Set</div>
            <div class="cards">
                ${set.items.map(item=>`
                    <div class="card" onclick="window.open('https://prices.runescape.wiki/osrs/item/${item.id}','_blank')">
                        <div class="item-label">
                            <img class="item-icon" src="https://oldschool.runescape.wiki/images/${item.imgName}.png" alt="${item.name}"> ${item.name}
                        </div>
                        <div id="${item.id}">Loading...</div>
                    </div>`).join("")}
                <div class="card total">
                    <div>Total Pieces Cost:</div>
                    <div id="total-${index}" style="text-align:right;">Loading...</div>
                </div>
                <div class="card total" onclick="window.open('https://prices.runescape.wiki/osrs/item/${set.setId}','_blank')">
                    <div class="item-label">
                        <img class="item-icon" src="https://oldschool.runescape.wiki/images/${set.setImgName}.png" alt="${set.name}"> Set Price:
                    </div>
                    <div style="text-align:right;"><span id="setPrice-${index}">Loading...</span></div>
                </div>
            </div>
            <div class="profit-box" id="profit-${index}">Loading...</div>
            <div>
                <label>Number of Sets: </label>
                <input type="number" id="numSets-${index}" value="1" min="1">
                <button onclick="updateProfit(${index})">Refresh</button>
            </div>
        `;
        container.appendChild(setWrapper);
    });
}

async function fetchPrices(){
    try{
        const response = await fetch("https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/latest");
        latestData = await response.json();

        setsData.forEach((set,index)=>{
            let piecesTotal = 0;
            set.items.forEach(item=>{
                const priceData = latestData.data[item.id];
                const price = priceData.low;
                document.getElementById(item.id).innerHTML = `${formatNum(price)} gp`;
                piecesTotal += price;
            });

            document.getElementById(`total-${index}`).innerText = formatNum(piecesTotal);

            const setPrice = latestData.data[set.setId].high;
            document.getElementById(`setPrice-${index}`).innerText = formatNum(setPrice);

            updateProfit(index);
        });

        createOverview();

        const now = new Date();
        document.getElementById("lastRefreshed").innerText = `Last Refreshed: ${now.toLocaleTimeString()}`;

    }catch(err){ console.error(err); }
}

function calculateProfit(set){
    let piecesTotal = set.items.reduce((sum,item)=>sum+latestData.data[item.id].low,0);
    const setSell = latestData.data[set.setId].high;
    const setSellAfterTax = setSell*0.98;
    const profit = setSellAfterTax - piecesTotal;
    const roi = (profit/piecesTotal*100).toFixed(2);
    return {profit,roi,cost:piecesTotal};
}

function updateProfit(index){
    const set=setsData[index];
    const numSets = parseInt(document.getElementById(`numSets-${index}`).value);
    const {profit,roi}=calculateProfit(set);
    document.getElementById(`profit-${index}`).innerHTML =
        `Profit per set (after 2% tax): <span>${formatNum(profit)} gp</span><br>`+
        `Total profit for ${numSets} set(s): <span>${formatNum(profit*numSets)} gp</span><br>`+
        `ROI per set: <span>${roi}%</span>`;
}

document.getElementById("sortSelect").addEventListener("change",(e)=>{sortSets(e.target.value);});

function sortSets(criteria){
    setsData.sort((a,b)=>{
        const valA = calculateProfit(a)[criteria==='profit'?'profit':criteria==='roi'?'roi':'cost'];
        const valB = calculateProfit(b)[criteria==='profit'?'profit':criteria==='roi'?'roi':'cost'];
        return valB-valA;
    });
    createSetSections();
    fetchPrices();
}

createSetSections();
fetchPrices();
setInterval(fetchPrices,60000);
