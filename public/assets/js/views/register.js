/* =============================================================
   register.js — Register view for new interventors
   Backend: POST /api/auth/register
   ============================================================= */

const RegisterView = (() => {
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

                <!-- Register Container -->
                <div class="relative z-10 w-full max-w-md mx-auto p-6">
                    <div class="group bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50 hover:shadow-3xl transition-all duration-300">
                        <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                        
                        <div class="relative z-10">
                            <!-- Logo and Title -->
                            <div class="text-center mb-8">
                                <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                                    </svg>
                                </div>
                                <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DataCore</h1>
                                <p class="text-gray-400">Register New Interventor</p>
                            </div>

                            <!-- Auth Toggle Button -->
                            <div class="auth-toggle-container">
                                <div class="bg-gray-700/50 backdrop-blur-sm rounded-lg p-1 flex">
                                    <button 
                                        type="button" 
                                        id="login-tab"
                                        class="auth-tab flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 text-gray-400 hover:text-white"
                                        data-view="login"
                                    >
                                        Sign In
                                    </button>
                                    <button 
                                        type="button" 
                                        id="register-tab"
                                        class="auth-tab flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 bg-blue-600 text-white"
                                        data-view="register"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>

                            <!-- Register Form -->
                            <form id="register-form" class="space-y-6">
                                <!-- Full Name Field -->
                                <div>
                                    <label class="block text-gray-300 mb-2 text-sm font-medium">Full Name</label>
                                    <div class="relative group">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                        </div>
                                        <input 
                                            type="text" 
                                            id="fullName" 
                                            name="fullName"
                                            class="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            placeholder="Juan Pérez García"
                                            required
                                        >
                                    </div>
                                </div>

                                <!-- Email Field -->
                                <div>
                                    <label class="block text-gray-300 mb-2 text-sm font-medium">Institutional Email</label>
                                    <div class="relative group">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                            </svg>
                                        </div>
                                        <input 
                                            type="email" 
                                            id="email" 
                                            name="email"
                                            class="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            placeholder="interventor@clinica.com"
                                            required
                                        >
                                    </div>
                                </div>
                                
                                <!-- Password Field -->
                                <div>
                                    <label class="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                                    <div class="relative group">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v6z"/>
                                            </svg>
                                        </div>
                                        <input 
                                            type="password" 
                                            id="password" 
                                            name="password"
                                            class="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            placeholder="Minimum 8 characters"
                                            required
                                            minlength="8"
                                        >
                                    </div>
                                </div>

                                <!-- Confirm Password Field -->
                                <div>
                                    <label class="block text-gray-300 mb-2 text-sm font-medium">Confirm Password</label>
                                    <div class="relative group">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                        </div>
                                        <input 
                                            type="password" 
                                            id="confirmPassword" 
                                            name="confirmPassword"
                                            class="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            placeholder="Repeat password"
                                            required
                                            minlength="8"
                                        >
                                    </div>
                                </div>

                                <!-- Role Selection (Hidden for now - default to interventor) -->
                                <input type="hidden" id="roleId" name="roleId" value="1">

                                <!-- Terms Checkbox -->
                                <div class="flex items-start">
                                    <input 
                                        type="checkbox" 
                                        id="terms" 
                                        name="terms"
                                        class="w-4 h-4 bg-gray-700/50 border border-gray-600 rounded text-blue-600 focus:ring-2 focus:ring-blue-500/50 transition-colors mt-1"
                                        required
                                    >
                                    <label for="terms" class="ml-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                                        I accept the terms and conditions of use of the DataCore system
                                    </label>
                                </div>

                                <!-- Register Button -->
                                <button 
                                    type="submit" 
                                    id="register-btn"
                                    class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    <span id="btn-text">Register</span>
                                    <svg id="btn-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                                    </svg>
                                </button>
                            </form>

                            <!-- Back to Login -->
                            <div class="mt-6 text-center">
                                <p class="text-gray-400 text-sm">
                                    Already have an account? 
                                    <button onclick="Router.navigate('login')" class="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                        Sign In
                                    </button>
                                </p>
                            </div>

                            <!-- Registration Tips -->
                            <div class="mt-6 p-4 bg-blue-600/10 backdrop-blur-sm rounded-lg border border-blue-600/30">
                                <div class="flex items-start gap-3">
                                    <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <div class="text-sm">
                                        <p class="text-blue-300 font-medium mb-1">Registration Requirements:</p>
                                        <ul class="text-gray-400 space-y-1">
                                            <li>• Full name of the interventor</li>
                                            <li>• Valid institutional email</li>
                                            <li>• Password minimum 8 characters</li>
                                            <li>• Accept terms and conditions</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <!-- Status Message -->
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
        document.getElementById('register-form').addEventListener('submit', _handleRegister);
        
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

    function _addPasswordValidation() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (password && confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                if (confirmPassword.value && password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('Passwords do not match');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
            
            password.addEventListener('input', () => {
                if (confirmPassword.value && password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('Passwords do not match');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
        }
    }

    async function _handleRegister(e) {
        e.preventDefault();
        
        if (_isLoading) return;
        
        const formData = new FormData(e.target);
        const fullName = formData.get('fullName').trim();
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const terms = formData.get('terms');
        const roleId = 1; // Default to interventor role
        
        const btn = document.getElementById('register-btn');
        const btnText = document.getElementById('btn-text');
        const btnIcon = document.getElementById('btn-icon');
        
        // Validate inputs
        if (!fullName || !email || !password || !confirmPassword) {
            _showStatus('error', 'Please complete all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            _showStatus('error', 'Passwords do not match');
            return;
        }
        
        if (password.length < 8) {
            _showStatus('error', 'Password must be at least 8 characters');
            return;
        }
        
        if (!terms) {
            _showStatus('error', 'You must accept the terms and conditions');
            return;
        }
        
        if (!email.includes('@')) {
            _showStatus('error', 'Please enter a valid email');
            return;
        }
        
        // Show loading state
        _isLoading = true;
        btn.disabled = true;
        btnText.textContent = 'Registering...';
        btnIcon.innerHTML = `
            <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
        `;
        
        try {
            // Call API to register
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password,
                    roleId
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error registering user');
            }
            
            _showStatus('success', 'Registration successful! Redirecting to login...');
            
            // Redirect to login after successful registration
            setTimeout(() => {
                Router.navigate('login');
            }, 2000);
            
        } catch (error) {
            console.error('Register error:', error);
            _showStatus('error', error.message || 'Error registering user');
        } finally {
            // Reset button state
            _isLoading = false;
            btn.disabled = false;
            btnText.textContent = 'Register';
            btnIcon.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
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
        
        // Add appropriate styling
        if (type === 'success') {
            statusDiv.classList.add('border-green-500', 'bg-green-500/10');
            statusIcon.innerHTML = `
                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            `;
            statusText.className = 'text-green-300';
        } else if (type === 'error') {
            statusDiv.classList.add('border-red-500', 'bg-red-500/10');
            statusIcon.innerHTML = `
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            `;
            statusText.className = 'text-red-300';
        } else {
            statusDiv.classList.add('border-yellow-500', 'bg-yellow-500/10');
            statusIcon.innerHTML = `
                <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            `;
            statusText.className = 'text-yellow-300';
        }
        
        statusText.textContent = message;
        
        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                if (statusDiv) {
                    statusDiv.classList.add('hidden');
                }
            }, 5000);
        }
    }

    return { render };
})();

// Make globally available
window.RegisterView = RegisterView;
