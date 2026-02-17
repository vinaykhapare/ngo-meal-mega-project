const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const donorRoutes = require("./routes/donorRoutes.js");
const receiverRoutes = require("./routes/receiverRoutes.js");
const foodRoutes = require("./routes/foodRoutes.js");
const analyticsRoutes = require("./routes/analyticsRoutes.js");
const contactRoutes = require("./routes/contactRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

const {connectdb} = require("./utility/connectDb.js");

// Connect to MongoDB
connectdb("mongodb+srv://db_user:123@mealconnect.zy869q2.mongodb.net/?retryWrites=true&w=majority&appName=mealconnect");

// CORS configuration - place this BEFORE your routes
app.use(cors({
    origin: 'http://localhost:5173', // Your React app's URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/donor", donorRoutes);
app.use("/api/receiver", receiverRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.json("welcome to MealConnect");
}); 

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    // console.log(`Server running on port ${PORT}`);
});

module.exports = app;