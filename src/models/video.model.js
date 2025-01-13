import mongoose from "mongoose";

const videoSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    
    url: {
        type: String,
        required: true,
    },
    
    thumbnail: {
        type: String,
        required: true,
    },
    
    duration: {
        type: String,
        required: true,
    },

    description:{
        type: String,
    },
    
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Course"
    },
})

const Video = mongoose.model("Video", videoSchema);
export default Video;