import express from "express";
import { abandonCourse, getEnrolled, getMyCourses, getRecommendedCourses, updatePass, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/update-profile",updateProfile);

router.post("/enroll/:courseId",getEnrolled);

router.get("/myCourses",getMyCourses);

router.post("/update-pass",updatePass);

router.post("/abandon/:courseId",abandonCourse);

router.get("/recommendation",getRecommendedCourses);


export default router;