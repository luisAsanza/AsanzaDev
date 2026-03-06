// authService.js
// 1. In-Memory State (The Closure)
let currentToken = null;
const API_BASE = 'https://localhost:5001';

export const authService = {
    async login(username, password) {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include' // CRITICAL: Tells browser to accept the HttpOnly cookie
        });

        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        currentToken = data.token; // Store JWT in memory
        return true;
    },

    async refreshToken() {
        // Calls the refresh endpoint. The browser automatically attaches the HttpOnly cookie.
        const response = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include' 
        });

        if (!response.ok) {
            currentToken = null;
            throw new Error('Session expired. Please log in again.');
        }

        const data = await response.json();
        currentToken = data.token;
        return currentToken;
    },

    // 2. The Authenticated Fetch Wrapper
    async fetchProtected(endpoint, options = {}) {
        if (!currentToken) await this.refreshToken();

        const doRequest = () => fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${currentToken}`
            }
        });

        let response = await doRequest();

        // 3. The Interceptor Logic: If 401, refresh and retry exactly once
        if (response.status === 401) {
            await this.refreshToken();
            response = await doRequest();
        }

        return response;
    }
};
