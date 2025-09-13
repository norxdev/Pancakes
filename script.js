/**
 * FlipMaster OSRS - Modern ES6+ Implementation
 */

// Application Configuration
const CONFIG = {
    API_URL: 'https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/latest',
    WIKI_BASE_URL: 'https://prices.runescape.wiki/osrs/item',
    IMG_BASE_URL: 'https://oldschool.runescape.wiki/images',
    REFRESH_INTERVAL: 60000, // 1 minute
    GE_TAX_RATE: 0.02,
    MAX_SETS: 10000,
    DEBOUNCE_DELAY: 300,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// Sets Data
const SETS_DATA = [
    {
        name: "Sunfire Fanatic",
        items: [
            { name: "Helm", id: "28933", imgName: "Sunfire_fanatic_helm" },
            { name: "Cuirass", id: "28936", imgName: "Sunfire_fanatic_cuirass" },
            { name: "Chausses", id: "28939", imgName: "Sunfire_fanatic_chausses" }
        ],
        setId: "29424",
        setImgName: "Sunfire_fanatic_armour_set"
    },
    {
        name: "Blood Moon",
        items: [
            { name: "Chestplate", id: "29022", imgName: "Blood_moon_chestplate_detail" },
            { name: "Helm", id: "29028", imgName: "Blood_moon_helm_detail" },
            { name: "Tassets", id: "29025", imgName: "Blood_moon_tassets_detail" },
            { name: "Dual Macuahuitl", id: "28997", imgName: "Dual_macuahuitl_detail" }
        ],
        setId: "31136",
        setImgName: "Blood_moon_armour_set_detail"
    },
    {
        name: "Blue Moon",
        items: [
            { name: "Chestplate", id: "29013", imgName: "Blue_moon_chestplate_detail" },
            { name: "Helm", id: "29019", imgName: "Blue_moon_helm_detail" },
            { name: "Spear", id: "28988", imgName: "Blue_moon_spear_detail" },
            { name: "Tassets", id: "29016", imgName: "Blue_moon_tassets_detail" }
        ],
        setId: "31139",
        setImgName: "Blue_moon_armour_set_detail"
    },
    {
        name: "Eclipse Moon",
        items: [
            { name: "Chestplate", id: "29004", imgName: "Eclipse_moon_chestplate_detail" },
            { name: "Helm", id: "29010", imgName: "Eclipse_moon_helm_detail" },
            { name: "Tassets", id: "29007", imgName: "Eclipse_moon_tassets_detail" },
            { name: "Atlatl", id: "29000", imgName: "Eclipse_atlatl_detail" }
        ],
        setId: "31142",
        setImgName: "Eclipse_moon_armour_set_detail"
    }
];

/* Utility, ErrorHandler, ApiService, and FlipMasterApp classes remain unchanged from your original JS snippet */

document.addEventListener('DOMContentLoaded', () => {
    new FlipMasterApp();
});