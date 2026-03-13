// Script para probar los event listeners
console.log('=== INICIANDO PRUEBA DE EVENT LISTENERS ===');

// Esperar a que la página cargue completamente
setTimeout(() => {
    // Verificar tarjetas de sedes
    const sedeCards = document.querySelectorAll('.sede-card');
    console.log('Tarjetas de sede encontradas:', sedeCards.length);
    sedeCards.forEach((card, idx) => {
        const sedeId = card.getAttribute('data-sede-id');
        console.log(`Sede ${idx}: ID=${sedeId}, listeners=${getEventListeners(card)?.click?.length || 0}`);
    });

    // Verificar tarjetas de cohort
    const cohortCards = document.querySelectorAll('.cohort-card');
    console.log('Tarjetas de cohort encontradas:', cohortCards.length);
    cohortCards.forEach((card, idx) => {
        const cohortId = card.getAttribute('data-cohort-id');
        console.log(`Cohort ${idx}: ID=${cohortId}, listeners=${getEventListeners(card)?.click?.length || 0}`);
    });

    // Verificar tarjetas de clan
    const clanCards = document.querySelectorAll('.clan-card');
    console.log('Tarjetas de clan encontradas:', clanCards.length);
    clanCards.forEach((card, idx) => {
        const clanId = card.getAttribute('data-clan-id');
        console.log(`Clan ${idx}: ID=${clanId}, listeners=${getEventListeners(card)?.click?.length || 0}`);
    });

    // Verificar tarjetas de couder
    const couderCards = document.querySelectorAll('.couder-card');
    console.log('Tarjetas de couder encontradas:', couderCards.length);
    couderCards.forEach((card, idx) => {
        const couderCc = card.getAttribute('data-couder-cc');
        console.log(`Couder ${idx}: CC=${couderCc}, listeners=${getEventListeners(card)?.click?.length || 0}`);
    });

    // Verificar botones de navegación
    const navButtons = document.querySelectorAll('nav button');
    console.log('Botones de navegación encontrados:', navButtons.length);
    navButtons.forEach((btn, idx) => {
        const listeners = getEventListeners(btn);
        console.log(`Nav button ${idx}: listeners=${Object.keys(listeners || {}).length}`);
    });

    // Verificar botones específicos de couder
    const saveBtn = document.getElementById('btn-save-intervention');
    const aiBtn = document.getElementById('btn-generate-ai');
    console.log('Botón guardar intervención:', saveBtn ? 'ENCONTRADO' : 'NO ENCONTRADO', saveBtn ? `listeners=${getEventListeners(saveBtn)?.click?.length || 0}` : '');
    console.log('Botón generar IA:', aiBtn ? 'ENCONTRADO' : 'NO ENCONTRADO', aiBtn ? `listeners=${getEventListeners(aiBtn)?.click?.length || 0}` : '');

    console.log('=== PRUEBA COMPLETADA ===');
}, 2000);

// Función para simular clicks
function testClick(selector, description) {
    setTimeout(() => {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`Haciendo click en: ${description}`);
            element.click();
        } else {
            console.log(`No se encontró: ${description}`);
        }
    }, 3000);
}

// Simular clicks en algunas tarjetas
testClick('.sede-card:first-child', 'Primera tarjeta de sede');
testClick('.cohort-card:first-child', 'Primera tarjeta de cohort');
testClick('.clan-card:first-child', 'Primera tarjeta de clan');
testClick('.couder-card:first-child', 'Primera tarjeta de couder');
