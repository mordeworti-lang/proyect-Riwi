'use strict';

const authMiddleware = require('../src/middleware/authMiddleware');
const { signAccessToken } = require('../src/utils/jwt');
const UnauthorizedError   = require('../src/exceptions/UnauthorizedError');

describe('authMiddleware', () => {
    const next = jest.fn();

    beforeEach(() => next.mockClear());

    function makeReq(authHeader) {
        return { headers: { authorization: authHeader } };
    }

    test('calls next with UnauthorizedError if no Authorization header', () => {
        authMiddleware(makeReq(undefined), {}, next);
        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('calls next with UnauthorizedError if Bearer prefix missing', () => {
        authMiddleware(makeReq('Token abc123'), {}, next);
        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('calls next with UnauthorizedError for invalid token', () => {
        authMiddleware(makeReq('Bearer invalidtoken'), {}, next);
        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('sets req.user and calls next() for valid token', () => {
        const token = signAccessToken({ id: 1, email: 'a@b.com', role: 'mentor' });
        const req = makeReq(`Bearer ${token}`);
        authMiddleware(req, {}, next);
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(1);
        expect(next).toHaveBeenCalledWith(); // no args = success
    });
});
