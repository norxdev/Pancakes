/**
 * FlipMaster OSRS - Modern ES6+ Implementation
 * Improved architecture with better error handling, performance, and maintainability
 */

// Application Configuration
const CONFIG = {
    API_URL: 'https://corsproxy.io/?https://prices.runescape.wiki/api/v1/osrs/latest',
    WIKI_BASE_URL: 'https://prices.runescape.wiki/osrs/item',
    IMG_BASE_URL: 'https://oldschool.runescape.wiki/images',
    REFRESH_INTERVAL: 60000, // 1 minute
    GE_TAX_RATE: 0.02, // 2% GE tax
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

/**
 * Utility Functions
 */
class Utils {
    static formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        return new Intl.NumberFormat('en-US').format(Math.round(num));
    }

    static formatPercentage(num, decimals = 2) {
        if (typeof num !== 'number' || isNaN(num)) return '0.00';
        return num.toFixed(decimals);
    }

    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') element.className = value;
            else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => element.dataset[dataKey] = dataValue);
            } else element.setAttribute(key, value);
        });

        if (typeof content === 'string') element.innerHTML = content;
        else if (content instanceof Node) element.appendChild(content);

        return element;
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static getFormattedTime() {
        return new Date().toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

/**
 * Error Handler
 */
class ErrorHandler {
    constructor() {
        this.errors = new Map();
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => this.logError('JavaScript Error', event.error));
        window.addEventListener('unhandledrejection', (event) => this.logError('Unhandled Promise Rejection', event.reason));
    }

    logError(type, error) {
        const errorKey = `${type}-${Date.now()}`;
        console.error(`[${type}]:`, error);
        this.errors.set(errorKey, { type, error, timestamp: new Date().toISOString() });
        if (this.errors.size > 10) this.errors.delete(this.errors.keys().next().value);
    }

    showUserError(message, duration = 5000) {
        this.removeExistingErrors();
        const errorContainer = document.getElementById('errorContainer');
        const errorElement = Utils.createElement('div', { className: 'error-message', role: 'alert', 'aria-live': 'polite' }, message);
        errorContainer.appendChild(errorElement);
        setTimeout(() => errorElement.remove(), duration);
        return errorElement;
    }

    showSuccessMessage(message, duration = 3000) {
        this.removeExistingErrors();
        const errorContainer = document.getElementById('errorContainer');
        const successElement = Utils.createElement('div', { className: 'error-message success-message', role: 'status', 'aria-live': 'polite' }, message);
        successElement.style.background = 'linear-gradient(135deg, #00e676 0%, #00c853 100%)';
        successElement.style.color = '#000';
        errorContainer.appendChild(successElement);
        setTimeout(() => successElement.remove(), duration);
        return successElement;
    }

    removeExistingErrors() {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.innerHTML = '';
    }
}

/**
 * API Service
 */
class ApiService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 30000;
        this.abortController = null;
    }

    async fetchPrices(forceRefresh = false) {
        if (!forceRefresh && this.cache.has('prices')) {
            const cached = this.cache.get('prices');
            if (Date.now() - cached.timestamp < this.cacheTimeout) return cached.data;
        }

        if (this.abortController) this.abortController.abort();
        this.abortController = new AbortController();

        for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
                const response = await fetch(CONFIG.API_URL, { signal: this.abortController.signal, headers: { 'Accept': 'application/json', 'Cache-Control': forceRefresh ? 'no-cache' : 'default' } });
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                const data = await response.json();
                if (!data || !data.data || typeof data.data !== 'object') throw new Error('Invalid API response format');
                this.cache.set('prices', { data, timestamp: Date.now() });
                return data;
            } catch (error) {
                if (error.name === 'AbortError') throw new Error('Request was cancelled');
                if (attempt === CONFIG.RETRY_ATTEMPTS) throw new Error(`Failed to fetch prices after ${CONFIG.RETRY_ATTEMPTS} attempts: ${error.message}`);
                await Utils.sleep(CONFIG.RETRY_DELAY * attempt);
            }
        }
    }
}

/**
 * Main App
 */
class FlipMasterApp {
    constructor() {
        this.setsData = [...SETS_DATA];
        this.latestData = {};
        this.isLoading = false;
        this.refreshInterval = null;
        this.currentSort = 'profit';

        this.errorHandler = new ErrorHandler();
        this.apiService = new ApiService();

        this.initialize();
    }

    async initialize() {
        try {
            this.createSetSections();
            await this.fetchPrices();
            this.startAutoRefresh();
        } catch (error) {
            this.errorHandler.logError('Initialization Error', error);
            this.errorHandler.showUserError('Failed to initialize application.');
        }
    }

    async fetchPrices(isManualRefresh = false) {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            this.latestData = await this.apiService.fetchPrices(isManualRefresh);
            this.updatePricesDisplay();
            if (isManualRefresh) this.errorHandler.showSuccessMessage('Prices refreshed successfully!');
        } catch (error) {
            this.errorHandler.logError('Fetch Prices', error);
            this.errorHandler.showUserError(`Failed to fetch prices: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => this.fetchPrices(), CONFIG.REFRESH_INTERVAL);
    }

    createSetSections() {
        const setsContainer = document.querySelector('.sets-container');
        this.setsData.forEach(set => {
            const setWrapper = Utils.createElement('div', { className: 'set-wrapper' });
            const setTitle = Utils.createElement('div', { className: 'set-title' }, set.name);
            const cardsContainer = Utils.createElement('div', { className: 'cards' });

            set.items.forEach(item => {
                const card = Utils.createElement('div', { className: 'card' });
                const itemLabel = Utils.createElement('div', { className: 'item-label' });
                const itemIcon = Utils.createElement('img', { className: 'item-icon', src: `${CONFIG.IMG_BASE_URL}/${item.imgName}.png`, alt: item.name });
                const itemName = Utils.createElement('strong', {}, item.name);
                const itemPrice = Utils.createElement('div', { className: 'item-price' }, '—');

                itemLabel.append(itemIcon, itemName);
                card.append(itemLabel, itemPrice);
                cardsContainer.appendChild(card);
            });

            setWrapper.append(setTitle, cardsContainer);
            setsContainer.appendChild(setWrapper);
        });
    }

    updatePricesDisplay() {
        if (!this.latestData || !this.latestData.data) return;
        const itemCards = document.querySelectorAll('.card');
        itemCards.forEach(card => {
            const nameElem = card.querySelector('.item-label strong');
            const priceElem = card.querySelector('.item-price');
            const itemName = nameElem.textContent;

            const itemData = Object.values(this.latestData.data).find(i => i.name === itemName);
            if (itemData) {
                const price = itemData.members ? itemData.price : itemData.high;
                priceElem.textContent = Utils.formatNumber(price);
            }
        });
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => new FlipMasterApp());