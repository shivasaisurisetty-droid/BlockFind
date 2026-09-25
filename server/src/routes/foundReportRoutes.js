const express = require('express');
const router = express.Router();
const foundReportController = require('../controllers/foundReportController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', foundReportController.getFoundReports);
router.get('/:id', foundReportController.getFoundReportById);
router.post('/', authenticate, upload.single('image'), foundReportController.createFoundReport);

module.exports = router;
