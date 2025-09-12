// ------------------------------
// OSRS Flipping Dashboard Script
// ------------------------------

// Define the item sets
const setsData = [
    {
        name: "Sunfire Fanatic",
        items: [
            { name: "Helm", id: "28933" },
            { name: "Cuirass", id: "28936" },
            { name: "Chausses", id: "28939" }
        ],
        setId: "29424",
        setImgName: "Sunfire_fanatic_armour_set"
    },
    {
        name: "Blood Moon",
        items: [
            { name: "Chestplate", id: "29022" },
            { name: "Helm", id: "29028" },
            { name: "Tassets", id: "29025" },
            { name: "Dual Macuahuitl", id: "28997" }
        ],
        setId: "31136",
        setImgName: "Blood_moon_armour_set_detail"
    },
    {
        name: "Blue Moon",
        items: [
            { name: "Chestplate", id: "29013" },
            { name: "Helm", id: "29019" },
            { name: "Spear", id: "28988" },
            { name: "Tassets", id: "29016" }
        ],
        setId: "31139",
        setImgName: "Blue_moon_armour_set_detail"
    },
    {
        name: "Eclipse Moon",
        items: [
            { name: "Chestplate", id: "29004" },
            { name: "Helm", id: "29010" },
            { name: "Tassets", id: "29007" },
            { name: "Atlatl", id: "29000" }
        ],
        setId: "31142",
        setImgName: "Eclipse_moon_armour_set_detail"
    }
];

let latestData = {};
let latestTimes = {};
const dashboard = document.getElementById("dashboard");
const refreshEl = document.getElementById("lastRefreshed");

// Helper: format numbers with commas
function formatNum(num) {
    return num.toLocaleString();
}

// Helper: convert epoch ms → “x minutes ago”
function timeAgo(ms) {
    if (!ms) return "N/A";
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins === 1) return "1 minute ago";
    return `${mins} minutes ago`;
}

// Fetch both prices + last trade timestamps
async function fetchPrices() {
    try {
        const [latestRes, timeRes] = await Promise.all([
            fetch("https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/latest"),
            fetch("https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/last-traded")
        ]);

        const latestJson = await latestRes.json();
        const timeJson = await timeRes.json();

        latestData = latestJson.data;
        latestTimes = timeJson.data;

        createDashboard();

        // Update last refreshed timestamp
        if (refreshEl) {
            const now = new Date();
            refreshEl.textContent = `Last refreshed: ${now.toLocaleTimeString()}`;
        }

    } catch (err) {
        console.error("Error fetching prices:", err);
    }
}

// Calculate total cost + profit for a set
function calculateProfit(set) {
    let piecesTotal = set.items.reduce((sum, item) => {
        const price = latestData[item.id]?.low || 0;
        return sum + price;
    }, 0);

    const setSell = latestData[set.setId]?.high || 0;
    const setSellAfterTax = setSell * 0.98;
    const profit = setSellAfterTax - piecesTotal;

    return { piecesTotal, profit };
}

// Create dashboard cards
function createDashboard() {
    dashboard.innerHTML = "";
    setsData.forEach(set => {
        const { piecesTotal, profit } = calculateProfit(set);

        const card = document.createElement("div");
        card.className = "set-card";

        // Clicking goes to RS wiki set page
        card.onclick = () => {
            window.open(`https://prices.runescape.wiki/osrs/item/${set.setId}`, "_blank");
        };

        const setTime = latestTimes[set.setId] ? timeAgo(latestTimes[set.setId]) : "N/A";

        card.innerHTML = `
            <img src="https://oldschool.runescape.wiki/images/${set.setImgName}.png" alt="${set.name}">
            <strong>${set.name}</strong>
            <span>Total Pieces Cost: ${formatNum(piecesTotal)} gp</span>
            <small>Last trade: ${timeAgo(getLatestItemTime(set.items))}</small>
            <span>Profit if Sold: ${formatNum(profit)} gp</span>
            <small>Set last trade: ${setTime}</small>
        `;

        dashboard.appendChild(card);
    });
}

// Find the latest trade among all items in a set
function getLatestItemTime(items) {
    let latest = 0;
    items.forEach(item => {
        const t = latestTimes[item.id];
        if (t && t > latest) latest = t;
    });
    return latest || null;
}

// Initial fetch + auto-refresh
fetchPrices();
setInterval(fetchPrices, 60000);
