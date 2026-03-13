'use strict';

const { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } = require('../src/utils/jwt');

describe('JWT Utils', () => {
    const payload = { id: 1, email: 'test@test.com', role: 'mentor' };

    test('signAccessToken returns a string', () => {
        const token = signAccessToken(payload);
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3);
    });

    test('verifyAccessToken decodes correct payload', () => {
        const token = signAccessToken(payload);
        const decoded = verifyAccessToken(token);
        expect(decoded.id).toBe(payload.id);
        expect(decoded.email).toBe(payload.email);
        expect(decoded.role).toBe(payload.role);
    });

    test('verifyAccessToken throws on invalid token', () => {
        expect(() => verifyAccessToken('invalid.token.here')).toThrow();
    });

    test('signRefreshToken returns a valid JWT', () => {
        const token = signRefreshToken(payload);
        const decoded = verifyRefreshToken(token);
        expect(decoded.id).toBe(payload.id);
    });

    test('verifyRefreshToken throws on tampered token', () => {
        const token = signRefreshToken(payload);
        const tampered = token.slice(0, -5) + 'XXXXX';
        expect(() => verifyRefreshToken(tampered)).toThrow();
    });
});
