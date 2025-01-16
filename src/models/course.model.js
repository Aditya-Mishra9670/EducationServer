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

    lectures: [
      {
        _id: mongoose.Schema.Types.ObjectId, // Unique ID for each lecture
        title: { type: String, required: true },
        duration: { type: Number, required: true }, 
        videoUrl: { type: String, required: true }, 
      },
    ],
    
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
