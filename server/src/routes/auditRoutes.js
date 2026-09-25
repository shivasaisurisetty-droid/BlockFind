const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, auditController.getAuditLogs);

module.exports = router;
