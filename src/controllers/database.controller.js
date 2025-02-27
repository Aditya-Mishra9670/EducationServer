import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";

export const getAllData = async (req, res) => {
  try {
    const allUsers = await User.countDocuments();
    const allCourses = await Course.countDocuments();
    const allVideos = await Video.countDocuments();
    const certificates = await Enrollment.countDocuments({ status: "completed" });
    const allEnrollments = await Enrollment.countDocuments();

    return res.status(200).json({ allUsers, allCourses, allVideos, certificates, allEnrollments });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
