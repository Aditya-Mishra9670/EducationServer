import mongoose from "mongoose";

const enrollmentSchema = mongoose.Schema({
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
    completed: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    certificateUrl: {
        type: String,
        default: null,
    },
    progress: {
        type: Number,
        default: 0,
    },
},{
    timestamps: true,
});


const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;