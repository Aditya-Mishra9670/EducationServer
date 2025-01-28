import express from "express";
import {
  abandonCourse,
  addComment,
  addReview,
  generateCertificate,
  getEnrolled,
  getMyCourses,
  getNotifications,
  getRecommendedCourses,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  reportContent,
  updatePass,
  updateProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

// Profile routes
router.post("/update-profile", updateProfile);
router.post("/update-pass", updatePass);

// Course enrollment routes
router.post("/enroll/:courseId", getEnrolled);
router.post("/abandon/:courseId", abandonCourse);
router.get("/myCourses", getMyCourses);
router.get("/recommendation", getRecommendedCourses);

// Review and comment routes
router.post("/add-comment", addComment);
router.post("/add-review", addReview);

// Report content route
router.post("/report-content", reportContent);

// Notification routes
router.get("/notifications", getNotifications);
router.put("/notifications/mark-as-read", markNotificationAsRead);
router.put("/notifications/mark-all-as-read", markAllNotificationsAsRead);

// Certificate generation route
router.post("/generate-certificate", generateCertificate);

export default router;