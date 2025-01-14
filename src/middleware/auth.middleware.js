import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized- No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized- Invalid token" });
    }

    const user = await User.findById(decodedToken.userId).select(
      "-password -resetPassToken -resetPassExpire"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found or token expired" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "You are not authorized to access this route" });
  }
};

export const checkTeacherAuth = async(req,res,next)=>{
  const user = req.user;
  if(user.role !== "teacher"){
    return res.status(401).json({message:"You are not authorized to access this route"});
  }
  next();
}

export const checkAdminAuth = async(req,res,next)=>{
  const user = req.user;
  if(user.role !== "admin"){
    return res.status(401).json({message:"You are not authorized to access this route"});
  }
  next();
}
