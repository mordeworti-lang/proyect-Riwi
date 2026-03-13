'use strict';

const AuthService = require('../services/authService');

const AuthController = {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            res.status(200).json({ ok: true, data: result });
        } catch (err) {
            next(err);
        }
    },

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await AuthService.refresh(refreshToken);
            res.status(200).json({ ok: true, data: result });
        } catch (err) {
            next(err);
        }
    },

    async register(req, res, next) {
        try {
            const { fullName, email, password, roleId } = req.body;
            const user = await AuthService.register({ fullName, email, password, roleId });
            res.status(201).json({ ok: true, data: user });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = AuthController;
