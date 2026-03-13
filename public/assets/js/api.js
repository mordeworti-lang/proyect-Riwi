/* =============================================================
   api.js — centralised fetch wrapper
   All calls go through here; handles auth headers + errors.
   ============================================================= */

const API_BASE = '/api';

const Api = (() => {
    function getToken() {
        return localStorage.getItem('access_token');
    }

    async function request(method, path, body = null) {
        const headers = { 'Content-Type': 'application/json' };
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(`${API_BASE}${path}`, options);

        if (res.status === 401) {
            // Try token refresh
            const refreshed = await tryRefresh();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${getToken()}`;
                const retry = await fetch(`${API_BASE}${path}`, { method, headers, body: options.body });
                return handleResponse(retry);
            } else {
                Auth.logout();
                Router.navigate('login');
                // Show specific error message
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Session expired');
            }
        }

        return handleResponse(res);
    }

    async function handleResponse(res) {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || data.message || `HTTP ${res.status}`);
        }
        // Backend always wraps successful responses as { ok: true, data: ... }
        // Unwrap .data so callers work directly with the payload
        return (data && data.ok === true && 'data' in data) ? data.data : data;
    }

    async function tryRefresh() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return false;
        try {
            const res = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: refresh }),
            });
            const data = await res.json();
            if (data.ok && data.data && data.data.accessToken) {
                localStorage.setItem('access_token', data.data.accessToken);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
        return false;
    }

    return {
        get:    (path)         => request('GET',    path),
        post:   (path, body)   => request('POST',   path, body),
        put:    (path, body)   => request('PUT',    path, body),
        delete: (path)         => request('DELETE', path),
    };
})();
