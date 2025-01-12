import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Course"
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    rating: {
        type: Number,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },
},{
    timestamps: true,
});   

const Review = mongoose.model("Review", reviewSchema);
export default Review;