/**
 * Global Click Interceptor - Solución definitiva para clicks
 * Este archivo intercepta TODOS los clicks en la página
 */
(function() {
    'use strict';
    
    console.log('[ClickInterceptor] Iniciando...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('[ClickInterceptor] Inicializado');
        
        // Interceptar todos los clicks en el documento
        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // Buscar el elemento clickeado o sus padres
            const clickable = target.closest('[onclick], .sede-card, .cohort-card, .clan-card, .couder-card, button');
            
            if (!clickable) return;
            
            // CASO 1: Elementos con onclick
            if (clickable.hasAttribute('onclick')) {
                const onclickValue = clickable.getAttribute('onclick');
                
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
                        
                        console.log('[ClickInterceptor] Navegando a:', hash);
                        window.location.hash = hash;
                        return false;
                    }
                }
                
                // Auth.logout
                if (onclickValue.includes('Auth.logout')) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[ClickInterceptor] Logout');
                    if (window.Auth && window.Auth.logout) {
                        window.Auth.logout();
                    }
                    window.location.hash = '#login';
                    return false;
                }
                
                // View functions (DashboardView, SedeView, etc.)
                if (onclickValue.match(/(DashboardView|SedeView|CohortView|ClanView|CouderView|SearchView)\._/)) {
                    // Dejar que el onclick original maneje esto
                    console.log('[ClickInterceptor] View function call:', onclickValue);
                }
            }
            
            // CASO 2: Tarjetas de sede
            if (clickable.classList.contains('sede-card')) {
                e.preventDefault();
                e.stopPropagation();
                const sedeId = clickable.getAttribute('data-sede-id');
                if (sedeId) {
                    console.log('[ClickInterceptor] Sede clickeada:', sedeId);
                    window.location.hash = '#sede?id=' + sedeId;
                }
                return false;
            }
            
            // CASO 3: Tarjetas de cohort
            if (clickable.classList.contains('cohort-card')) {
                e.preventDefault();
                e.stopPropagation();
                const cohortId = clickable.getAttribute('data-cohort-id');
                if (cohortId) {
                    console.log('[ClickInterceptor] Cohort clickeada:', cohortId);
                    window.location.hash = '#cohort?id=' + cohortId;
                }
                return false;
            }
            
            // CASO 4: Tarjetas de clan
            if (clickable.classList.contains('clan-card')) {
                e.preventDefault();
                e.stopPropagation();
                const clanId = clickable.getAttribute('data-clan-id');
                if (clanId) {
                    console.log('[ClickInterceptor] Clan clickeado:', clanId);
                    window.location.hash = '#clan?id=' + clanId;
                }
                return false;
            }
            
            // CASO 5: Tarjetas de couder
            if (clickable.classList.contains('couder-card')) {
                e.preventDefault();
                e.stopPropagation();
                const couderCc = clickable.getAttribute('data-couder-cc');
                if (couderCc) {
                    console.log('[ClickInterceptor] Couder clickeado:', couderCc);
                    window.location.hash = '#couder?cc=' + encodeURIComponent(couderCc);
                }
                return false;
            }
            
        }, true); // Use capture phase
        
        // También agregar delegación después de que las vistas rendericen
        // Usando MutationObserver para detectar nuevos elementos
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    // Re-aplicar listeners si es necesario
                    ensureClickListeners();
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function ensureClickListeners() {
        // Asegurar que todas las tarjetas tengan cursor pointer
        const cards = document.querySelectorAll('.sede-card, .cohort-card, .clan-card, .couder-card');
        cards.forEach(card => {
            card.style.cursor = 'pointer';
        });
    }
    
    // Exponer función para uso manual si es necesario
    window.ClickInterceptor = {
        refresh: ensureClickListeners
    };
    
})();
