const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Check if MONGO_URI is defined
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI env is not defined');
        }

        await mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log("✅ MongoDB connected successfully"))
            .catch((err) => console.error("❌ MongoDB connection error:", err));


    } catch (error) {
        console.error("MongoDB connection error:", error.message);
    }
};

module.exports = connectDB;
