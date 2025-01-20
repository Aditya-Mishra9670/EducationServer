import mongoose from "mongoose";

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
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }] // Self-referencing for nested replies
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
    replies: [replySchema] // Embedding reply schema
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
