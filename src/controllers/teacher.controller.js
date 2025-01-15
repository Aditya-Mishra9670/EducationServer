import Course from "../models/course.model.js";
import Video from "../models/video.model.js";   

export const createCourse = async (req, res) => {
    // update the code accordingly. Recheck the fields required and validations. This was just to create a sample course

    const { title, description,language,syllabus,level, category, thumbnail } = req.body;
    const user = req.user;

    try {
      console.log(title, description,language,syllabus,level, category, thumbnail );
      //Upload the thumbnail file to cloud storage a d get url from there


        if (!title || !description || !category  || !thumbnail || !language || !syllabus || !level) {
            return res.status(400).json({ message: "All fields are required ok" });
        }

        const course = new Course({
            title,
            description,
            category,
            thumbnail,
            teacherId: user._id,
            language,
            syllabus,
            level,
        });

        await course.save();

        return res.status(201).json({ message: "Course created successfully", data: course });
    } catch (error) {
        console.log("Error in creating course", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const editCourse = async (req, res) => {
    const { courseId } = req.params;
    const { description, category, thumbnail, language, syllabus, level } = req.body;
    const user = req.user;

    try {
        if (!courseId || !title || !description || !category || !thumbnail || !language || !syllabus || !level) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.teacherId.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        course.description = description;
        course.category = category;
        course.thumbnail = thumbnail;
        course.language = language;
        course.syllabus = syllabus;
        course.level = level;

        await course.save();

        return res.status(200).json({ message: "Course updated successfully", data: course });
    } catch (error) {
        console.log("Error in updating course", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const uploadLecture = async (req, res) => {
    const { title, description,thumbnail, file,courseId } = req.body;


    const user = req.user;

    try {
        if (!courseId || !title || !description || !thumbnail || !file) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.teacherId.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }


        //upload the video to cloud as HLS (conversion needed for every resolution 360,720,1080p) and thumbnail to cloud Storage
        // and get the url from there
        const videoUrl = "url";

        const video = new Video({
            title,
            description,
            url: videoUrl,
            courseId,
            thumbnail,
            //duration: ,

        })

        await video.save();

        return res.status(200).json({ message: "Lecture uploaded successfully", data: course });
    } catch (error) {
        console.log("Error in uploading lecture", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}