import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import mongoose from "mongoose";
import Course from "../models/course.model.js";
import Notification from "../models/notification.model.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloud.js";
import Enrollment from "../models/enrollment.model.js";
import Review from "../models/review.model.js";
import Comment from "../models/comment.model.js";
import Report from "../models/report.model.js";


export const updateProfile = async (req, res) => {
  //Only name, Interests and profilePic are updatable
  const { name, interests, profilePic } = req.body;
  const user = req.user;

  try {
    if (name.length > 18) {
      return res
        .status(400)
        .json({ message: "Name should be less than 18 characters" });
    }
    if (name) user.name = name;
    if (interests.length > 5) {
      return res
        .status(400)
        .json({ message: "Interests should be less than 5" });
    }
    if (interests) user.interests = interests;

    //Uploading user profile pic to cloud storage and updating the user doc.
    if (profilePic) {
      const response = await cloudinary.uploader.upload(profilePic, {
        folder: "StudyTube/ProfilePics",
      });
      user.profilePic = response.secure_url;
    }

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

    const newEnrollment = new Enrollment({
      courseId: course._id,
      studentId: user._id,
    });
    await newEnrollment.save();
    course.enrolledStudents.push(user._id);
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [courses, totalCourses] = await Promise.all([
      Enrollment.find({ studentId: user._id }).skip(skip).limit(limit),
      Enrollment.countDocuments({ studentId: user._id }),
    ]);

    return res.status(200).json({
      message: "Courses fetched successfully",
      data: courses,
      pagination: {
        total: totalCourses,
        page,
        pages: Math.ceil(totalCourses / limit),
      },
    });
  } catch (error) {
    const status =
      error.name === "CastError" || error.name === "ValidationError"
        ? 400
        : 500;
    return res.status(status).json({
      message:
        status === 400 ? "Invalid request data" : "Internal server error",
      error: error.message,
    });
  }
};

export const abandonCourse = async (req, res) => {
  const { courseId } = req.params;
  const user = req.user;

  try {
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const studentEnrollment = await Enrollment.findOneAndDelete({
      studentId: user._id,
      courseId,
    });

    if (!studentEnrollment) {
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

    return res.status(200).json({ message: "Course abandoned successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updatePass = async (req, res) => {
  const { newPassword } = req.body;
  try {
    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({
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
      return res
        .status(400)
        .json({ message: "User interests are missing or empty" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ category: { $in: interests } })
      .skip(skip)
      .limit(limit);

    const totalCourses = await Course.countDocuments({
      category: { $in: interests },
    });

    if (courses.length === 0) {
      return res.status(404).json({ message: "No courses found yet" });
    }

    return res.status(200).json({
      message: "Recommended courses fetched",
      data: courses,
      pagination: {
        total: totalCourses,
        page,
        pages: Math.ceil(totalCourses / limit),
      },
    });
  } catch (error) {
    if (error.name === "CastError" || error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid request data", error: error.message });
    }
    console.log("Error in fetching recommended courses,", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//AddComment
export const addComment = async (req, res) => {
  try{
    const {videoId, studentId, comment} = req.body;
    if(!videoId || !studentId || !comment){
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }
    const newComment = new Comment({
      videoId,
      studentId,
      comment
    });

    const savedComment = await newComment.save();
    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: savedComment
    });
  }catch(error){
    console.error("Error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not add comment.",
      error: error.message
    });
  }
};

//AddReviewForCourse
export const addReview = async (req, res) => {
  try{
    const {courseId, studentId, rating, review} = req.body;
    if(!courseId || !studentId || !rating || !review){
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }
    if(rating < 1 || rating > 5){
      return res.status(400).json({
        success: false,
        message: "Rating should be between 1 and 5"
      });
    }

    const newReview = new Review({
      courseId,
      studentId,
      rating,
      review
    });

    const savedReview = await newReview.save();
    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: savedReview
    });

  }catch(error){ 
    console.error("Error adding review:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not add review.",
      error: error.message
    });
  }
}

//Report Content
export const reportContent = async (req, res) => {
  try{
    const {type, entityReported, reporterId, reasonToReport, details} = req.body;
    if(!type || !entityReported || !reporterId || !reasonToReport){
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    const allowedTypes = ["Course", "Video", "Comment", "Review", "User", "Educator"];
    const allowedReasons = ["Spam", "Inappropriate", "Hate speech", "Violence", "Other"];
    if(!allowedTypes.includes(type)){
      return res.status(400).json({
        success: false,
        message: "Invalid type provided"
      });
    }
    if(!allowedReasons.includes(reasonToReport)){
      return res.status(400).json({
        success: false,
        message: "Invalid reason provided"
      });
    }
    const newReport = new Report({
      type,
      entityReported,
      reporterId,
      reasonToReport,
      details
    });

    const savedReport = await newReport.save();

    return res.status(201).json({
      success: true,
      message: "Content reported successfully",
      data: savedReport
    });

  }catch(error){
    console.error("Error reporting content:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not report content.",
      error: error.message
    });
  }
};
// User notifications

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No notifications found for the specified user.",
      });
    }
    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not fetch notifications.",
      error: error.message,
    });
  }
};

