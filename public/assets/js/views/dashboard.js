/* =============================================================
   dashboard.js — Main dashboard view with full interactivity
   Shows global KPIs + sedes with real backend data + interactions
   ============================================================= */

const DashboardView = (() => {
    let _refreshInterval = null;
    let _sedeData = [];
    let _globalData = {};

    async function render(params) {
        try {
            console.log('DashboardView.render called with params:', params);
            const app = document.getElementById('app');
            if (!app) {
                console.error('App element not found');
                return;
            }

            console.log('Clearing app and rendering dashboard...');

            app.innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                    <!-- Animated Navbar -->
                    <nav class="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 sticky top-0 z-50">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-6">
                                <div class="flex items-center gap-3 group cursor-pointer" onclick="Router.navigate('dashboard')">
                                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                        <span class="text-white font-bold text-lg">D</span>
                                    </div>
                                    <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DataCore</h1>
                                </div>
                                <button onclick="Router.navigate('dashboard')" class="text-gray-300 hover:text-white transition-all hover:scale-105 transform px-3 py-2 rounded-lg hover:bg-gray-700/50">
                                    <span class="flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                        </svg>
                                        Dashboard
                                    </span>
                                </button>
                                <button onclick="Router.navigate('search')" class="text-gray-300 hover:text-white transition-all hover:scale-105 transform px-3 py-2 rounded-lg hover:bg-gray-700/50">
                                    <span class="flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                        Search
                                    </span>
                                </button>
                            </div>
                            <div class="flex items-center gap-3">
                                <button onclick="DashboardView._refreshData()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all hover:scale-105 transform flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                    Refresh
                                </button>
                                <button onclick="Auth.logout()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all hover:scale-105 transform flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </nav>

                    <!-- Main Content -->
                    <div class="p-6">
                        <div id="dash-content">
                            <div class="text-center py-12">
                                <div class="relative">
                                    <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <div class="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-ping opacity-20"></div>
                                </div>
                                <h2 class="text-xl font-semibold text-white mb-2">Loading Dashboard...</h2>
                                <p class="text-gray-400">Getting real-time system data</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Load real dashboard data
            console.log('Fetching dashboard data...');
            const data = await Api.get('/dashboard');
            console.log('Raw dashboard data received:', data);
            
            // Apply data mapping for consistency
            const mappedData = {
                global: TranslationHelper.mapBackendToFrontend(data.global || {}),
                sedes: TranslationHelper.mapArray(data.sedes || [])
            };
            console.log('Mapped dashboard data:', mappedData);
            
            _globalData = mappedData.global;
            _sedeData = mappedData.sedes;
            renderContent(mappedData);

            // Setup auto-refresh
            _setupAutoRefresh();

        } catch (error) {
            console.error('Dashboard error:', error);
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
                            <h2 class="text-2xl font-bold text-red-400 mb-4">Error Loading Dashboard</h2>
                            <p class="text-gray-400 mb-6">${error.message}</p>
                            <button onclick="location.reload()" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg transition-all hover:scale-105 transform">
                                Retry
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }

    function renderContent({ global, sedes }) {
        console.log('=== RENDERING DASHBOARD ===');
        console.log('Global data:', global);
        console.log('Sedes data:', sedes);
        console.log('========================');

        // Save global data for use in other functions
        _globalData = global || {};
        _sedeData = sedes || [];

        const content = document.getElementById('dash-content');
        if (!content) {
            console.error('dash-content element not found');
            return;
        }

        content.innerHTML = `
        <!-- Animated Global KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer" onclick="DashboardView._showKpioftails('TOTAL')">
                <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                            </svg>
                        </div>
                        <span class="text-white font-medium">TOTAL Couders</span>
                    </div>
                    <div class="text-4xl font-bold text-white mb-2">${global?.TOTAL || 0}</div>
                    <div class="text-orange-100 text-sm">Click for details</div>
                </div>
            </div>

            <div class="group relative overflow-hidden bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer" onclick="DashboardView._showKpioftails('withdrawn')">
                <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                        </div>
                        <span class="text-white font-medium">Withdrawn</span>
                    </div>
                    <div class="text-4xl font-bold text-white mb-2">${global?.withdrawn || 0}</div>
                    <div class="text-gray-100 text-sm">Click for details</div>
                </div>
            </div>

            <div class="group relative overflow-hidden bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer" onclick="DashboardView._showKpioftails('active')">
                <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                            </svg>
                        </div>
                        <span class="text-white font-medium">Active</span>
                    </div>
                    <div class="text-4xl font-bold text-white mb-2">${global?.active || 0}</div>
                    <div class="text-green-100 text-sm">Click for oftails</div>
                </div>
            </div>
        </div>

        <!-- Interactive Sedes Section -->
        <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-white">Locations</h2>
                    <span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">${sedes?.length || 0} locations</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="DashboardView._sortSedes('name')" class="text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50">
                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                        </svg>
                        Sort
                    </button>
                    <button onclick="DashboardView._refreshData()" class="text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50">
                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${sedes?.map((sede, idx) => `
            <div class="sede-card group bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer relative" 
                 data-sede-id="${sede.id}"
                 style="animation-delay: ${idx * 100}ms">
                
                <div class="relative z-10">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">${sede.name || 'Location'}</h3>
                            <p class="text-gray-400 text-sm">Attended: ${sede.attendancePercent || 0}%</p>
                        </div>
                        <div class="bg-purple-600/80 backdrop-blur-sm px-3 py-1 rounded-full group-hover:scale-110 transition-transform">
                            <span class="text-white text-xs font-medium">${sede.attended || 0} attended</span>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-300">${sede.TOTAL || 0}</div>
                            <div class="text-xs text-gray-400">TOTAL</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-red-300">${sede.withdrawn || 0}</div>
                            <div class="text-xs text-gray-400">Withdrawn</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-300">${sede.completed || 0}</div>
                            <div class="text-xs text-gray-400">Completed</div>
                        </div>
                    </div>
                </div>
            </div>
            `).join('') || `
            <div class="col-span-2 text-center py-12">
                <div class="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-300 mb-2">No registered locations</h3>
                <p class="text-gray-500">No locations found in the system</p>
            </div>
            `}
        </div>
    `;

        // Add entrance animations
        _addEntranceAnimations();
        
        // Add click listeners to sede cards
        _addSedeClickListeners();
    }

    function _addSedeClickListeners() {
        const cards = document.querySelectorAll('.sede-card');
        console.log('Adding click listeners to', cards.length, 'sede cards');
        cards.forEach(card => {
            const sedeId = card.getAttribute('data-sede-id');
            card.addEventListener('click', function(e) {
                console.log('Sede card clicked:', sedeId);
                Router.navigate('sede', { id: sedeId });
                return false;
            });
        });
    }

    function _setupAutoRefresh() {
        // Clear existing interval
        if (_refreshInterval) {
            clearInterval(_refreshInterval);
        }
        
        // Setup auto-refresh (refresh every 30 seconds)
        _refreshInterval = setInterval(async () => {
            try {
                // Only refresh if we're still on the dashboard
                if (!window.location.hash.startsWith('#dashboard')) {
                    console.log('Auto-refresh skipped - not on dashboard');
                    return;
                }
                
                console.log('Auto-refreshing dashboard...');
                const data = await Api.get('/dashboard');
                
                // Apply data mapping for consistency
                const mappedData = {
                    global: TranslationHelper.mapBackendToFrontend(data.global || {}),
                    sedes: TranslationHelper.mapArray(data.sedes || [])
                };
                
                _globalData = mappedData.global;
                _sedeData = mappedData.sedes;
                renderContent(mappedData);
            } catch (error) {
                console.error('Auto-refresh error:', error);
            }
        }, 30000);
    }

    function _addEntranceAnimations() {
        const cards = document.querySelectorAll('.group');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    async function _refreshData() {
        const btn = event?.target?.closest('button');
        const originalContent = btn ? btn.innerHTML : '';
        
        if (btn) {
            btn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Updating...';
            btn.disabled = true;
        }
        
        try {
            const data = await Api.get('/dashboard');
            
            // Apply data mapping for consistency
            const mappedData = {
                global: TranslationHelper.mapBackendToFrontend(data.global || {}),
                sedes: TranslationHelper.mapArray(data.sedes || [])
            };
            
            _globalData = mappedData.global;
            _sedeData = mappedData.sedes;
            renderContent(mappedData);
            
            // Show success feedback
            if (btn) {
                btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Updated';
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                }, 2000);
            }
        } catch (error) {
            if (btn) {
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }
            console.error('Refresh error:', error);
        }
    }

    function _showKpiDetails(kpiType) {
        const kpiTitles = {
            TOTAL: 'TOTAL of Couders',
            withdrawn: 'Couders Withdrawn',
            active: 'Couders Active'
        };
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700 transform scale-95 opacity-0 transition-all">
                <h3 class="text-2xl font-bold text-white mb-4">${kpiTitles[kpiType]}</h3>
                <div class="text-gray-300 mb-6">
                    <p>Detailed information about ${kpiTitles[kpiType].toLowerCase()} in the system.</p>
                    <div class="mt-4 p-4 bg-gray-700/50 rounded-lg">
                        <div class="text-sm text-gray-400">Last update:</div>
                        <div class="text-white">${new Date().toLocaleString('en-US')}</div>
                    </div>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.querySelector('.transform').classList.remove('scale-95', 'opacity-0');
            modal.querySelector('.transform').classList.add('scale-100', 'opacity-100');
        }, 10);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    function _sortSedes(sortBy) {
        if (sortBy === 'name') {
            _sedeData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
        
        // Re-render with sorted data
        renderContent({ global: _globalData, sedes: _sedeData });
        
        // Show feedback
        const btn = event?.target?.closest('button');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Sorted';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 1000);
        }
    }

    return { 
        render,
        _refreshData,
        _showKpiDetails,
        _sortSedes
    };
})();

// Make globally available
window.DashboardView = DashboardView;
