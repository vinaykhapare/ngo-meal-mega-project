const mongoose = require('mongoose');

// Original Schema commented
/*
const foodSchema = new mongoose.Schema({
    // ... existing schema
});
*/

const foodSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DONOR',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        minLength: [10, 'Phone number must be 10 digits'],
        maxLength: [10, 'Phone number must be 10 digits']
    },
    date: {
        type: Date,
        default: Date.now
    },
    totalCount: {
        type: Number,
        required: [true, 'Total count is required']
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    address: String,
    foodType: String,
    description: String,
    pincode: {
        type: String,
        required: [true, 'Pincode is required']
    },
    expiryTime: {
        type: String,
        required: [true, 'Expiry time is required']
    }
});

module.exports = mongoose.model('Food', foodSchema);
