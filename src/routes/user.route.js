import express from "express";
import { abandonCourse, generateCertificate, getEnrolled, getMyCourses, getNotifications,getRecommendedCourses, updatePass, updateProfile, updateProgress } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/update-profile",updateProfile);

router.post("/enroll/:courseId",getEnrolled);

router.get("/myCourses",getMyCourses);

router.get("/notifications",getNotifications)
router.post("/update-pass",updatePass);

router.post("/abandon/:courseId",abandonCourse);

router.get("/recommendation",getRecommendedCourses);

router.post("/generateCertficate",generateCertificate);

router.post("/updateProgress",updateProgress);


export default router;