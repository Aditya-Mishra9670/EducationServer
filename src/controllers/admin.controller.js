import User from "../models/user.model.js"
import Notification from '../models/notification.model.js';

import mongoose from "mongoose";
// Function to get all users
export const allUsers= async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
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