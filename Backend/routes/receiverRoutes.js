const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.js");
const {
    receiverLogin,
    receiverRegister,
    getReceiverProfile,
    updateReceiverProfile,
    getAvailableDonations,
    acceptDonation,
    getNearbyDonations,
    updateFoodStatus
} = require("../controller/receiverFun.js");

// Public routes (no auth required)
router.post("/register", receiverRegister);
router.post("/login", receiverLogin);

// Protected routes
router.get("/me", authMiddleware, getReceiverProfile);
router.put("/update", authMiddleware, updateReceiverProfile);
router.get("/available-donations", authMiddleware, getAvailableDonations);
router.post("/accept-donation/:donationId", authMiddleware, acceptDonation);
router.get("/nearby-donations", authMiddleware, getNearbyDonations);
router.put("/food-status/:foodId", authMiddleware, updateFoodStatus);

module.exports = router;