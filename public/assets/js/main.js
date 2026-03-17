/* =============================================================
   main.js — app entry point
   Registers all routes and boots the router.
   ============================================================= */

(function () {
    // Auth guard: called before every route render
    function authGuard(name) {
        console.log('authGuard called for:', name);
        console.log('Auth.isLoggedIn():', Auth.isLoggedIn());
        
        if (!Auth.isLoggedIn() && name !== 'login' && name !== 'register') {
            console.log('Not logged in, redirecting to login');
            window.location.hash = '#login';
            return false;
        }
        return true;
    }

    // Register routes with guard
    Router.register('login', (p) => {
        console.log('Login route handler called');
        LoginView.render(p);
    });
    
    Router.register('register', (p) => {
        console.log('Register route handler called');
        RegisterView.render(p);
    });
    
    Router.register('dashboard', (p) => {
        console.log('Dashboard route handler called');
        if (!authGuard('dashboard')) return;
        DashboardView.render(p);
    });
    
    Router.register('search', (p) => {
        console.log('Search route handler called');
        if (!authGuard('search')) return;
        SearchView.render(p);
    });
    
    Router.register('sede', (p) => {
        console.log('Sede route handler called');
        if (!authGuard('sede')) return;
        SedeView.render(p);
    });
    
    Router.register('cohort', (p) => {
        console.log('Cohort route handler called');
        if (!authGuard('cohort')) return;
        CohortView.render(p);
    });
    
    Router.register('clan', (p) => {
        console.log('Clan route handler called');
        if (!authGuard('clan')) return;
        ClanView.render(p);
    });
    
    Router.register('couder', (p) => {
        console.log('Couder route handler called');
        if (!authGuard('couder')) return;
        CouderView.render(p);
    });

    // Boot
    console.log('Main.js booting...');
    console.log('Auth.isLoggedIn() at boot:', Auth.isLoggedIn());
    
    if (!Auth.isLoggedIn()) {
        console.log('Not logged in, setting hash to #login');
        window.location.hash = '#login';
        LoginView.render();
    } else {
        console.log('User logged in, checking hash...');
        // If hash is empty or #login and user is logged in, go to dashboard
        const hash = window.location.hash.slice(1).split('?')[0];
        console.log('Current hash without params:', hash);
        
        if (!hash || hash === 'login') {
            console.log('Empty or login hash, redirecting to dashboard');
            window.location.hash = '#dashboard';
        } else {
            console.log('Calling Router.render()');
            Router.render();
        }
    }
    
    // Add global error handler for debugging
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        // Show user-friendly error message
        const app = document.getElementById('app');
        if (app && !app.innerHTML.includes('error')) {
            app.innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold text-red-400 mb-4">Error del Sistema</h2>
                        <p class="text-gray-400 mb-6">Ha ocurrido un error inesperado</p>
                        <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all hover:scale-105 transform">
                            Recargar Página
                        </button>
                    </div>
                </div>
            `;
        }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        e.preventDefault(); // Prevent the default browser behavior
    });
})();
