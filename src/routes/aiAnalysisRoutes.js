'use strict';

const { Router } = require('express');
const AiAnalysisController = require('../controllers/aiAnalysisController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router({ mergeParams: true });

router.use(authMiddleware);

// POST /api/couders/:couderId/ai-analysis
router.post('/',  AiAnalysisController.generate);

// GET  /api/couders/:couderId/ai-analysis
router.get('/',   AiAnalysisController.getHistory);

module.exports = router;
