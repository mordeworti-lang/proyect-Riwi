'use strict';

const { Router } = require('express');
const InterventionController = require('../controllers/interventionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router({ mergeParams: true });

router.use(authMiddleware);

// GET  /api/couders/:couderId/interventions
router.get('/',    InterventionController.getHistory);

// POST /api/couders/:couderId/interventions
router.post('/',   InterventionController.create);

// PUT  /api/interventions/:id
// DELETE /api/interventions/:id
// These are mounted separately in app.js
module.exports = router;
