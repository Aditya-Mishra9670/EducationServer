import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Regex for basic email validation
    },
    password: { type: String, required: true }
}, {
    timestamps: true // Adds `createdAt` and `updatedAt` fields
});

export const User = mongoose.model("User", UserSchema);
