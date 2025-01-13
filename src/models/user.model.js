import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    resetPassToken: {
      type: String,
      default: null,
    },

    courses:{
      type:[mongoose.Schema.Types.ObjectId],
      ref:"Course",
    },

    profilePic: {
      type: String,
      default:
        "https://res.cloudinary.com/dzitsseoz/image/upload/v1732524043/blankDP/uwjpqauvpisbwynu7hpr.png",
    },

    interests:{
      type:[String],
      default:[],
    },

    role: {
      type: String,
      enum: ["student", "admin", "teacher"],
      default: "student",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
