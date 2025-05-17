const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middlewares/authmiddleware');

router.post('/chat', authenticateToken, aiController.handleChatMessage);
router.post('/predict', authenticateToken, aiController.predictSpending);

module.exports = router;