// Mark notification as read by ID
export const markNotificationAsRead = async (req, res) => {
  try{
    const notificationId = req.body.id;
    const notification = await Notification.findById(notificationId);
    if(!notification){
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    notification.read = true;
    await notification.save();
    return res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });

  } catch(error){
    console.error("Error marking notification as read:", error);
  }
};

// Mark all notifications as read 
export const markAllNotificationsAsRead = async (req, res) => {
  try{
    await Notification.updateMany({userId: req.user.id}, {read: true});
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch(error){
    console.error("Error marking all notifications as read:", error);
  }
};

export const generateCertificate = async (req, res) => {
  const { courseId } = req.body;
  const user = req.user;

  try {
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const enrollment = await Enrollment.findOne({
      courseId,
      studentId: user._id,
    }).populate("courseId");
    if (!enrollment) {
      return res.status(400).json({ message: "User not enrolled in course" });
    }

    if (enrollment.progress < 90) {
      return res.status(400).json({ message: "Course not completed yet" });
    }

    const templatePath = "./public/pdfTemplate.pdf";
    const templateBuffer = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBuffer);

    const studentName = user.name;
    const courseName = enrollment?.courseId?.title;
    const issueDate = new Date().toLocaleDateString();

    const page = pdfDoc.getPage(0);

    const studentNameWidth = studentName.length * 10;
    const courseNameWidth = courseName.length * 7;

    const studentNameX = 162 + (602 - 162 - studentNameWidth) / 2;
    const courseNameX = 162 + (602 - 162 - courseNameWidth) / 2;

    page.drawText(studentName, {
      x: studentNameX,
      y: 320,
      size: 28,
      color: rgb(240 / 255, 193 / 255, 69 / 255),
    });

    page.drawText(courseName, {
      x: courseNameX,
      y: 247,
      size: 20,
      color: rgb(240 / 255, 193 / 255, 69 / 255),
    });
    page.drawText(issueDate, {
      x: 375,
      y: 193,
      size: 18,
      color: rgb(240 / 255, 193 / 255, 69 / 255),
    });

    const pdfBytes = await pdfDoc.save();
    const base64Pdf = Buffer.from(pdfBytes).toString("base64");

    console.log(base64Pdf.length);
    console.log("uploading");

    const base64PdfWithMimeType = `data:application/pdf;base64,${base64Pdf}`;
    const fileName = `${user.name}-${courseName}-certificate`;

    const response = await cloudinary.uploader.upload(base64PdfWithMimeType, {
      folder: "StudyTube/Certificates",
      public_id: fileName,
    });
    console.log("Complete uploading")

    enrollment.certificateUrl = response.secure_url;
    await enrollment.save();

    return res.status(200).json({
      message: "Certificate generated and saved successfully",
      enrollment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProgress = async (req, res) => {
  const { courseId } = req.body;
  const user = req.user;
  try {
    const enrollment = await Enrollment.findOne({
      courseId,
      studentId: user._id,
    }).populate("courseId");
    if (!enrollment) {
      return res.status(400).json({
        message: "Course enrollment not found",
      });
    }
    const allLectures = 5 || enrollment.courseId.lectures.length;
    let currProgress = enrollment.progress;

    // const completedLectures = (progress/100) * allLectures;
    const progress = (1 / allLectures) * 100;
    currProgress += progress;
    enrollment.progress = currProgress;
    await enrollment.save();
    return res.status(200).j.son();
  } catch (error) {}
};
