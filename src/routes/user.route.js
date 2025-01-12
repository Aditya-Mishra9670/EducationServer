import express from "express";
import { abandonCourse, getEnrolled, getMyCourses, getRecommendedCourses, updatePass, updateProfile } from "../controllers/user.controller.js";
import { checkAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/update-profile",checkAuth,updateProfile);

router.post("/enroll/:courseId",checkAuth,getEnrolled);

router.get("/myCourses",checkAuth,getMyCourses);

router.post("/update-pass",checkAuth,updatePass);

router.post("/abandonCourse",checkAuth,abandonCourse);

router.get("/recommendation",checkAuth,getRecommendedCourses);


export default router;