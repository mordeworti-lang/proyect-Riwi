/* =============================================================
   search.js — Couder search by national ID - FULL INTERACTIVITY
   Backend returns: couder profile + interventions
   ============================================================= */

const SearchView = (() => {
    let _currentCouder = null;
    let _interventions = [];
    let _searchTimeout = null;

    async function render(params) {
        const app = document.getElementById('app');
        if (!app) {
            console.error('App element not found');
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
                            <button onclick="Router.navigate('search')" class="bg-blue-600/20 text-blue-400 px-3 py-2 rounded-lg transition-all hover:scale-105 transform">
                                <span class="flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                    Search
                                </span>
                            </button>
                        </div>
                        <div class="flex items-center gap-3">
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
                    <div class="max-w-4xl mx-auto">
                        <!-- Search Heaofr -->
                        <div class="text-center mb-8">
                            <div class="flex items-center justify-center gap-3 mb-6">
                                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                                <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Couder Search</h1>
                            </div>
                            <p class="text-gray-400 text-lg">Search couders by national ID number</p>
                        </div>

                        <!-- Search Form -->
                        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50 mb-8">
                            <form id="search-form" class="space-y-6">
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        id="search-input"
                                        placeholder="Enter national ID number..." 
                                        class="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all text-lg"
                                        autocomplete="off"
                                    >
                                    <div class="absolute inset-y-0 right-0 pr-4 flex items-center">
                                        <div id="search-spinner" class="hidden">
                                            <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all hover:scale-105 transform">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between text-sm text-gray-400">
                                    <div class="flex items-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <span>Search performs automatically as you type</span>
                                    </div>
                                    <span id="search-status">Ready to search</span>
                                </div>
                            </form>
                        </div>

                        <!-- Results Section -->
                        <div id="search-results">
                            <div class="text-center py-12">
                                <div class="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold text-gray-300 mb-2">Search for a Couder</h3>
                                <p class="text-gray-500">Enter a national ID number to search for couder information</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup event LISTENERS
        _setupEventLISTENERS();
    }

    function _setupEventLISTENERS() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchStatus = document.getElementById('search-status');

        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchTerm = searchInput.value.trim();
                if (searchTerm.length >= 3) {
                    _searchCouder(searchTerm);
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', _handleRealTimeSearch);
            searchInput.addEventListener('focus', () => {
                if (searchStatus) {
                    searchStatus.textContent = 'Enter at least 3 digits';
                }
            });
        }
    }

    async function _handleRealTimeSearch(e) {
        const searchTerm = e.target.value.trim();
        const searchStatus = document.getElementById('search-status');
        const searchSpinner = document.getElementById('search-spinner');
        
        // Clear previous timeout
        if (_searchTimeout) {
            clearTimeout(_searchTimeout);
        }
        
        // Show loading indicator for longer searches
        if (searchSpinner) {
            if (searchTerm.length >= 3) {
                searchSpinner.classList.remove('hidden');
            } else {
                searchSpinner.classList.add('hidden');
            }
        }
        
        if (searchStatus) {
            if (searchTerm.length === 0) {
                searchStatus.textContent = 'Ready to search';
            } else if (searchTerm.length < 3) {
                searchStatus.textContent = 'Enter at least 3 digits';
            } else {
                searchStatus.textContent = 'Searching...';
            }
        }
        
        if (searchTerm.length >= 3) {
            // Set new timeout for search
            _searchTimeout = setTimeout(async () => {
                await _searchCouder(searchTerm);
                if (searchSpinner) {
                    searchSpinner.classList.add('hidden');
                }
            }, 500);
        } else {
            _showEmptyState();
        }
    }

    async function _handleSearch(e) {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm.length < 3) {
            _showError('Please enter at least 3 digits');
            return;
        }
        
        await _searchCouder(searchTerm);
    }

    async function _searchCouder(searchTerm) {
        const searchStatus = document.getElementById('search-status');
        const resultsContainer = document.getElementById('search-results');
        
        try {
            if (searchStatus) {
                searchStatus.textContent = 'Searching couder...';
            }
            
            console.log('Searching for couder:', searchTerm);
            const couder = await Api.get(`/couders/search?cc=${encodeURIComponent(searchTerm)}`);
            console.log('Raw search response:', couder);
            
            if (!couder || !couder.id) {
                _showNotFound(searchTerm);
                if (searchStatus) {
                    searchStatus.textContent = 'No Found';
                }
                return;
            }
            
            // Apply data mapping for consistency
            const mappedCouder = TranslationHelper.mapBackendToFrontend(couder);
            console.log('Mapped couder data:', mappedCouder);
            
            _currentCouder = mappedCouder;
            
            // Load interventions — API returns { couder, interventions } already unwrapped
            const intResult = await Api.get(`/couders/${couder.id}/interventions`);
            console.log('Raw interventions data:', intResult);
            
            // Apply data mapping for consistency
            const mappedInterventions = TranslationHelper.mapArray(
                Array.isArray(intResult) ? intResult
                : (intResult && Array.isArray(intResult.interventions)) ? intResult.interventions
                : []
            );
            console.log('Mapped interventions:', mappedInterventions);
            
            _interventions = mappedInterventions;
            
            _showCouderResults();
            
            if (searchStatus) {
                searchStatus.textContent = 'Couder found';
            }
            
        } catch (error) {
            console.error('Search error:', error);
            _showError('Error searching couder: ' + error.message);
            if (searchStatus) {
                searchStatus.textContent = 'Error';
            }
        }
    }

    function _showCouderResults() {
        const resultsContainer = document.getElementById('search-results');
        
        if (!_currentCouder) {
            _showError('No couder data available');
            return;
        }
        
        const statusColor = _currentCouder.status === 'active' ? 'green' : _currentCouder.status === 'completed' ? 'blue' : 'red';
        const statusText = _currentCouder.status === 'active' ? 'Active' : _currentCouder.status === 'completed' ? 'Completed' : 'Inactive';
        
        resultsContainer.innerHTML = `
            <!-- Couder Profile Card -->
            <div class="group bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50 mb-8 hover:shadow-2xl transition-all duration-300">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                
                <div class="relative z-10">
                    <div class="flex items-center justify-between mb-8">
                        <div class="flex items-center gap-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z"/>
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">${_currentCouder.full_name}</h2>
                                <p class="text-gray-400 text-lg">CC: ${_currentCouder.national_id}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="bg-${statusColor}-600/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                                <span class="text-white font-medium">${statusText}</span>
                            </div>
                            <button onclick="Router.navigate('couder', { cc: '${_currentCouder.national_id}' })" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all hover:scale-105 transform flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                                View Profile
                            </button>
                        </div>
                    </div>
                    
                    <!-- Quick Info Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 text-center group/item hover:bg-gray-700/70 transition-all">
                            <span class="text-gray-400 text-sm">Sede</span>
                            <p class="text-white font-semibold text-lg group/item:text-blue-300 transition-colors">${_currentCouder.sede_name || 'N/A'}</p>
                        </div>
                        <div class="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 text-center group/item hover:bg-gray-700/70 transition-all">
                            <span class="text-gray-400 text-sm">Clan</span>
                            <p class="text-white font-semibold text-lg group/item:text-blue-300 transition-colors">${_currentCouder.clan_name || 'N/A'}</p>
                        </div>
                        <div class="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 text-center group/item hover:bg-gray-700/70 transition-all">
                            <span class="text-gray-400 text-sm">Score</span>
                            <p class="text-white font-semibold text-lg group/item:text-blue-300 transition-colors">${_currentCouder.average_score || 0}</p>
                        </div>
                        <div class="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 text-center group/item hover:bg-gray-700/70 transition-all">
                            <span class="text-gray-400 text-sm group/item:text-gray-300 transition-colors">Interventions</span>
                            <p class="text-white font-semibold text-lg group/item:text-blue-300 transition-colors">${_interventions.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Interventions Summary -->
            <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3m6 0v6a3 3 0 01-3 3H6a3 3 0 01-3 3v6a3 3 0 00-3 3H6a3 3 0 00-3 3v6z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-white">History of Interventions</h3>
                        <span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">${_interventions.length} interventions</span>
                    </div>
                    <button onclick="Router.navigate('couder', { cc: '${_currentCouder.national_id}' })" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all hover:scale-105 transform">
                        View Profile
                    </button>
                </div>
                
                ${_interventions.length === 0 ? `
                    <div class="text-center py-8">
                        <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3m6 0v6a3 3 0 01-3 3H6a3 3 0 00-3 3v6z"/>
                            </svg>
                        </div>
                        <h4 class="text-xl font-semibold text-white mb-2">No Interventions</h4>
                        <p class="text-gray-400">This couder has no registered interventions</p>
                    </div>
                ` : `
                    <div class="space-y-4">
                        ${_interventions.slice(0, 5).map((intervention, idx) => `
                            <div class="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50 group/item hover:bg-gray-700/70 transition-all" style="animation-delay: ${idx * 100}ms">
                                <div class="flex items-start justify-between">
                                    <div>
                                        <h5 class="text-lg font-semibold text-white mb-2 group/item:text-blue-300 transition-colors">${intervention.intervention_type || 'Intervention'}</h5>
                                        <p class="text-gray-400 text-sm">${new Date(intervention.session_date).toLocaleDateString()}</p>
                                    </div>
                                    <div class="bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full group/item:scale-110 transition-transform">
                                        <span class="text-white text-xs font-medium">Registered</span>
                                    </div>
                                </div>
                                
                                <div class="mt-3">
                                    <p class="text-gray-300">${intervention.notes || 'No notes'}</p>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${_interventions.length > 5 ? `
                            <div class="text-center pt-4">
                                <button onclick="Router.navigate('couder', { cc: '${_currentCouder.national_id}' })" class="text-blue-400 hover:text-blue-300 transition-colors">
                                    View ${_interventions.length - 5} more interventions →
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `}
            </div>
        `;

        // Add entrance animations
        _addEntranceAnimations();
    }

    function _showNotFound(searchTerm) {
        const resultsContainer = document.getElementById('search-results');
        
        resultsContainer.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-yellow-400 mb-2">Couder Not Found</h3>
                <p class="text-gray-400">No couder found with ID: <span class="font-mono bg-gray-700/50 px-2 py-1 rounded">${searchTerm}</span></p>
                <div class="mt-6 space-y-2 text-sm text-gray-500">
                    <p>Verify that:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>The ID number is written correctly</li>
                        <li>The couder is registered in the system</li>
                        <li>No additional spaces</li>
                    </ul>
                </div>
            </div>
        `;
    }

    function _showEmptyState() {
        const resultsContainer = document.getElementById('search-results');
        
        resultsContainer.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-300 mb-2">Search for a Couder</h3>
                <p class="text-gray-500">Enter a national ID number to search for couder information</p>
            </div>
        `;
    }

    function _showError(message) {
        const resultsContainer = document.getElementById('search-results');
        
        resultsContainer.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-red-400 mb-2">Error</h3>
                <p class="text-gray-400 mb-4">${message}</p>
                <button onclick="location.reload()" class="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-all hover:scale-105 transform">
                    Retry
                </button>
            </div>
        `;
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

    return { 
        render,
        _searchCouder
    };
})();

// Make globally available
window.SearchView = SearchView;
