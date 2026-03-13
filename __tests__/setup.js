'use strict';
// Suppress env validation during tests
process.env.DATABASE_URL       = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET         = 'test_secret_at_least_32_chars_long_12345';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_chars_long_12345';
process.env.OPENAI_API_KEY    = 'test-dummy-key-for-testing-only';
process.env.NODE_ENV           = 'test';
