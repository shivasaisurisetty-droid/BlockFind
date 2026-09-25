const express = require('express');
const router = express.Router();
const lostReportController = require('../controllers/lostReportController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', lostReportController.getLostReports);
router.get('/:id', lostReportController.getLostReportById);
router.post('/', authenticate, upload.single('image'), lostReportController.createLostReport);

module.exports = router;
