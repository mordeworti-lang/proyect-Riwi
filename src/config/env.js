'use strict';

require('dotenv').config();

// Required — app cannot start without these
const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
];

// Set default values for development if not provided
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required for production use');
}
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required for production use');
}
if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable is required for production use');
}
// Optional — warn but don't crash
if (!process.env.OPENAI_API_KEY) {
    console.warn('[config] OPENAI_API_KEY not set — AI analysis feature will not work');
}

requiredVars.forEach((key) => {
    if (!process.env[key]) {
        console.error(`[config] Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

module.exports = {
    PORT:                   parseInt(process.env.PORT, 10) || 3000,
    NODE_ENV:               process.env.NODE_ENV || 'development',
    DATABASE_URL:           process.env.DATABASE_URL,
    JWT_SECRET:             process.env.JWT_SECRET,
    JWT_REFRESH_SECRET:     process.env.JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN:         process.env.JWT_EXPIRES_IN || '8h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    OPENAI_API_KEY:        process.env.OPENAI_API_KEY || '',
    FRONTEND_URL:           process.env.FRONTEND_URL || '*',
};
