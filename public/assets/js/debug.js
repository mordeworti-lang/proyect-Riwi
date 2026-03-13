// Debug helper - loaded first
window.DEBUG = {
    log: function(msg) {
        console.log('[DEBUG]', msg);
    },
    nav: function(route, params) {
        console.log('[DEBUG] Navigating to:', route, params);
        try {
            if (window.Router && window.Router.navigate) {
                window.Router.navigate(route, params);
            } else {
                console.error('[DEBUG] Router not available');
                // Fallback
                var hash = '#' + route;
                if (params && params.id) {
                    hash += '?id=' + params.id;
                }
                window.location.hash = hash;
            }
        } catch(e) {
            console.error('[DEBUG] Navigation error:', e);
        }
    }
};

// Make navigation function globally available
window.goTo = function(route, id) {
    console.log('[goTo] Called with:', route, id);
    var params = id ? { id: id } : {};
    window.DEBUG.nav(route, params);
};
