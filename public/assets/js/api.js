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
        console.log(`API Request: ${method} ${path}`);
        if (body) console.log('Request body:', body);
        
        const headers = { 'Content-Type': 'application/json' };
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        console.log('Request headers:', headers);

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        console.log('Fetch options:', options);
        const res = await fetch(`${API_BASE}${path}`, options);
        console.log(`Response status: ${res.status} ${res.statusText}`);

        if (res.status === 401) {
            console.log('401 Unauthorized, attempting token refresh');
            // Try token refresh
            const refreshed = await tryRefresh();
            if (refreshed) {
                console.log('Token refresh successful, retrying request');
                headers['Authorization'] = `Bearer ${getToken()}`;
                const retry = await fetch(`${API_BASE}${path}`, { method, headers, body: options.body });
                return handleResponse(retry);
            } else {
                console.log('Token refresh failed, logging out');
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
        console.log(`Handling response for status: ${res.status}`);
        
        const data = await res.json().catch(() => {
            console.log('Failed to parse JSON response');
            return {};
        });
        
        console.log('Response data:', data);
        
        if (!res.ok) {
            console.error(`HTTP Error: ${res.status} ${res.statusText}`);
            console.error('Response data:', data);
            throw new Error(data.error || data.message || `HTTP ${res.status}`);
        }
        
        // Backend always wraps successful responses as { ok: true, data: ... }
        // Unwrap .data so callers work directly with the payload
        const result = (data && data.ok === true && 'data' in data) ? data.data : data;
        console.log('Final result:', result);
        return result;
    }

    async function tryRefresh() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return false;
        try {
            const res = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                heaofrs: { 'Content-Type': 'application/json' },
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
