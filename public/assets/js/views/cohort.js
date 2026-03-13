/* =============================================================
   cohort.js — Cohort view with clans - FULL INTERACTIVITY
   Backend returns: {cohort, morning, afternoon}
   ============================================================= */

const CohortView = (() => {
    let _cohortData = null;
    let _morningData = [];
    let _afternoonData = [];

    async function render(params) {
        try {
            const app = document.getElementById('app');
            if (!app) {
                console.error('App element not found');
                return;
            }
            
            const id = params.id;
            if (!id) {
                console.error('No cohort ID provided');
                Router.navigate('dashboard');
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
                                <button onclick="Router.navigate('search')" class="text-gray-300 hover:text-white transition-all hover:scale-105 transform px-3 py-2 rounded-lg hover:bg-gray-700/50">
                                    <span class="flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                        Búsqueda
                                    </span>
                                </button>
                            </div>
                            <div class="flex items-center gap-3">
                                <button onclick="CohortView._refreshData()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all hover:scale-105 transform flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                    Actualizar
                                </button>
                                <button onclick="Auth.logout()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all hover:scale-105 transform flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                    </svg>
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </nav>

                    <!-- Main Content -->
                    <div class="p-6">
                        <div class="flex items-center gap-4 mb-6">
                            <button id="back-btn" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-all hover:scale-105 transform flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                </svg>
                                Volver a Sede
                            </button>
                            <h2 class="text-2xl font-bold text-white">Clanes del Corte</h2>
                        </div>

                        <div id="cohort-content">
                            <div class="text-center py-12">
                                <div class="relative">
                                    <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <div class="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-ping opacity-20"></div>
                                </div>
                                <h2 class="text-xl font-semibold text-white mb-2">Cargando Corte...</h2>
                                <p class="text-gray-400">Obteniendo información del corte y sus clanes</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const data = await Api.get(`/dashboard/cohorts/${id}`);
            console.log('Cohort API Response:', data);
            _cohortData = data.cohort;
            _morningData = data.morning || [];
            _afternoonData = data.afternoon || [];
            
            // Set back button
            setTimeout(() => {
                const backBtn = document.getElementById('back-btn');
                if (backBtn) {
                    backBtn.onclick = () => Router.navigate('sede', { id: data.cohort.sede_id });
                }
            }, 100);
            
            renderContent(data);

        } catch (error) {
            console.error('Error loading cohort:', error);
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
                            <h2 class="text-2xl font-bold text-red-400 mb-4">Error al cargar Corte</h2>
                            <p class="text-gray-400 mb-6">${error.message}</p>
                            <button onclick="Router.navigate('dashboard')" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all hover:scale-105 transform">
                                Volver al Dashboard
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }

    function renderContent({ cohort, morning, afternoon }) {
        console.log('=== RENDERING COHORT ===');
        console.log('Cohort:', cohort);
        console.log('Morning clans:', morning);
        console.log('Afternoon clans:', afternoon);
        console.log('=======================');

        const content = document.getElementById('cohort-content');
        
        if (!cohort || (!morning && !afternoon)) {
            console.error('Missing cohort data');
            return;
        }

        // Store data for other functions
        _cohortData = cohort;
        _morningData = morning || [];
        _afternoonData = afternoon || [];

        const totalMorning = (morning?.reduce((sum, c) => sum + (c.total || 0), 0) || 0);
        const totalAfternoon = (afternoon?.reduce((sum, c) => sum + (c.total || 0), 0) || 0);
        const activeMorning = (morning?.reduce((sum, c) => sum + (c.active || 0), 0) || 0);
        const activeAfternoon = (afternoon?.reduce((sum, c) => sum + (c.active || 0), 0) || 0);

        content.innerHTML = `
            <!-- Cohort Header -->
            <div class="group bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50 mb-8 hover:shadow-2xl transition-all duration-300">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                
                <div class="relative z-10">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                                    </svg>
                                </div>
                                <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Clanes ${cohort.name}</h1>
                            </div>
                            <p class="text-gray-400 text-lg">Grupos disponibles en ${cohort.name}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="bg-blue-600/80 backdrop-blur-sm px-4 py-2 rounded-lg group-hover:scale-110 transition-transform">
                                <span class="text-white font-medium">Corte Activo</span>
                            </div>
                            <div class="bg-purple-600/80 backdrop-blur-sm px-4 py-2 rounded-lg group-hover:scale-110 transition-transform">
                                <span class="text-white font-medium">${cohort.route_name === 'basica' ? 'Ruta Básica' : 'Ruta Avanzada'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Stats Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="bg-gray-700/50 backdrop-blur-sm rounded-lg p-6 border border-gray-600/50 group/item hover:bg-gray-700/70 transition-all">
                            <h3 class="text-xl font-semibold text-white mb-4 group/item:text-blue-300 transition-colors">Turno Mañana</h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between group/subitem">
                                    <span class="text-gray-400 group/subitem:text-gray-300 transition-colors">Total Clanes:</span>
                                    <span class="text-white font-medium group/subitem:text-blue-300 transition-colors">${morning?.length || 0}</span>
                                </div>
                                <div class="flex items-center justify-between group/subitem">
                                    <span class="text-gray-400 group/subitem:text-gray-300 transition-colors">Total Couders:</span>
                                    <span class="text-white font-medium group/subitem:text-blue-300 transition-colors">${totalMorning}</span>
                                </div>
                                <div class="flex items-center justify-between group/subitem">
                                    <span class="text-gray-400 group/subitem:text-gray-300 transition-colors">Activos:</span>
                                    <span class="text-white font-medium group/subitem:text-blue-300 transition-colors">${activeMorning}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-700/50 backdrop-blur-sm rounded-lg p-6 border border-gray-600/50 group/item hover:bg-gray-700/70 transition-all">
                            <h3 class="text-xl font-semibold text-white mb-4 group/item:text-blue-300 transition-colors">Turno Tarde</h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between group/subitem">
                                    <span class="text-gray-400 group/subitem:text-gray-300 transition-colors">Total Clanes:</span>
                                    <span class="text-white font-medium group/subitem:text-blue-300 transition-colors">${afternoon?.length || 0}</span>
                                </div>
                                <div class="flex items-center justify-between group/subitem">
                                    <span class="text-gray-400 group/subitem:text-gray-300 transition-colors">Total Couders:</span>
                                    <span class="text-white font-medium group/subitem:text-blue-300 transition-colors">${totalAfternoon}</span>
                                </div>
                                <div class="flex items-center justify-between group/subitem">
                                    <span class="text-gray-400 group/subitem:text-gray-300 transition-colors">Activos:</span>
                                    <span class="text-white font-medium group/subitem:text-blue-300 transition-colors">${activeAfternoon}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Clans Section -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold text-white">Clanes</h2>
                        <span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">${(morning?.length || 0) + (afternoon?.length || 0)} clanes</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="CohortView._sortClans('name')" class="text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                            </svg>
                            Ordenar
                        </button>
                        <button onclick="CohortView._filterClans('all')" class="text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 01-.707.293H4a1 1 0 01-1-1V4z"/>
                            </svg>
                            Todos
                        </button>
                    </div>
                </div>
            </div>

            <!-- Morning Clans -->
            ${morning && morning.length > 0 ? `
            <div class="mb-8">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <div class="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-2h-9m9 2H3m9-2v-1m0 0V3m0 16v1m0-16v16"/>
                        </svg>
                    </div>
                    <span>Turno Mañana</span>
                    <span class="bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-sm">${morning.length} clanes</span>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${morning.map((clan, idx) => `
                    <div class="clan-card group bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer relative" 
                         data-clan-id="${clan.id}"
                         style="animation-delay: ${idx * 100}ms">
                        
                        <div class="relative z-10">
                            <div class="flex items-start justify-between mb-4">
                                <div>
                                    <h4 class="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Clan ${clan.name}</h4>
                                    <p class="text-gray-400 text-sm">Turno mañana</p>
                                </div>
                                <div class="bg-yellow-600/80 backdrop-blur-sm px-3 py-1 rounded-full group-hover:scale-110 transition-transform">
                                    <span class="text-white text-xs font-medium">${clan.total || 0} couders</span>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4">
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-blue-300">${clan.total || 0}</div>
                                    <div class="text-xs text-gray-400">Total</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-green-300">${clan.active || 0}</div>
                                    <div class="text-xs text-gray-400">Activos</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-orange-300">${clan.avgScore || 0}</div>
                                    <div class="text-xs text-gray-400">Puntaje</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Afternoon Clans -->
            ${afternoon && afternoon.length > 0 ? `
            <div class="mb-8">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018 9a9 9 0 018-9 9 9 0 01-18 0zM9 20a9 9 0 002-2v-4a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002 2v-4a2 2 0 00-2-2H4z"/>
                        </svg>
                    </div>
                    <span>Turno Tarde</span>
                    <span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">${afternoon.length} clanes</span>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${afternoon.map((clan, idx) => `
                    <div class="clan-card group bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer relative" 
                         data-clan-id="${clan.id}"
                         style="animation-delay: ${idx * 100}ms">
                        
                        <div class="relative z-10">
                            <div class="flex items-start justify-between mb-4">
                                <div>
                                    <h4 class="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Clan ${clan.name}</h4>
                                    <p class="text-gray-400 text-sm">Turno tarde</p>
                                </div>
                                <div class="bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full group-hover:scale-110 transition-transform">
                                    <span class="text-white text-xs font-medium">${clan.total || 0} couders</span>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4">
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-blue-300">${clan.total || 0}</div>
                                    <div class="text-xs text-gray-400">Total</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-green-300">${clan.active || 0}</div>
                                    <div class="text-xs text-gray-400">Activos</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-orange-300">${clan.avgScore || 0}</div>
                                    <div class="text-xs text-gray-400">Puntaje</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            ` : ''}

            ${(!morning || morning.length === 0) && (!afternoon || afternoon.length === 0) ? `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-300 mb-2">No hay clanes registrados</h3>
                <p class="text-gray-500">No se encontraron clanes en este corte</p>
            </div>
            ` : ''}
        `;

        // Add entrance animations
        _addEntranceAnimations();
        
        // Add click listeners to clan cards
        _addClanClickListeners();
    }

    function _addClanClickListeners() {
        const cards = document.querySelectorAll('.clan-card');
        console.log('Adding click listeners to', cards.length, 'clan cards');
        cards.forEach(card => {
            const clanId = card.getAttribute('data-clan-id');
            card.addEventListener('click', function(e) {
                console.log('Clan card clicked:', clanId);
                e.preventDefault();
                e.stopPropagation();
                window.location.hash = '#clan?id=' + clanId;
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
        const btn = event.target.closest('button');
        const originalContent = btn.innerHTML;
        
        btn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Actualizando...';
        btn.disabled = true;
        
        try {
            const data = await Api.get(`/dashboard/cohorts/${_cohortData.id}`);
            _cohortData = data.cohort;
            _morningData = data.morning || [];
            _afternoonData = data.afternoon || [];
            renderContent(data);
            
            // Show success feedback
            btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Actualizado';
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }, 2000);
        } catch (error) {
            btn.innerHTML = originalContent;
            btn.disabled = false;
            console.error('Refresh error:', error);
        }
    }

    function _sortClans(sortBy) {
        const allClans = [...(_morningData || []), ...(_afternoonData || [])];
        
        if (sortBy === 'name') {
            allClans.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
        
        // Re-separate morning and afternoon
        _morningData = allClans.filter(clan => clan.shift === 'morning');
        _afternoonData = allClans.filter(clan => clan.shift === 'afternoon');
        
        // Re-render with sorted data
        renderContent({ cohort: _cohortData, morning: _morningData, afternoon: _afternoonData });
        
        // Show feedback
        const btn = event?.target?.closest('button');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Ordenado';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 1000);
        }
    }

    function _filterClans(filter) {
        // For now, just show all clans
        renderContent({ cohort: _cohortData, morning: _morningData, afternoon: _afternoonData });
        
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
        _sortClans,
        _filterClans
    };
})();

// Make globally available
window.CohortView = CohortView;
