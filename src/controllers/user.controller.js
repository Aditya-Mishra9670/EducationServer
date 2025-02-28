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
import Video from "../models/video.model.js";
import User from "../models/user.model.js";

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

export const getVideo = async (req, res) => {
  const { videoId } = req.params;
  try {
    if (!mongoose.isValidObjectId(videoId)) {
      return res.status(400).json({ message: "Invalid video Id" });
    }
    const data = await Video.findById(videoId);
    if (!data) {
      return res.status(404).json({ message: "Video not found" });
    }
    return res.status(200).json({ data });
  } catch (error) {
    console.log("Error in getting video details", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid course Id" });
    }
    const course = await Course.findById(courseId)
      .populate({
        path: "teacherId",
        select: "profilePic name",
      })
      .populate("lectures");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json({ data: course });
  } catch (error) {
    console.log("Error in getting course details", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSimilarVideos = async (req, res) => {
  const { videoId } = req.params;
  try {
    if (!mongoose.isValidObjectId(videoId)) {
      return res.status(400).json({ message: "Invalid video Id" });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const similarVideos = await Video.find({
      courseId: video.courseId,
      _id: { $ne: videoId },
    })
      .sort({ _id: 1 })
      .limit(5);

    if (similarVideos.length === 0) {
      return res
        .status(200)
        .json({ data: await Video.find({ _id: { $ne: videoId } }) });
    }

    return res.status(200).json({ data: similarVideos });
  } catch (error) {
    console.log("Error in getting similar videos", error);
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

export const getSpecificEnrollment = async (req, res) => {
  const { courseId } = req.params;
  const user = req.user;
  try {
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const enrollment = await Enrollment.findOne({
      studentId: user._id,
      courseId,
    }).populate({
      path: "courseId",
      populate: {
        path: "lectures",
      },
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Not enrolled in course" });
    }

    return res.status(200).json({ data: enrollment });
  } catch (error) {
    console.log("Error in finding specific enrollment", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyCourses = async (req, res) => {
  const user = req.user;
  try {
    const enrollments = await Enrollment.find({ studentId: user._id }).populate(
      {
        path: "courseId",
        populate: [
          { path: "lectures" },
          { path: "teacherId", select: "name profilePic" },
        ],
      }
    );

    return res.status(200).json({ data: enrollments });
  } catch (error) {
    console.log("Error in finding my courses", error);
    return res.status(500).json({
      message: "Internal Server Error",
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
  const { newPassword, oldPassword } = req.body;
  console.log(newPassword,oldPassword)
  const user = req.user;

  console.log(user);

  try {
    if (!newPassword || !oldPassword) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const validOldPass = await bcrypt.compare(oldPassword, user.password);
    if (!validOldPass) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password should be at least 8 characters long and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("Error in updating password", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate(
      "teacherId",
      "name profilePic"
    );
    if (!courses.length) {
      return res.status(404).json({ message: "No courses found" });
    }

    return res.status(200).json({ message: "Courses fetched", data: courses });
  } catch (error) {
    const status = ["CastError", "ValidationError"].includes(error.name)
      ? 400
      : 500;
    return res.status(status).json({
      message:
        status === 400 ? "Invalid request data" : "Internal server error",
      error: error.message,
    });
  }
};

export const getComments = async (req, res) => {
  const { videoId } = req.params;
  try {
    if (!mongoose.isValidObjectId(videoId)) {
      return res.status(400).json({ message: "Invalid video Id" });
    }
    const comments = await Comment.find({ videoId }).populate(
      "studentId",
      "name profilePic"
    );
    return res.status(200).json({ data: comments });
  } catch (error) {
    console.log("Error in getting comments", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getReviews = async (req, res) => {
  const { courseId } = req.params;
  try {
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid course Id" });
    }
    const reviews = await Review.find({ courseId }).populate(
      "studentId",
      "name profilePic"
    );
    return res.status(200).json({ data: reviews });
  } catch (error) {
    console.log("Error in getting reviews", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//AddComment
export const addComment = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { videoId, comment } = req.body;
    if (!videoId || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    if (!mongoose.isValidObjectId(videoId)) {
      return res.status(400).json({ message: "Invalid video Id" });
    }
    if (comment.length > 200) {
      return res
        .status(400)
        .json({ message: "Comment cannot be greater than 200 characters" });
    }
    const video = await Video.findById(videoId);
    if (!video) {
      return res
        .status(400)
        .json({ message: "Video not found to add comment" });
    }
    const newComment = new Comment({
      videoId,
      studentId,
      comment,
    });

    await newComment.save();
    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not add comment.",
      error: error.message,
    });
  }
};

//AddReviewForCourse
export const addReview = async (req, res) => {
  const { courseId, rating, review } = req.body;
  const studentId = req.user._id;
  try {
    if (!courseId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid Course Id" });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found to add review" });
    }

    const exisitingReview = await Review.findOne({
      courseId,
      studentId,
    });

    if (exisitingReview) {
      return res
        .status(400)
        .json({ message: "Review already exists for this course" });
    }

    if (review.length > 200) {
      return res
        .status(400)
        .json({ message: "Review text cannot be greater than 200 charcaters" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating should be between 1 and 5",
      });
    }

    const newReview = new Review({
      courseId,
      studentId,
      rating,
      review,
    });

    const savedReview = await newReview.save();
    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: savedReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not add review.",
      error: error.message,
    });
  }
};

export const reportContent = async (req, res) => {
  const reporterId = req.user._id;
  const { type, entityReported, reasonToReport, details } = req.body;
  try {
    if (!type || !entityReported || !reasonToReport) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const allowedTypes = ["Course", "Video", "Comment", "Review", "User"];
    const allowedReasons = [
      "Spam",
      "Inappropriate",
      "Hate speech",
      "Violence",
      "Other",
    ];

    if (
      !allowedTypes.includes(type) ||
      !allowedReasons.includes(reasonToReport)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid type or reason" });
    }

    const typeModels = {
      User,
      Course,
      Video,
      Comment,
      Review,
    };

    const Model = typeModels[type];
    if (!Model) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid entity type" });
    }

    const entityExists = await Model.findById(entityReported);
    if (!entityExists) {
      return res
        .status(404)
        .json({ success: false, message: "Entity not found" });
    }

    const existingReport = await Report.findOne({
      type,
      entityReported,
      reporterId,
      resolved: false,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "Report already exists for this entity",
      });
    }

    const newReport = new Report({
      type,
      entityReported,
      reporterId,
      reasonToReport,
      details,
    });

    const savedReport = await newReport.save();

    return res.status(201).json({
      success: true,
      message: "Content reported successfully",
      data: savedReport,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not report content.",
      error: error.message,
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
  try {
    const notificationId = req.body.id;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    notification.read = true;
    await notification.save();
    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
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

    const base64PdfWithMimeType = `data:application/pdf;base64,${base64Pdf}`;
    const fileName = `${user.name}-${courseName}-certificate`;

    const response = await cloudinary.uploader.upload(base64PdfWithMimeType, {
      folder: "StudyTube/Certificates",
      public_id: fileName,
    });

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

    const allLectures = enrollment.courseId.lectures.length;
    let currProgress = enrollment.progress;

    // Incremental progress update per lecture
    const progressIncrement = 100 / allLectures;
    currProgress += progressIncrement;

    // Ensure progress doesn't exceed 100%
    currProgress = Math.min(currProgress, 100);

    enrollment.progress = currProgress;
    await enrollment.save();

    return res.status(200).json({
      message: "Progress updated successfully",
      progress: currProgress,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while updating progress.",
    });
  }
};

export const getMyReports = async(req,res)=>{
  const user = req.user;
  try {
    const reports = await Report.find({reporterId:user._id}).populate('entityReported');
    return res.status(200).json({data:reports});
  } catch (error) {
    console.log("Error in getting reports",error);
    return res.status(500).json({message:"Internal server error"});
  }
}

export const getReportById = async(req,res)=>{
  const {reportId} = req.params;
  try {
    if(!mongoose.isValidObjectId(reportId)){
      return res.status(400).json({message:"Invalid report ID"});
    }
    const report = await Report.findById(reportId).populate('entityReported');
    if(!report){
      return res.status(404).json({message:"Report not found"});
    }
    return res.status(200).json({data:report});
  }
  catch (error) {
    console.log("Error in getting report by ID",error);
    return res.status(500).json({message:"Internal server error"});
  }
}
