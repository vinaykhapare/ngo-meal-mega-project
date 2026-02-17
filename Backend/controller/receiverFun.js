const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const RECEIVER = require("../models/receiverModel");
const FOOD = require("../models/foodModel");
const { generateJWT } = require("./generateJWT.js");

async function getReceiverProfile(req, res) {
    try {
        const receiver = await RECEIVER.findById(req.user._id)
            .select('-password'); // Exclude password

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        // Get accepted donations
        const acceptedDonations = await FOOD.find({ 
            receiverId: req.user._id 
        }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: {
                receiver,
                donations: acceptedDonations
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function receiverLogin(req, res) {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email }); // Log the attempt

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // Find receiver by email
        const receiver = await RECEIVER.findOne({ email });
        console.log('Receiver found:', receiver ? 'Yes' : 'No'); // Log if receiver was found

        if (!receiver) {
            return res.status(401).json({
                success: false,
                message: "Account not found with this email"
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, receiver.password);
        console.log('Password match:', isMatch); // Log password match result

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Check verification status
        console.log('Verification status:', receiver.verificationStatus);

        if (receiver.verificationStatus.status === 'Pending') {
            return res.status(403).json({
                success: false,
                message: "Your account is pending verification. Please wait for admin approval.",
                verificationStatus: 'Pending'
            });
        }

        if (receiver.verificationStatus.status === 'Rejected') {
            return res.status(403).json({
                success: false,
                message: receiver.verificationStatus.message || "Your registration was rejected",
                verificationStatus: 'Rejected'
            });
        }

        // Generate token
        const token = jwt.sign(
            { 
                _id: receiver._id, 
                email: receiver.email, 
                role: 'ngo',
                name: receiver.name
            },
            'yourSecretKey',
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: receiver._id,
                name: receiver.name,
                email: receiver.email,
                role: 'ngo'
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "Error during login",
            error: error.message
        });
    }
}

async function receiverRegister(req, res) {
    try {
        const { name, email, ngoDarpanID, location, description, pincode, leader, password } = req.body;

        // Check if NGO already exists
        const existingReceiver = await RECEIVER.findOne({ 
            $or: [{ email }, { ngoDarpanID }] 
        });

        if (existingReceiver) {
            return res.status(400).json({
                success: false,
                message: "NGO already registered with this email or Darpan ID"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new receiver with pending verification
        const receiver = await RECEIVER.create({
            name,
            email,
            ngoDarpanID,
            location,
            description,
            pincode,
            leader,
            password: hashedPassword,
            verificationStatus: {
                status: 'Pending',
                message: 'Your registration is under review. Please wait for admin verification.'
            }
        });

        res.status(201).json({
            success: true,
            message: "NGO registration submitted successfully. Please wait for verification before logging in.",
            verificationStatus: 'Pending'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function updateReceiverProfile(req, res) {
    try {
        const { name, location, description, pincode, leader } = req.body;
        
        const receiver = await RECEIVER.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    name,
                    location,
                    description,
                    pincode,
                    leader
                }
            },
            { new: true }
        ).select('-password');

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: receiver
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function getAvailableDonations(req, res) {
    try {
        const { pincode } = await RECEIVER.findById(req.user._id);
        
        // Get donations that are:
        // 1. In Pending status
        // 2. Within the same pincode
        // 3. Not already accepted
        const availableDonations = await FOOD.find({
            status: 'Pending',
            pincode: pincode,
            receiverId: null
        }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: availableDonations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function acceptDonation(req, res) {
    try {
        const { donationId } = req.params;

        const donation = await FOOD.findOneAndUpdate(
            {
                _id: donationId,
                status: 'Pending',
                receiverId: null
            },
            {
                $set: {
                    receiverId: req.user._id,
                    status: 'Accepted'
                }
            },
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found or already accepted"
            });
        }

        res.status(200).json({
            success: true,
            message: "Donation accepted successfully",
            data: donation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function getNearbyDonations(req, res) {
    try {
        const ngo = await RECEIVER.findById(req.user._id);
        if (!ngo) {
            return res.status(404).json({
                success: false,
                message: "NGO not found"
            });
        }

        // Find food donations in the same pincode that are pending
        const nearbyDonations = await FOOD.find({
            pincode: ngo.pincode,
            status: 'Pending'
        }).populate('donorId', 'name');

        console.log('Found donations:', nearbyDonations);

        res.status(200).json({
            success: true,
            data: nearbyDonations
        });
    } catch (error) {
        console.error('Error fetching nearby donations:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function updateFoodStatus(req, res) {
    try {
        const { foodId } = req.params;
        const { status } = req.body;

        const food = await FOOD.findById(foodId);
        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food donation not found"
            });
        }

        // First time accepting the donation
        if (status === 'Accepted' && !food.receiverId) {
            food.receiverId = req.user._id;
        }

        // Update status
        food.status = status;
        food.statusHistory = food.statusHistory || [];  // Initialize if doesn't exist
        food.statusHistory.push({
            status,
            updatedAt: new Date(),
            updatedBy: req.user._id,
            updaterType: 'RECEIVER'
        });

        await food.save();

        res.status(200).json({
            success: true,
            message: "Food status updated successfully",
            data: food
        });
    } catch (error) {
        console.error('Error updating food status:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getReceiverProfile,
    receiverLogin,
    receiverRegister,
    updateReceiverProfile,
    getAvailableDonations,
    acceptDonation,
    getNearbyDonations,
    updateFoodStatus
};