'use strict';

jest.mock('../src/repositories/userRepository');

const request = require('supertest');
const app = require('../src/app');
const UserRepository = require('../src/repositories/userRepository');

describe('Auth Registration Endpoint', () => {
    beforeEach(() => jest.clearAllMocks());

    test('POST /api/auth/register should create a new user', async () => {
        const userData = {
            fullName: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            roleId: 1
        };

        UserRepository.create.mockResolvedValue({ 
            id: 1, 
            email: userData.email, 
            full_name: userData.fullName 
        });

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData)
            .expect(201);

        expect(response.body.ok).toBe(true);
        expect(response.body.data).toHaveProperty('email', userData.email);
        expect(response.body.data).toHaveProperty('id');
        expect(UserRepository.create).toHaveBeenCalledWith({
            fullName: userData.fullName,
            email: userData.email,
            passwordHash: expect.any(String),
            roleId: userData.roleId
        });
    });

    test('POST /api/auth/register should reject invalid email', async () => {
        const userData = {
            fullName: 'Test User',
            email: 'invalid-email',
            password: 'password123',
            roleId: 1
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData)
            .expect(400);

        expect(response.body.ok).toBe(false);
        expect(response.body.error).toContain('Invalid email format');
        expect(UserRepository.create).not.toHaveBeenCalled();
    });

    test('POST /api/auth/register should reject short password', async () => {
        const userData = {
            fullName: 'Test User',
            email: 'testuser2@example.com',
            password: '123',
            roleId: 1
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData)
            .expect(400);

        expect(response.body.ok).toBe(false);
        expect(response.body.error).toContain('Password must be at least 8 characters');
        expect(UserRepository.create).not.toHaveBeenCalled();
    });

    test('POST /api/auth/register should reject missing fields', async () => {
        const userData = {
            email: 'testuser3@example.com',
            password: 'password123'
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData)
            .expect(400);

        expect(response.body.ok).toBe(false);
        expect(response.body.error).toContain('All fields are required');
        expect(UserRepository.create).not.toHaveBeenCalled();
    });
});
