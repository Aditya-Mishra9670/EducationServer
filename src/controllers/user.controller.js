// import User from "../models/user.model.js";
import mongoose from "mongoose";
import Course from "../models/course.model.js";
import Notification from "../models/notification.model.js";
import validator from "validator";
import bcrypt from "bcryptjs";

export const updateProfile = async (req, res) => {
  //Only name, Interests and profilePic are updatable
  const { name, interests, profilePic } = req.body;
  const user = req.user;

  try {
    if(name.length > 18){
      return res.status(400).json({ message: "Name should be less than 18 characters" });
    }
    if (name) user.name = name;
    if(interests.length > 5){
      return res.status(400).json({ message: "Interests should be less than 5" });
    }
    if (interests) user.interests = interests;
    if (profilePic) user.profilePic = profilePic; //Cloud upload needed for image

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.log("Error in updating profile", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getEnrolled = async (req, res) => {
  const user = req.user;
  const { courseId } = req.params;
  try {
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid Course Id" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course doesn't exist" });
    }

    if (course.enrolledStudents.includes(user._id)) {
      return res.status(400).json({ message: "Already enrolled in course" });
    }

    user.courses.push(courseId);
    course.enrolledStudents.push(user._id);

    await user.save();
    await course.save();

    return res
      .status(200)
      .json({ message: "Successfully enrolled in course", data: course });
  } catch (error) {
    console.log("Error in enrollment", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyCourses = async (req, res) => {
  const user = req.user;
  try {
    if(!user.courses.length){
      return res.status(404).json({ message: "No courses found" });
    }
    console.log(user.courses)
    await user.populate("courses");
    return res
      .status(200)
      .json({ message: "Courses fetched successfully", data: user.courses });
  } catch (error) {
    console.log("Error in fetching my courses", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const abandonCourse = async (req, res) => {
  const { courseId } = req.params;
  const user = req.user;

  try {
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }
    if (!user.courses.includes(courseId)) {
      return res
        .status(400)
        .json({ message: "Must be enrolled in course to leave it" });
    }

    const course = await Course.findByIdAndUpdate(courseId, {
      $pull: { enrolledStudents: user._id },
    });
    if (!course) {
      return res.status(400).json({ message: "Course not found" });
    }

    user.courses = user.courses = user.courses.filter((id) => id.toString() !== courseId.toString());
    await user.save();

    return res
      .status(200)
      .json({ message: "Course abandoned successfully", data: user.courses });
  } catch (error) {
    console.log("Error in abandoning course", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePass = async (req, res) => {
  const { newPassword } = req.body;
  try {
    if (!validator.isStrongPassword(newPassword)) {
      return res
        .status(400)
        .json({
          message:
            "Password should be atleast 8 characters long and should contain atleast 1 uppercase, 1 lowercase, 1 number and 1 special character",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("Error in updating password", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecommendedCourses = async (req, res) => {
  try {
      const { interests } = req.user;
      if (!interests || interests.length === 0) {
          return res.status(400).json({ message: "User interests are missing or empty" });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const courses = await Course.find({ category: { $in: interests } }).skip(skip).limit(limit);

      const totalCourses = await Course.countDocuments({ category: { $in: interests } });

      if (courses.length === 0) {
          return res.status(404).json({ message: "No courses found yet" });
      }

      return res.status(200).json({
          message: "Recommended courses fetched",
          data: courses,
          pagination: {
              total: totalCourses,
              page,
              pages: Math.ceil(totalCourses / limit)
          }
      });
  } catch (error) {
      if (error.name === 'CastError' || error.name === 'ValidationError') {
          return res.status(400).json({ message: "Invalid request data", error: error.message });
      }
      console.log("Error in fetching recommended courses,", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};

// User notifications 

export const getNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing or invalid. Please authenticate properly."
      });
    }

    const notifications = await Notification.find({ userId: req.user.id });
    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No notifications found for the specified user."
      });
    }
    return res.status(200).json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not fetch notifications.",
      error: error.message
    });
  }
};
