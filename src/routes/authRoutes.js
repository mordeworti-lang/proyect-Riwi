'use strict';

const { Router } = require('express');
const AuthController = require('../controllers/authController');

const router = Router();

router.post('/login',   AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/register', AuthController.register);  // admin only in production

module.exports = router;
