import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    resetPassToken: {
      type: String,
      default: null,
    },

    profilePic: {
      type: String,
      default:
        "https://res.cloudinary.com/dzitsseoz/image/upload/v1732524043/blankDP/uwjpqauvpisbwynu7hpr.png",
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
