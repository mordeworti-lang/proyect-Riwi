'use strict';

const app             = require('./app');
const connectPostgres = require('./config/postgres');
const { PORT, NODE_ENV } = require('./config/env');

async function startServer() {
    try {
        await connectPostgres();

        app.listen(PORT, () => {
            console.info(`[server] Running on port ${PORT} [${NODE_ENV}]`);
            console.info(`[server] Open: http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('[server] Failed to start:', err.message);
        process.exit(1);
    }
}

startServer();
