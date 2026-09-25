const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Verifiers & Admins can access statistics
router.get('/statistics', authenticate, authorize(['VERIFIER', 'ADMIN']), adminController.getStatistics);

// Only Admins can view full user management and change user roles
router.get('/users', authenticate, authorize('ADMIN'), adminController.getUsers);
router.put('/users/:id/role', authenticate, authorize('ADMIN'), adminController.updateUserRole);

module.exports = router;
