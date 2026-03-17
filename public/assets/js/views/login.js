/* =============================================================
   login.js — Login view - FULL INTERACTIVITY
   Backend returns: JWT tokens + user data
   ============================================================= */

const LoginView = (() => {
    let _isLoading = false;

    async function render() {
        const app = document.getElementById('app');
        if (!app) {
            console.error('App element not found');
            return;
        }

        // Simple clear - just empty the app
        app.innerHTML = '';

        app.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
                <!-- Animated Background Elements -->
                <div class="absolute inset-0 overflow-hidden">
                    <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full filter blur-3xl opacity-30"></div>
                </div>

                <!-- Login Container -->
                <div class="relative z-10 w-full max-w-md mx-auto p-6">
                    <div class="group bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50 hover:shadow-3xl transition-all duration-300">
                        <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                        
                        <div class="relative z-10">
                            <!-- Logo and Title -->
                            <div class="text-center mb-8">
                                <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4-6 6 2 2 4-4-6 6z"/>
                                    </svg>
                                </div>
                                <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DataCore</h1>
                                <p class="text-gray-400">Clinical Management System</p>
                            </div>

                            <!-- Auth Toggle Button -->
                            <div class="auth-toggle-container">
                                <div class="bg-gray-700/50 backdrop-blur-sm rounded-lg p-1 flex">
                                    <button 
                                        type="button" 
                                        id="login-tab"
                                        class="auth-tab flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 bg-blue-600 text-white"
                                        data-view="login"
                                    >
                                        Sign In
                                    </button>
                                    <button 
                                        type="button" 
                                        id="register-tab"
                                        class="auth-tab flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 text-gray-400 hover:text-white"
                                        data-view="register"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>

                            <!-- Login Form -->
                            <div class="space-y-6">
                                <form id="login-form" class="space-y-6">
                                <div>
                                    <label class="block text-gray-300 mb-2 text-sm font-medium">Email</label>
                                    <div class="relative group">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                        </div>
                                        <input 
                                            type="email" 
                                            id="email" 
                                            value="interventor@clinica.com"
                                            class="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            placeholder="email@example.com"
                                            required
                                        >
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                                    <div class="relative group">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002 2h-2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002 2v2a2 2 0 002-2V11a2 2 0 00-2-2h-6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002 2v6z"/>
                                            </svg>
                                        </div>
                                        <input 
                                            type="password" 
                                            id="password" 
                                            placeholder="Password"
                                            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                        >
                                    </div>
                                </div>

                                <!-- Remember Me Checkbox -->
                                <div class="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="remember" 
                                        class="w-4 h-4 bg-gray-700/50 border border-gray-600 rounded text-blue-600 focus:ring-2 focus:ring-blue-500/50 transition-colors"
                                        checked
                                    >
                                    <label for="remember" class="ml-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                                        Remember Me
                                    </label>
                                </div>

                                <!-- Login Button -->
                                <button 
                                    type="submit" 
                                    id="login-btn"
                                    class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    <span id="btn-text">Sign In</span>
                                    <svg id="btn-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m0 0l-3 3m3-6H9a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002 2V11a2 2 0 00-2-2h-6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002 2V11a2 2 0 00-2-2h-6a2 2 0 00-2 2v6z"/>
                                    </svg>
                                </button>
                                </form>
                            </div>

                            <!-- Login Tips -->
                            <div class="mt-6 p-4 bg-blue-600/10 backdrop-blur-sm rounded-lg border border-blue-600/30">
                                <div class="flex items-start gap-3">
                                    <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <div class="text-sm">
                                        <p class="text-blue-300 font-medium mb-1">Demo Credentials:</p>
                                        <ul class="text-gray-400 space-y-1">
                                            <li>• Email: interventor@clinica.com</li>
                                            <li>• Password: Interventor1234!</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <!-- Status message -->
                            <div id="status-message" class="hidden">
                                <div class="p-4 rounded-lg border flex items-center gap-3">
                                    <div id="status-icon"></div>
                                    <p id="status-text" class="text-sm"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Set up form submission
        document.getElementById('login-form').addEventListener('submit', _handleLogin);
        
        // Add input focus effects
        _addInputEffects();
        
        // Set up toggle tabs
        _setupToggleTabs();
    }

    function _setupToggleTabs() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        
        if (!loginTab || !registerTab) {
            console.error('Toggle tabs not found');
            return;
        }
        
        // Event listener for Login tab
        loginTab.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            Router.navigate('login');
        });
        
        // Event listener for Register tab
        registerTab.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            Router.navigate('register');
        });
    }

    function _addInputEffects() {
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.parentElement.classList.add('ring-2', 'ring-blue-500/50');
            });
            input.addEventListener('blur', () => {
                input.parentElement.parentElement.classList.remove('ring-2', 'ring-blue-500/50');
            });
        });
    }

    async function _handleLogin(e) {
        e.preventDefault();
        
        if (_isLoading) return;
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        const btn = document.getElementById('login-btn');
        const btnText = document.getElementById('btn-text');
        const btnIcon = document.getElementById('btn-icon');
        
        // Validate inputs
        if (!email || !password) {
            _showStatus('error', 'Please complete all fields');
            return;
        }
        
        if (!email.includes('@')) {
            _showStatus('error', 'Please enter a valid email');
            return;
        }
        
        // Show loading state
        _isLoading = true;
        btn.disabled = true;
        btnText.textContent = 'Signing in...';
        btnIcon.innerHTML = `
            <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
        `;
        
        try {
            // Auth.login handles everything: calls API, stores tokens, returns user
            const user = await Auth.login(email, password);
            
            _showStatus('success', 'Login successful!');
            
            // Redirect to dashboard
            setTimeout(() => {
                Router.navigate('dashboard');
            }, 800);
            
        } catch (error) {
            console.error('Login error:', error);
            _showStatus('error', error.message || 'Error logging in');
        } finally {
            // Reset button state
            _isLoading = false;
            btn.disabled = false;
            btnText.textContent = 'Sign In';
            btnIcon.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
            `;
        }
    }

    function _showStatus(type, message) {
        const statusDiv = document.getElementById('status-message');
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');
        
        if (!statusDiv || !statusIcon || !statusText) {
            console.error('Status elements not found');
            return;
        }
        
        // Remove all status classes
        statusDiv.classList.remove('hidden');
        statusDiv.classList.remove('border-green-500', 'border-red-500', 'border-yellow-500');
        statusDiv.classList.remove('bg-green-500/10', 'bg-red-500/10', 'bg-yellow-500/10');
        statusText.classList.remove('text-green-300', 'text-red-300', 'text-yellow-300');
        
        // Add appropriate classes based on type
        if (type === 'success') {
            statusDiv.classList.add('border-green-500', 'bg-green-500/10');
            statusText.classList.add('text-green-300');
            statusIcon.innerHTML = `
                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            `;
        } else if (type === 'error') {
            statusDiv.classList.add('border-red-500', 'bg-red-500/10');
            statusText.classList.add('text-red-300');
            statusIcon.innerHTML = `
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            `;
        } else {
            statusDiv.classList.add('border-yellow-500', 'bg-yellow-500/10');
            statusText.classList.add('text-yellow-300');
            statusIcon.innerHTML = `
                <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
            `;
        }
        
        statusText.textContent = message;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 5000);
    }

    return {
        render
    };
})();
