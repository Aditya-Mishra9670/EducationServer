import express from "express";
import { createCourse, uploadVideo } from "../controllers/teacher.controller.js";

const router = express.Router();

router.post("/createCourse",createCourse); 

router.post("/uploadVideo",uploadVideo);

export default router;