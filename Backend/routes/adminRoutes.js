const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { adminProtectedRoute } = require('../middleware/adminProtectedRoute');

// Public admin route
router.post('/login', adminController.login);

// Protected admin routes
router.use(adminProtectedRoute); // Apply middleware to all routes below
router.get('/pending-verifications', adminController.getPendingVerifications);
router.put('/verify-ngo/:ngoId', adminController.updateNGOVerification);

module.exports = router; 