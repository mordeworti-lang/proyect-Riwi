/* =============================================================
   auth.js — login / logout / session state
   ============================================================= */

const Auth = (() => {
    function getUser() {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    }

    function isLoggedIn() {
        return !!localStorage.getItem('access_token') && !!getUser();
    }

    async function login(email, password) {
        const data = await Api.post('/auth/login', { email, password });
        // After unwrapping, data = { accessToken, refreshToken, user }
        if (data && data.accessToken) {
            const { accessToken, refreshToken, user } = data;
            localStorage.setItem('access_token', accessToken);
            if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } else {
            throw new Error('Login failed: invalid response');
        }
    }

    function logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        // Also clear sessionStorage if used
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        
        // Redirect to login
        Router.navigate('login');
    }

    // Add setAuth method for compatibility
    function setAuth(token, user) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    return { getUser, isLoggedIn, login, logout, setAuth };
})();

// Make Auth globally available for onclick handlers
window.Auth = Auth;
