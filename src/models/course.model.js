import mongoose from "mongoose";

const courseSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    syllabus: {
      type: [String],
      required: true,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    enrolledStudents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref:"User"
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"User"
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
