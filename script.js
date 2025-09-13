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

// Sets Data - Could be moved to a separate JSON file in production
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
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        }

        return element;
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static safeJSONParse(json, fallback = {}) {
        try {
            return JSON.parse(json);
        } catch (error) {
            console.warn('JSON parse failed:', error);
            return fallback;
        }
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
 * Error Handler Class
 */
class ErrorHandler {
    constructor() {
        this.errors = new Map();
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
        });
    }

    logError(type, error) {
        const errorKey = `${type}-${Date.now()}`;
        console.error(`[${type}]:`, error);

        this.errors.set(errorKey, {
            type,
            error,
            timestamp: new Date().toISOString()
        });

        if (this.errors.size > 10) {
            const firstKey = this.errors.keys().next().value;
            this.errors.delete(firstKey);
        }
    }

    showUserError(message, duration = 5000) {
        this.removeExistingErrors();

        const errorContainer = document.getElementById('errorContainer');
        const errorElement = Utils.createElement('div', {
            className: 'error-message',
            role: 'alert',
            'aria-live': 'polite'
        }, message);

        errorContainer.appendChild(errorElement);

        setTimeout(() => {
            errorElement.remove();
        }, duration);

        return errorElement;
    }

    showSuccessMessage(message, duration = 3000) {
        this.removeExistingErrors();

        const errorContainer = document.getElementById('errorContainer');
        const successElement = Utils.createElement('div', {
            className: 'error-message success-message',
            role: 'status',
            'aria-live': 'polite'
        }, message);

        successElement.style.background = 'linear-gradient(135deg, #00e676 0%, #00c853 100%)';
        successElement.style.color = '#000';

        errorContainer.appendChild(successElement);

        setTimeout(() => {
            successElement.remove();
        }, duration);

        return successElement;
    }

    removeExistingErrors() {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.innerHTML = '';
    }

    getErrorHistory() {
        return Array.from(this.errors.values());
    }
}

/**
 * API Service for handling price data
 */
class ApiService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
        this.abortController = null;
    }

    async fetchPrices(forceRefresh = false) {
        if (!forceRefresh && this.cache.has('prices')) {
            const cached = this.cache.get('prices');
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        if (this.abortController) {
            this.abortController.abort();
        }

        this.abortController = new AbortController();

        for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
                const response = await fetch(CONFIG.API_URL, {
                    signal: this.abortController.signal,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': forceRefresh ? 'no-cache' : 'default'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (!data || !data.data || typeof data.data !== 'object') {
                    throw new Error('Invalid API response format');
                }

                this.cache.set('prices', {
                    data,
                    timestamp: Date.now()
                });

                return data;
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request was cancelled');
                }

                console.warn(`Attempt ${attempt} failed:`, error.message);

                if (attempt === CONFIG.RETRY_ATTEMPTS) {
                    throw new Error(`Failed to fetch prices after ${CONFIG.RETRY_ATTEMPTS} attempts: ${error.message}`);
                }

                await Utils.sleep(CONFIG.RETRY_DELAY * attempt);
            }
        }
    }

    clearCache() {
        this.cache.clear();
    }

    hasFreshCache() {
        if (!this.cache.has('prices')) return false;
        const cached = this.cache.get('prices');
        return Date.now() - cached.timestamp < this.cacheTimeout;
    }
}

/**
 * Main FlipMaster Application Class
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

        this.handleSort = this.handleSort.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleQuantityChange = Utils.debounce(this.handleQuantityChange.bind(this), CONFIG.DEBOUNCE_DELAY);

        this.initialize();
    }

    async initialize() {
        try {
            this.setupEventListeners();
            this.createSetSections();
            await this.fetchPrices();
            this.startAutoRefresh();
            this.setupAccessibility();
        } catch (error) {
            this.errorHandler.logError('Initialization Error', error);
            this.errorHandler.showUserError('Failed to initialize application. Please refresh the page.');
        }
    }

    // ... [methods up to fetchPrices as in your snippet] ...

    async fetchPrices(isManualRefresh = false) {
        if (this.isLoading) return;

        this.setLoadingState(true);

        try {
            this.latestData = await this.apiService.fetchPrices(isManualRefresh);

            this.updatePricesDisplay();
            this.createOverview();
            this.updateLastRefreshedTime();

            if (isManualRefresh) {
                this.errorHandler.showSuccessMessage('Prices refreshed successfully!');
            }
        } catch (error) {
            this.errorHandler.logError('Data Fetch Error', error);
            this.errorHandler.showUserError('Failed to fetch prices. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    updatePricesDisplay() {
        this.setsData.forEach((set, index) => {
            let totalCost = 0;
            set.items.forEach(item => {
                const priceEl = document.getElementById(item.id);
                if (!priceEl) return;

                const itemData = this.latestData.data[item.id];
                if (itemData && itemData.high) {
                    const price = itemData.high;
                    priceEl.textContent = `${Utils.formatNumber(price)} gp`;
                    totalCost += price;
                } else {
                    priceEl.textContent = 'N/A';
                }
            });

            const totalEl = document.getElementById(`total-${index}`);
            if (totalEl) {
                totalEl.textContent = `${Utils.formatNumber(totalCost)} gp`;
            }

            const setPriceEl = document.getElementById(`setPrice-${index}`);
            if (setPriceEl) {
                const setData = this.latestData.data[set.setId];
                if (setData && setData.high) {
                    setPriceEl.textContent = `${Utils.formatNumber(setData.high)} gp`;
                } else {
                    setPriceEl.textContent = 'N/A';
                }
            }

            this.updateProfit(index);
        });
    }

    calculateProfit(set, quantity = 1) {
        let totalCost = 0;
        set.items.forEach(item => {
            const itemData = this.latestData.data[item.id];
            if (itemData && itemData.high) {
                totalCost += itemData.high;
            }
        });

        const setData = this.latestData.data[set.setId];
        let setPrice = setData && setData.high ? setData.high : 0;
        setPrice -= setPrice * CONFIG.GE_TAX_RATE;

        const profit = (setPrice - totalCost) * quantity;

        return { profit, totalCost, setPrice };
    }

    updateProfit(index) {
        const set = this.setsData[index];
        const qtyInput = document.getElementById(`numSets-${index}`);
        const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

        const { profit } = this.calculateProfit(set, quantity);

        const profitEl = document.getElementById(`profit-${index}`);
        if (profitEl) {
            const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
            profitEl.innerHTML = `
                <strong>Profit:</strong>
                <span class="${profitClass}">${Utils.formatNumber(profit)} gp</span>
            `;
        }
    }

    sortSets(criteria) {
        this.setsData.sort((a, b) => {
            const profitA = this.calculateProfit(a).profit;
            const profitB = this.calculateProfit(b).profit;

            if (criteria === 'profit') {
                return profitB - profitA;
            } else if (criteria === 'name') {
                return a.name.localeCompare(b.name);
            }
            return 0;
        });

        this.createSetSections();
    }

    updateLastRefreshedTime() {
        const lastUpdatedEl = document.getElementById('lastUpdated');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = `Last updated: ${Utils.getFormattedTime()}`;
        }
    }

    startAutoRefresh() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => this.fetchPrices(), CONFIG.REFRESH_INTERVAL);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new FlipMasterApp();
});