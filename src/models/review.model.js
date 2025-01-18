import mongoose from "mongoose";

// Define a recursive reply schema
const replySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    reply: {
      type: String,
      required: true,
    },
    reported: {
      type: Boolean,
      default: false,
    },
    like: {
      type: Number,
      default: 0,
    },
    unlike: {
      type: Number,
      default: 0,
    },
    replies: [this], // Self-referencing for nested replies
  },
  {
    timestamps: true,
  }
);

const reviewSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
    },
    like: {
      type: Number,
      default: 0,
    },
    unlike: {
      type: Number,
      default: 0,
    },
    reported: {
      type: Boolean,
      default: false,
    },
    replies: [replySchema], // Embed the recursive reply schema
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
