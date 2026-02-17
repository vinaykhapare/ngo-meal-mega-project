const Admin = require('../models/adminModel');
const RECEIVER = require('../models/receiverModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminController = {
    // Admin login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const admin = await Admin.findOne({ email });
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            const token = jwt.sign(
                { _id: admin._id, role: 'admin' },
                'yourSecretKey',
                { expiresIn: '24h' }
            );

            res.status(200).json({
                success: true,
                token,
                admin: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get pending NGO verifications
    getPendingVerifications: async (req, res) => {
        try {
            const pendingNGOs = await RECEIVER.find({
                'verificationStatus.status': 'Pending'
            }).select('-password');

            res.status(200).json({
                success: true,
                data: pendingNGOs
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Verify or reject NGO
    updateNGOVerification: async (req, res) => {
        try {
            const { ngoId } = req.params;
            const { status, message } = req.body;

            if (!['Verified', 'Rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status"
                });
            }

            const ngo = await RECEIVER.findByIdAndUpdate(
                ngoId,
                {
                    'verificationStatus.status': status,
                    'verificationStatus.message': message,
                    'verificationStatus.verifiedAt': status === 'Verified' ? new Date() : null
                },
                { new: true }
            );

            if (!ngo) {
                return res.status(404).json({
                    success: false,
                    message: "NGO not found"
                });
            }

            res.status(200).json({
                success: true,
                message: `NGO ${status.toLowerCase()} successfully`,
                data: ngo
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = adminController; 