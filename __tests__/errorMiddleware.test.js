'use strict';

const errorMiddleware = require('../src/middleware/errorMiddleware');
const AppError        = require('../src/exceptions/AppError');
const NotFoundError   = require('../src/exceptions/NotFoundError');

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
}

describe('errorMiddleware', () => {
    const next = jest.fn();

    test('returns correct status for AppError', () => {
        const req = {};
        const res = mockRes();
        const err = new NotFoundError('Not found');
        errorMiddleware(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, error: 'Not found' });
    });

    test('returns 409 for PG unique constraint error', () => {
        const res = mockRes();
        const err = { code: '23505' };
        errorMiddleware(err, {}, res, next);
        expect(res.status).toHaveBeenCalledWith(409);
    });

    test('returns 400 for PG foreign key error', () => {
        const res = mockRes();
        const err = { code: '23503' };
        errorMiddleware(err, {}, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 500 for unknown errors', () => {
        const res = mockRes();
        const err = new Error('Something unexpected');
        errorMiddleware(err, {}, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ ok: false, error: 'Internal server error' });
    });
});
