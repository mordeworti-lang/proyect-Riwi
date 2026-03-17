/* =============================================================
   clan.js — Clan view with couders - FULL INTERACTIVITY
   Backend returns: {clan, couders}
   ============================================================= */

const ClanView = (() => {
    let _clanData = null;
    let _coudersData = [];

    async function render(params) {
        try {
            const app = document.getElementById('app');
            if (!app) {
                console.error('App element not found');
                return;
            }
            
            const clanId = params.id;
            if (!clanId) {
                console.error('No clan ID provided');
                Router.navigate('cohort');
                return;
            }

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
                            </div>
                            <div class="flex items-center gap-3">
                                <button onclick="ClanView._refreshData()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all hover:scale-105 transform flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                    Update
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
                        <div id="clan-content">
                            <div class="text-center py-12">
                                <div class="relative">
                                    <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <div class="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-ping opacity-20"></div>
                                </div>
                                <h2 class="text-xl font-semibold text-white mb-2">Loading Clan...</h2>
                                <p class="text-gray-400">Getting clan information and couders</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Load clan data
            console.log('Fetching clan data for ID:', clanId);
            const data = await Api.get(`/dashboard/clans/${clanId}`);
            console.log('Raw clan data received:', data);
            
            // Apply data mapping for consistency
            const mappedData = {
                clan: TranslationHelper.mapBackendToFrontend(data.clan || {}),
                couders: TranslationHelper.mapArray(data.couders || [])
            };
            console.log('Mapped clan data:', mappedData);
            
            _clanData = mappedData.clan;
            _coudersData = mappedData.couders;
            renderContent(mappedData);

        } catch (error) {
            console.error('Clan error:', error);
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
                            <h2 class="text-2xl font-bold text-red-400 mb-4">Error loading Clan</h2>
                            <p class="text-gray-400 mb-6">${error.message}</p>
                            <button onclick="Router.navigate('cohort')" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg transition-all hover:scale-105 transform">
                                Return to Cohort
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }

    function renderContent({ clan, couders }) {
        console.log('=== RENDERING CLAN ===');
        console.log('Raw Clan data:', clan);
        console.log('Raw Couders data:', couders);
        console.log('=====================');

        // Apply data mapping for consistency
        const mappedClan = TranslationHelper.mapBackendToFrontend(clan || {});
        const mappedCouders = TranslationHelper.mapArray(couders || []);
        
        console.log('Mapped Clan data:', mappedClan);
        console.log('Mapped Couders data:', mappedCouders);

        // Save data for use in other functions
        _clanData = mappedClan;
        _coudersData = mappedCouders;

        const content = document.getElementById('clan-content');
        if (!content) {
            console.error('clan-content element not found');
            return;
        }

        content.innerHTML = `
            <!-- Back Button -->
            <div class="mb-6">
                <button onclick="Router.navigate('cohort', { id: ${mappedClan.cohort_id} })" class="bg-gray-700/50 backdrop-blur-sm hover:bg-gray-700/70 px-4 py-2 rounded-lg transition-all hover:scale-105 transform flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back to Cohort
                </button>
            </div>

            <!-- Clan Header -->
            <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 mb-8">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-6">
                        <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">${mappedClan.name || 'Clan'}</h2>
                            <p class="text-gray-400 text-lg">ID: ${mappedClan.id}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="bg-blue-600/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <span class="text-white font-medium">${mappedCouders?.length || 0} couders</span>
                        </div>
                        <div class="bg-green-600/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <span class="text-white font-medium">${mappedClan.avgScore || 0} avg score</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-white">Couders</h2>
                    <span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">${couders?.length || 0} couders</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="ClanView._sortCouders('name')" class="text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50">
                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                        </svg>
                        Sort
                    </button>
                    <button onclick="ClanView._filterCouders('all')" class="text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50">
                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                        </svg>
                        Filter
                    </button>
                </div>
            </div>

            <!-- Couders Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${mappedCouders?.map((couder, idx) => `
                <div class="couder-card group bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer relative" 
                     data-couder-cc="${couder.national_id}"
                     style="animation-delay: ${idx * 100}ms">
                    
                    <div class="relative z-10">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">${couder.full_name || 'Couder'}</h3>
                                <p class="text-gray-400 text-sm">CC: ${couder.national_id || 'N/A'}</p>
                            </div>
                            <div class="bg-purple-600/80 backdrop-blur-sm px-3 py-1 rounded-full group-hover:scale-110 transition-transform">
                                <span class="text-white text-xs font-medium">${couder.status || 'active'}</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mt-2">
                            <div class="text-center bg-gray-700/40 rounded-lg py-2">
                                <div class="text-sm font-semibold ${couder.status === 'active' ? 'text-green-300' : couder.status === 'completed' ? 'text-blue-300' : 'text-red-300'}">${couder.status === 'active' ? 'Active' : couder.status === 'completed' ? 'Completed' : 'Withdrawn'}</div>
                                <div class="text-xs text-gray-400">State</div>
                            </div>
                            <div class="text-center bg-gray-700/40 rounded-lg py-2">
                                <div class="text-sm font-semibold text-orange-300">${couder.average_score || '—'}</div>
                                <div class="text-xs text-gray-400">Score</div>
                            </div>
                        </div>
                    </div>
                </div>
                `).join('') || `
                <div class="col-span-3 text-center py-12">
                    <div class="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-300 mb-2">No registered couders</h3>
                    <p class="text-gray-500">No couders found in this clan</p>
                </div>
                `}
            </div>
        `;

        // Add entrance animations
        _addEntranceAnimations();
        
        // Add click listeners to couder cards
        _addCouderClickListeners();
    }

    function _addCouderClickListeners() {
        const cards = document.querySelectorAll('.couder-card');
        console.log('Adding click listeners to', cards.length, 'couder cards');
        cards.forEach(card => {
            const couderCc = card.getAttribute('data-couder-cc');
            card.addEventListener('click', function(e) {
                console.log('Couder card clicked:', couderCc);
                e.preventDefault();
                e.stopPropagation();
                Router.navigate('couder', { cc: couderCc });
            });
        });
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
            const data = await Api.get(`/dashboard/clans/${_clanData.id}`);
            console.log('Raw refresh data:', data);
            
            // Apply data mapping for consistency
            const mappedData = {
                clan: TranslationHelper.mapBackendToFrontend(data.clan || {}),
                couders: TranslationHelper.mapArray(data.couders || [])
            };
            console.log('Mapped refresh data:', mappedData);
            
            _clanData = mappedData.clan;
            _coudersData = mappedData.couders;
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

    function _sortCouders(sortBy) {
        if (sortBy === 'name') {
            _coudersData.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        }
        
        // Re-render with sorted data
        renderContent({ clan: _clanData, couders: _coudersData });
        
        // Show feedback
        const btn = event?.target?.closest('button');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Orofnado';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 1000);
        }
    }

    function _filterCouders(filter) {
        // For Now, just show all couders
        renderContent({ clan: _clanData, couders: _coudersData });
        
        // Show feedback
        const btn = event?.target?.closest('button');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Filtrado';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 1000);
        }
    }

    return { 
        render,
        _refreshData,
        _sortCouders,
        _filterCouders
    };
})();

// Make globally available
window.ClanView = ClanView;
