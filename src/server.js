'use strict';

const app             = require('./app');
const connectPostgres = require('./config/postgres');
const { PORT, NODE_ENV } = require('./config/env');

async function startServer() {
    try {
        await connectPostgres();

        const server = app.listen(PORT, '0.0.0.0', () => {
            console.info(`[server] Running on port ${PORT} [${NODE_ENV}]`);
            console.info(`[server] Open: http://localhost:${PORT}`);
            console.info(`[server] Server listening on all interfaces (0.0.0.0:${PORT})`);
        });
        
        server.on('error', (err) => {
            console.error('[server] Server error:', err);
        });
        
    } catch (err) {
        console.error('[server] Failed to start:', err.message);
        console.error('[server] Stack:', err.stack);
        process.exit(1);
    }
}

startServer();
