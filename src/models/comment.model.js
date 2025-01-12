import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
},{
    timestamps: true,
});  

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;