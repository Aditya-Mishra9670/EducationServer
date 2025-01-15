import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    message: {
        type: String,
        required: true,
    },
    
    //For navigating through notification
    reference:{
        type:String,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;