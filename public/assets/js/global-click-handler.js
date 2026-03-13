/**
 * Global Click Handler - Solo para elementos con onclick inline restantes
 */
(function() {
    'use strict';
    
    console.log('[GlobalClickHandler] Iniciando...');
    
    function init() {
        // Interceptar clicks solo para elementos con onclick inline
        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // Buscar si el click fue en un elemento con onclick
            const card = target.closest('[onclick]');
            
            if (!card) return;
            
            // Verificar que NO sea una tarjeta (las tarjetas manejan sus propios clicks)
            if (card.classList.contains('sede-card') || 
                card.classList.contains('cohort-card') || 
                card.classList.contains('clan-card') || 
                card.classList.contains('couder-card')) {
                return; // Dejar que el listener específico maneje el click
            }
            
            const onclickValue = card.getAttribute('onclick');
            
            // Router.navigate
            if (onclickValue.includes('Router.navigate')) {
                e.preventDefault();
                e.stopPropagation();
                
                const match = onclickValue.match(/Router\.navigate\(['"](\w+)['"]\s*,?\s*(\{[^}]*\})?\)/);
                if (match) {
                    const route = match[1];
                    const params = match[2];
                    
                    let hash = '#' + route;
                    if (params) {
                        const idMatch = params.match(/id:\s*(\d+)/);
                        const ccMatch = params.match(/cc:\s*['"]([^'"]+)['"]/);
                        if (idMatch) hash += '?id=' + idMatch[1];
                        if (ccMatch) hash += '?cc=' + encodeURIComponent(ccMatch[1]);
                    }
                    
                    console.log('[GCH] Navigating to:', hash);
                    window.location.hash = hash;
                    return false;
                }
            }
            
            // Auth.logout
            if (onclickValue.includes('Auth.logout')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[GCH] Logout');
                if (window.Auth && window.Auth.logout) {
                    window.Auth.logout();
                }
                window.location.hash = '#login';
                return false;
            }
            
            // DashboardView._refreshData
            if (onclickValue.includes('DashboardView._refreshData')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[GCH] Refresh dashboard');
                if (window.DashboardView && window.DashboardView._refreshData) {
                    window.DashboardView._refreshData();
                }
                return false;
            }
            
            // DashboardView._sortSedes
            if (onclickValue.includes('DashboardView._sortSedes')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[GCH] Sort sedes');
                if (window.DashboardView && window.DashboardView._sortSedes) {
                    window.DashboardView._sortSedes('name');
                }
                return false;
            }
            
            // DashboardView._showKpiDetails
            if (onclickValue.includes('DashboardView._showKpiDetails')) {
                e.preventDefault();
                e.stopPropagation();
                const match = onclickValue.match(/DashboardView\._showKpiDetails\(['"](\w+)['"]\)/);
                if (match && window.DashboardView && window.DashboardView._showKpiDetails) {
                    console.log('[GCH] Show KPI details:', match[1]);
                    window.DashboardView._showKpiDetails(match[1]);
                }
                return false;
            }
            
        }, true);
        
        console.log('[GlobalClickHandler] Inicializado correctamente');
    }
    
    // Iniciar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
