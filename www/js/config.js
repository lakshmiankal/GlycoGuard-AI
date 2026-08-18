/**
 * GlycoGuard AI - Centralized Mobile & Web API Configuration
 * Supports Hybrid Architecture: Cloud Backend + Offline-First Local Engine
 */

const CONFIG = {
    DEFAULT_PORT: "5000",
    PRODUCTION_HTTPS_URL: "https://glycoguard-api.onrender.com",
    REQUEST_TIMEOUT_MS: 3000, // Fast fallback to offline engine if server is slow or unreachable

    get API_BASE() {
        // 1. Allow manual override if set in in-app settings (localStorage)
        const customUrl = localStorage.getItem("glycoguard_api_url");
        if (customUrl) {
            return customUrl.endsWith('/') ? customUrl.slice(0, -1) : customUrl;
        }

        const host = window.location.hostname || "";

        // 2. Android Capacitor native environment or file:// protocol
        if (!host || host === "" || window.location.protocol === "file:" || host === "localhost") {
            if (window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android') {
                return this.PRODUCTION_HTTPS_URL;
            }
            return `http://127.0.0.1:${this.DEFAULT_PORT}`;
        }

        // 3. Android Emulator special localhost mapping (dev)
        if (host === "10.0.2.2") {
            return `http://10.0.2.2:${this.DEFAULT_PORT}`;
        }

        // 4. Desktop Localhost / 127.0.0.1 (dev)
        if (host === "127.0.0.1" || host === "localhost") {
            return `http://127.0.0.1:${this.DEFAULT_PORT}`;
        }

        // 5. Default fallback to Public HTTPS backend
        return this.PRODUCTION_HTTPS_URL;
    },

    setApiBaseUrl(url) {
        if (url) {
            let clean = url.trim();
            if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
                clean = "https://" + clean;
            }
            if (clean.endsWith("/")) {
                clean = clean.slice(0, -1);
            }
            localStorage.setItem("glycoguard_api_url", clean);
        } else {
            localStorage.removeItem("glycoguard_api_url");
        }
    },

    getAuthHeaders() {
        const token = localStorage.getItem("glycoguard_token");
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    },

    /**
     * Resilient fetch with automatic timeout for hybrid offline/online support
     */
    async fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timer);
            return response;
        } catch (err) {
            clearTimeout(timer);
            throw err;
        }
    },

    handleNetworkError(err, customMessage = null) {
        console.warn("GlycoGuard Network Notice:", err);
        const msg = customMessage || "Running in Standalone Offline Mode";
        if (typeof showToast === "function") {
            showToast(msg, "info");
        } else if (typeof showMessage === "function") {
            showMessage(msg, true);
        }
    }
};

// Android Native Back Button Handler via Capacitor
document.addEventListener("DOMContentLoaded", () => {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.addListener('backButton', () => {
            if (typeof handleHardwareBack === "function") {
                handleHardwareBack();
            } else if (window.history.length > 1) {
                window.history.back();
            } else {
                window.Capacitor.Plugins.App.exitApp();
            }
        });
    }
});

window.CONFIG = CONFIG;
