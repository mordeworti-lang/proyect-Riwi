// Script de diagnóstico para verificar clicks en tarjetas
(function() {
    'use strict';
    
    console.log('=== DIAGNÓSTICO DE CLICKS ===');
    
    // Verificar tarjetas de sede
    const sedeCards = document.querySelectorAll('.sede-card');
    console.log('Tarjetas de sede encontradas:', sedeCards.length);
    
    sedeCards.forEach((card, idx) => {
        const sedeId = card.getAttribute('data-sede-id');
        console.log(`Tarjeta ${idx}: data-sede-id="${sedeId}"`);
        
        // Verificar si tiene onclick asignado
        console.log(`  - onclick:`, card.onclick ? 'SÍ' : 'NO');
        
        // Verificar estilos que podrían bloquear clicks
        const styles = window.getComputedStyle(card);
        console.log(`  - pointer-events:`, styles.pointerEvents);
        console.log(`  - cursor:`, styles.cursor);
        console.log(`  - z-index:`, styles.zIndex);
        
        // Agregar listener de diagnóstico
        card.addEventListener('click', function(e) {
            console.log('>>> CLICK DETECTADO en tarjeta de sede:', sedeId);
            console.log('  - Target:', e.target.tagName);
            console.log('  - CurrentTarget:', e.currentTarget.tagName);
        });
    });
    
    // Verificar si hay errores previos en la consola
    console.log('=== FIN DEL DIAGNÓSTICO ===');
    console.log('Si no ves "CLICK DETECTADO" al hacer click, hay un problema de eventos.');
    console.log('Si ves "CLICK DETECTADO" pero no navega, hay un problema en el handler.');
})();
