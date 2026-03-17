/* =============================================================
   router.js — hash-based SPA router
   Routes: login | dashboard | sede/:id | cohort/:id | clan/:id | couder/:id
   ============================================================= */

const Router = (() => {
    const routes = {};

    function register(name, handler) {
        routes[name] = handler;
    }

    function navigate(name, params = {}) {
        const query = new URLSearchParams(params).toString();
        const newHash = query ? `#${name}?${query}` : `#${name}`;
        console.log('Router.navigate called:', { name, params, newHash });
        window.location.hash = newHash;
    }

    function parseHash() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const [name, qs] = hash.split('?');
        const params = Object.fromEntries(new URLSearchParams(qs || ''));
        return { name, params };
    }

    async function render() {
        console.log('Router.render called');
        console.log('Auth.isLoggedIn():', Auth.isLoggedIn());
        console.log('Current hash:', window.location.hash);
        
        if (!Auth.isLoggedIn()) {
            const { name, params } = parseHash();
            console.log('Route parsed for unauthenticated user:', { name, params });
            
            // Allow login and register routes for unauthenticated users
            if (name === 'register') {
                console.log('User not logged in, showing register');
                const registerHandler = routes['register'];
                if (registerHandler) {
                    try {
                        await registerHandler(params);
                    } catch (error) {
                        console.error('error executing register handler:', error);
                    }
                }
                return;
            }
            
            console.log('User not logged in, showing login');
            const loginHandler = routes['login'];
            if (loginHandler) {
                try {
                    await loginHandler({});
                } catch (error) {
                    console.error('error executing login handler:', error);
                }
            }
            return;
        }

        const { name, params } = parseHash();
        console.log('Route parsed:', { name, params });
        
        const handler = routes[name];
        console.log('Handler found for route:', name, !!handler);
        
        if (handler) {
            console.log('Calling handler for route:', name);
            try {
                await handler(params);
            } catch (error) {
                console.error('Error executing route handler:', error);
                // Show error page
                const app = document.getElementById('app');
                if (app) {
                    app.innerHTML = `
                        <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
                            <div class="text-center">
                                <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h2 class="text-2xl font-bold text-red-400 mb-4">Navigation Error</h2>
                                <p class="text-gray-400 mb-6">Could not load the requested page</p>
                                <button onclick="Router.navigate('dashboard')" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all hover:scale-105 transform">
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    `;
                }
            }
        } else {
            console.error('No handler found for route:', name);
            // Show 404 page for unknown routes
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `
                    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
                        <div class="text-center">
                            <div class="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <h2 class="text-2xl font-bold text-yellow-400 mb-4">Page Not Found</h2>
                            <p class="text-gray-400 mb-6">The page "${name}" doesn't exist</p>
                            <div class="space-x-4">
                                <button onclick="Router.navigate('dashboard')" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all hover:scale-105 transform">
                                    Back to Dashboard
                                </button>
                                <button onclick="history.back()" class="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-all hover:scale-105 transform">
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', render);

    // Initial render
    document.addEventListener('DOMContentLoaded', render);

    return { register, navigate, render };
})();

// Make Router globally available for onclick handlers
window.Router = Router;
