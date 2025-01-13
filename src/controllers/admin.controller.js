import User from "../models/user.model.js"
import Notification from '../models/notification.model.js';

import mongoose from "mongoose";

// Function to get all users with pagination
export const allUsers = async (req, res) => {
  try {
    // Validate page query parameter
    const page = parseInt(req.query.page, 10);
    if (isNaN(page) || page <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number. Page must be a positive integer.",
      });
    }

    const limit = 50; // Number of users per page
    const skip = (page - 1) * limit; // Skip the previous pages' results

    // Query to get users with pagination
    const users = await User.find().skip(skip).limit(limit);

    // Get the total number of users to calculate the total pages
    const totalUsers = await User.countDocuments();

    // Check if the requested page exists
    const totalPages = Math.ceil(totalUsers / limit);
    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found. Requested page exceeds total pages.",
      });
    }

    return res.status(200).json({
      success: true,
      data: users,
      page: page,
      totalPages: totalPages,
      totalUsers: totalUsers,
    });
  } catch (error) {
    // Check for database-specific errors
    if (error.name === "MongoNetworkError") {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again later.",
      });
    }

    // Handle all other errors
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};





export const getUserbyId = async (req,res) =>{
    try{
        const userId = req.body.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({success:false,message:"User not found"});
        return res.status(200).json({success:true,data:user});
    }catch(error){
        return res.status(500).json({success:false,message:'server Error',error:error.message});
    }
}


export const deletebyId = async (req, res) => {
    try {
        const userId = req.body.id;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        } else {
            return res.status(200).json({ success: true, message: "User deleted successfully" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}


export const createNotification = async (req, res) => {
    try {
      const { userId, message } = req.body;  
  
      const notification = new Notification({
        userId,
        message,
        read: false
      });
  
      await notification.save();
  
      return res.status(200).json({
        success: true,
        message: "Notification Saved successfully!"
      });
  
    } catch (error) {
      console.error("Error creating notification:", error);
      
      return res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message
      });
    }
  };


export default null;