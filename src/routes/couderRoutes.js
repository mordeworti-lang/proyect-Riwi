'use strict';

const { Router } = require('express');
const CouderController = require('../controllers/couderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

router.use(authMiddleware);

// GET /api/couders/search?cc=1001234567
router.get('/search', CouderController.searchByCC);

// GET /api/couders/:id
router.get('/:id', CouderController.getById);

module.exports = router;
