'use strict';

const AppError        = require('../src/exceptions/AppError');
const NotFoundError   = require('../src/exceptions/NotFoundError');
const UnauthorizedError = require('../src/exceptions/UnauthorizedError');
const ValidationError = require('../src/exceptions/ValidationError');
const ConflictError   = require('../src/exceptions/ConflictError');

describe('Exceptions', () => {
    test('AppError sets message and statusCode', () => {
        const err = new AppError('Something broke', 500);
        expect(err.message).toBe('Something broke');
        expect(err.statusCode).toBe(500);
        expect(err).toBeInstanceOf(Error);
    });

    test('NotFoundError has statusCode 404', () => {
        const err = new NotFoundError('Not found');
        expect(err.statusCode).toBe(404);
        expect(err.name).toBe('NotFoundError');
    });

    test('UnauthorizedError has statusCode 401', () => {
        const err = new UnauthorizedError();
        expect(err.statusCode).toBe(401);
    });

    test('ValidationError has statusCode 400', () => {
        const err = new ValidationError('Bad input');
        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('Bad input');
    });

    test('ConflictError has statusCode 409', () => {
        const err = new ConflictError();
        expect(err.statusCode).toBe(409);
    });

    test('AppError default statusCode is 500', () => {
        const err = new AppError('oops');
        expect(err.statusCode).toBe(500);
    });

    test('All custom errors are instanceof AppError', () => {
        expect(new NotFoundError()).toBeInstanceOf(AppError);
        expect(new UnauthorizedError()).toBeInstanceOf(AppError);
        expect(new ValidationError()).toBeInstanceOf(AppError);
        expect(new ConflictError()).toBeInstanceOf(AppError);
    });
});
