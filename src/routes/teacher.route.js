import express from "express";
import {
  createCourse,
  editCourse,
  editVideo,
  getMyCourses,
  getSpecificCourse,
  getSpecificVideo,
  uploadVideo,
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.post("/createCourse", createCourse);

router.post("/uploadVideo", uploadVideo);

router.get("/getMyCourses", getMyCourses);

router.patch("/updateCourse/:courseId", editCourse);

router.patch("/updateVideo/:videoId", editVideo);

router.get("/course/:courseId", getSpecificCourse);

router.get("/getVideo/:videoId", getSpecificVideo);

export default router;
