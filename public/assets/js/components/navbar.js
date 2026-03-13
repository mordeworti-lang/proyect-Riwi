/* =============================================================
   components/navbar.js
   ============================================================= */

const Navbar = (() => {
    function render({ onSearch } = {}) {
        console.log('Navbar render called');
        let user;
        try {
            user = Auth.getUser();
            console.log('User found:', user);
        } catch (error) {
            console.error('Error getting user in Navbar:', error);
            user = { fullName: 'Usuario' }; // fallback
        }
        
        return `
        <nav class="bg-gray-800 border-b border-gray-700 shadow-xl">
            <div class="max-w-7xl mx-auto px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 cursor-pointer" id="navbar-logo">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center font-bold text-white text-lg shadow-lg">D</div>
                        <div>
                            <div class="font-semibold text-white text-sm leading-tight">DataCore</div>
                            <div class="text-xs text-purple-300">${user ? user.fullName : ''}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <!-- Search bar -->
                        <div class="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2 border border-gray-600">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input id="global-search-input"
                                   type="text"
                                   placeholder="Buscar Couder por CC..."
                                   class="bg-transparent text-sm text-white placeholder-gray-400 outline-none w-48" />
                        </div>
                        <button id="navbar-dashboard"
                                class="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                        </button>
                        <button id="navbar-logout"
                                class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-900">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            Salir
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    `;}

    function _assignEventListeners() {
        console.log('Assigning navbar event listeners...');
        
        // Logo click
        const logo = document.getElementById('navbar-logo');
        if (logo) {
            logo.addEventListener('click', () => Router.navigate('dashboard'));
            console.log('Navbar logo listener assigned');
        }
        
        // Search functionality
        const searchInput = document.getElementById('global-search-input');
        const searchIcon = document.querySelector('nav svg');
        
        if (searchIcon) {
            searchIcon.addEventListener('click', () => {
                Router.navigate('search');
                console.log('Search icon clicked, navigating to search');
            });
            console.log('Search icon listener assigned');
        }
        
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    Router.navigate('search');
                    console.log('Enter pressed in search, navigating to search');
                }
            });
            
            // Add input event for immediate transition to search view
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.trim().length > 0) {
                    console.log('User started typing, immediately transitioning to search view');
                    // Get the search value and pass it to the search view
                    const searchValue = e.target.value.trim();
                    Router.navigate('search', { search: searchValue });
                }
            });
            console.log('Search input listener assigned');
        }
        
        // Dashboard button
        const dashboardBtn = document.getElementById('navbar-dashboard');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => Router.navigate('dashboard'));
            console.log('Dashboard button listener assigned');
        }
        
        // Sedes button
        const sedesBtn = document.createElement('button');
        sedesBtn.className = 'flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700';
        sedesBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
        `;
        
        // Insert sedes button after search button
        if (dashboardBtn && searchIcon) {
            const parent = searchIcon.parentNode;
            parent.insertBefore(sedesBtn, searchIcon.nextSibling);
        }
        
        // Sedes button click event
        if (sedesBtn) {
            sedesBtn.addEventListener('click', () => {
                console.log('Sedes button clicked, navigating to sedes');
                Router.navigate('sede');
            });
            console.log('Sedes button listener assigned');
        }
        
        // Logout button
        const logoutBtn = document.getElementById('navbar-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
                Router.navigate('login');
                console.log('Logout button listener assigned');
            });
        }
    }

    function _triggerSearch(cc) {
        const val = (cc || '').trim();
        if (val) Router.navigate('couder', { cc: val, from: 'search' });
    }

    return { render, _triggerSearch, _assignEventListeners };
})();

// Make Navbar globally available for onclick handlers
window.Navbar = Navbar;
