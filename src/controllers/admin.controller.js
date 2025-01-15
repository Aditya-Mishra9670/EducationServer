import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";
import { sendSuspensionMail } from "../lib/utils.js";

// Function to get all users with pagination
export const allUsers = async (req, res) => {
  try {
    const adminId = req.user.id;

    // Validate page query parameter
    const page = parseInt(req.query.page, 10);
    if (isNaN(page) || page <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number. Page must be a positive integer.",
      });
    }

    const limit = 15; // Number of users per page
    const skip = (page - 1) * limit; // Skip the previous pages' results

    // Query to get users with pagination, excluding the admin's own ID
    const users = await User.find({ _id: { $ne: adminId } })
      .skip(skip)
      .limit(limit);

    // Get the total number of users to calculate the total pages
    const totalUsers = await User.countDocuments({ _id: { $ne: adminId } });

    // Check if the requested page exists
    const totalPages = Math.ceil(totalUsers / limit);
    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total: totalUsers,
        page,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not fetch users.",
      error: error.message,
    });
  }
};

export const getUserbyId = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }
    if (req.user._id.toString() === userId) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot view your own profile" });
    }
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "server Error", error: error.message });
  }
};

export const deleteUserbyId = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    if (reason.length > 15) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Reason should be less than 15 characters",
        });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }
    const deletedUser = await User.findByIdAndDelete(userId);
    await sendSuspensionMail(deletedUser.email, deletedUser.name, reason);
    // Deletion of user lead to removal of user from all the courses, reviews, comments, notifications,reports etc
    // await Notification.deleteMany({ userId: userId });
    // await Review.deleteMany({ userId: userId });
    // await Comment.deleteMany({ userId: userId });

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const createNotification = async (req, res) => {
  const { userId, message } = req.body;

  try {
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId and message",
      });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }
    if (userId.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({
          success: "false",
          message: "Cannot assign notification to yourself",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const notification = new Notification({
      userId,
      message,
      read: false,
    });

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification Saved successfully!",
    });
  } catch (error) {
    console.error("Error creating notification:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//get all reported content
export const getReports = async(req,res)=>{};


//get specific reported content
export const getReportedContent = async(req,res)=>{};



//review reported content (edit/delete) [Send notification/mail to owner about the change] and send a notification to usee who reported content about the resolved report
export const reviewReport = async(req,res)=>{};




