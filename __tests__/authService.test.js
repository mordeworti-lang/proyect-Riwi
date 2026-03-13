'use strict';

jest.mock('../src/repositories/userRepository');
jest.mock('bcryptjs');

const AuthService      = require('../src/services/authService');
const UserRepository   = require('../src/repositories/userRepository');
const bcrypt           = require('bcryptjs');
const UnauthorizedError = require('../src/exceptions/UnauthorizedError');
const ValidationError  = require('../src/exceptions/ValidationError');

describe('AuthService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('login throws ValidationError if fields are missing', async () => {
        await expect(AuthService.login('', '')).rejects.toBeInstanceOf(ValidationError);
    });

    test('login throws UnauthorizedError if user not found', async () => {
        UserRepository.findByEmail.mockResolvedValue(null);
        await expect(AuthService.login('a@b.com', 'pass')).rejects.toBeInstanceOf(UnauthorizedError);
    });

    test('login throws UnauthorizedError if password does not match', async () => {
        UserRepository.findByEmail.mockResolvedValue({
            id: 1, email: 'a@b.com', password_hash: 'hash', full_name: 'Test', role_name: 'interventor'
        });
        bcrypt.compare.mockResolvedValue(false);
        await expect(AuthService.login('a@b.com', 'wrong')).rejects.toBeInstanceOf(UnauthorizedError);
    });

    test('login returns tokens and user on success', async () => {
        UserRepository.findByEmail.mockResolvedValue({
            id: 1, email: 'a@b.com', password_hash: 'hash', full_name: 'Test User', role_name: 'interventor'
        });
        bcrypt.compare.mockResolvedValue(true);
        const result = await AuthService.login('a@b.com', 'correctpass');
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
        expect(result.user.email).toBe('a@b.com');
    });

    test('register throws ValidationError if fields missing', async () => {
        await expect(AuthService.register({ fullName: '', email: '', password: '' }))
            .rejects.toBeInstanceOf(ValidationError);
    });

    test('register hashes password and calls UserRepository.create', async () => {
        bcrypt.hash.mockResolvedValue('hashed_pw');
        UserRepository.create.mockResolvedValue({ id: 5, email: 'new@test.com' });
        const result = await AuthService.register({ fullName: 'New', email: 'new@test.com', password: 'abc12345' });
        expect(bcrypt.hash).toHaveBeenCalled();
        expect(UserRepository.create).toHaveBeenCalled();
        expect(result.email).toBe('new@test.com');
    });
});
