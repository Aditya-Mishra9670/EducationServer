import cloudinary from "../lib/cloud.js";
import Course from "../models/course.model.js";
import Video from "../models/video.model.js";
import mongoose from "mongoose";

export const createCourse = async (req, res) => {
  const { title, description, language, syllabus, level, category, thumbnail } =
    req.body;
  const user = req.user;

  try {
    if (
      !title ||
      !description ||
      !category ||
      !thumbnail ||
      !language ||
      !syllabus ||
      !level
    ) {
      return res.status(400).json({ message: "All fields are required ok" });
    }

    const response = await cloudinary.uploader.upload(thumbnail, {
      folder: "StudyTube/course/thumbnail",
    });
    const thumbnailUrl = response.secure_url;

    const course = new Course({
      title,
      description,
      category,
      thumbnail: thumbnailUrl,
      teacherId: user._id,
      language,
      syllabus,
      level,
    });

    await course.save();

    return res
      .status(201)
      .json({ message: "Course created successfully", data: course });
  } catch (error) {
    console.log("Error in creating course", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const editCourse = async (req, res) => {
  const { courseId } = req.params;
  const { description, category, thumbnail, language, syllabus, level } =
    req.body;
  const user = req.user;

  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ message: "Invalid course Id" });
  }

  try {
    if (
      !courseId ||
      (!description &&
        !category &&
        !thumbnail &&
        !language &&
        !syllabus &&
        !level)
    ) {
      return res
        .status(400)
        .json({ message: "At least one field is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.teacherId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (description) course.description = description;
    if (category) course.category = category;
    if (thumbnail) {
      const response = await cloudinary.uploader.upload(thumbnail, {
        folder: "StudyTube/course/thumbnail",
      });
      course.thumbnail = response.secure_url;
    }
    if (language) course.language = language;
    if (syllabus) course.syllabus = syllabus;
    if (level) course.level = level;

    await course.save();

    return res
      .status(200)
      .json({ message: "Course updated successfully", data: course });
  } catch (error) {
    console.error("Error in updating course", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadVideo = async (req, res) => {
  const { title, description, duration, thumbnail, file, courseId } = req.body;
  const user = req.user;
  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ message: "Invalid course Id" });
  }

  try {
    if (
      !courseId ||
      !title ||
      !description ||
      !thumbnail ||
      !duration ||
      !file
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.teacherId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const response = await cloudinary.uploader.upload(thumbnail, {
      folder: "StudyTube/Lectures/thumbnail",
    });
    const thumbnailUrl = response.secure_url;

    const video = new Video({
      title,
      description,
      url: file,
      courseId,
      thumbnail: thumbnailUrl,
      duration,
    });
    course.lectures.push(video._id);
    await course.save();

    await video.save();

    return res
      .status(200)
      .json({ message: "Lecture uploaded successfully", data: video });
  } catch (error) {
    console.log("Error in uploading lecture", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const editVideo = async (req, res) => {
  //only description,thumbnail are editable
  const { thumbnail, description, title } = req.body;
  const { videoId } = req.params;
  try {
    if (!mongoose.isValidObjectId(videoId)) {
      return res.status(400).json({ message: "Invalid video id" });
    }
    if (!thumbnail && !description && !title) {
      return res.status(400).json({ message: "Atleast one feild is required" });
    }
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video doesn't exist" });
    }
    const courseId = video.courseId;
    const course = await Course.findById(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found to publish video" });
    }
    if (course?.teacherId?.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Unauthorised , can't make changes to other's videos",
      });
    }

    if (description) video.description = description;
    if (thumbnail) {
      const response = await cloudinary.uploader.upload(thumbnail, {
        folder: "StudyTube/videos/thumbnail",
      });
      video.thumbnail = response.secure_url;
    }
    if (title) video.title = title;

    await video.save();
    return res
      .status(200)
      .json({ message: "Video upadted successfully", data: video });
  } catch (error) {
    console.log("Error in updating video details,", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyCourses = async (req, res) => {
  const user = req.user;
  try {
    const courses = await Course.find({ teacherId: user._id })
      .populate("enrolledStudents", "profilePic name")
      .populate("lectures");
    if (!courses.length) {
      return res.status(200).json({ message: "No course found" });
    }
    return res.status(200).json({ data: courses });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getSpecificCourse = async (req, res) => {
  const { courseId } = req.params;
  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ message: "Invalid course Id" });
  }
  try {
    const course = await Course.findById(courseId)
      .populate("enrolledStudents", "profilePic name")
      .populate("lectures");

    if (!course) {
      return res
        .status(404)
        .json({ message: "No course found with specific id" });
    }
    return res.status(200).json({ data: course });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSpecificVideo = async (req, res) => {
  const { videoId } = req.params;
  try {
    if (!mongoose.isValidObjectId(videoId)) {
      return res.status(400).json({
        message: "Invalid Video ID",
      });
    }
    const video = await Video.findById(videoId).populate("courseId");
    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }
    if (video?.courseId?.teacherId.toString() !== req?.user?._id.toString()) {
      return res.status(400).json({
        message: "Not allowed",
      });
    }

    return res.status(200).json({
      message: "Video fetched successfully",
      data: video,
    });
  } catch (error) {
    console.log("Error while getting specific video", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
