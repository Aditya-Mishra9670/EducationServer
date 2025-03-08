import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import { generateAuthToken,sendLoginActivityMail,sendPasswordResetMail, sendWelcomeMail,} from "../lib/utils.js";

export const userAuth = (req, res) => {
  return res.json({ status: true, message: "Authorized", data: req.user });
};

export const signup = async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log(username, email, password, role);

  if(username.length > 18){
    return res.status(400).json({ message: "Username should be less than 18 characters" });
  }
  if(!validator.isEmail(email)){
    return  res.status(400).json({ message: "Invalid Email format" });
  }
  if(!validator.isStrongPassword(password)){
    return res.status(400).json({ message: "Password should be atleast 8 characters long and should contain atleast 1 uppercase, 1 lowercase, 1 number and 1 special character" });
  }
  if(role !== "student" && role !== "teacher" && role !== "admin"){
    return res.status(400).json({ message: "Invalid Role" });
  }

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: username,
      email,
      password: hashedPassword,
      role: role,
    });

    await newUser.save();
    generateAuthToken(newUser._id,res);
    // sendWelcomeMail(email, username);
    console.log("Registration Successful");
    return res.status(201).json({ message: "User saved successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Checking the input dual validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password both are required !" });
    }

    //check if user exits
    const userExistance = await User.findOne({ email });
    if (!userExistance) {
      return res.status(404).json({ message: "Invalid Credentials" });
    }

    //validate password
    const validpassword = await bcrypt.compare(
      password,
      userExistance.password
    );
    if (!validpassword) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Generating JWT token for page protection so that no one can go forward without login using urls
    generateAuthToken(userExistance._id,res);

    //Send Login activity mail here.
    // await sendLoginActivityMail(userExistance.email, userExistance.name);

    //successful response
    return res.status(200).json({
      data:userExistance,
      message: "Login Successful!",
    });
  } catch (error) {
    console.error("Login Error: ", error);
    return res.status(500).json({ message: "Internal server Error" });
  }
};

export const resetPassMail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "5m",
    });

    const saveToken = async (userId) => {
      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { resetPassToken: token },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          console.log("User not found");
          return res.status(400).json({ message: "User not found" });
        } else {
          console.log("Token saved successfully", updatedUser);
        }
      } catch (error) {
        console.error("Error in saving the password reset token", error);
      }
    };

    await saveToken(user._id);

    sendPasswordResetMail(email, user.name, token);
    return res.status(200).json({message:"Mail sent successfully"})
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (!decoded) {
      return res.status(401).json({ message: "Your password reset session expired!" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPassToken = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    if(error.message === "jwt expired"){
      return res.status(400).json({message:"Token Expired"})
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ status: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
