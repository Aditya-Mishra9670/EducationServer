import express from "express";
import {
  abandonCourse,
  addComment,
  addReview,
  generateCertificate,
  getAllCourses,
  getComments,
  getCourse,
  getEnrolled,
  getMyCourses,
  getNotifications,
  getReviews,
  getSimilarVideos,
  getSpecificEnrollment,
  getVideo,
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

//video and Course routes
router.get("/video/:videoId", getVideo);
router.get("/course/:courseId", getCourse);
router.get("/specificEnrollment/:courseId",getSpecificEnrollment)
router.get("/similarVideos/:videoId", getSimilarVideos);
router.get("/getComments/:videoId",getComments);
router.get("/getReviews/:courseId",getReviews);

// Course enrollment routes
router.post("/enroll/:courseId", getEnrolled);
router.post("/abandon/:courseId", abandonCourse);
router.get("/myCourses", getMyCourses);
router.get("/allCourses", getAllCourses);

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