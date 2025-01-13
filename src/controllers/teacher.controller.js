import Course from "../models/course.model.js";

export const createCourse = async (req, res) => {
    // update the code accordingly. Recheck the fields required and validations. This was just to create a sample course

    const { title, description,language,syllabus,level, category, thumbnail } = req.body;
    const user = req.user;

    try {
      console.log(title, description,language,syllabus,level, category, thumbnail );
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