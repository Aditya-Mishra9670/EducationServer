import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"
import {User} from "../models/User.js";
const router = express.Router();


// POST request for Signup for students
router.post("/signup",async(req,res)=>{
    const {username, email, password} = req.body;
    console.log(username,email,password);
    if(!username || !email || !password){
        return res.status(400)({message: 'All fileds are required'});
    }

    try{
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message : "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        console.log("Registration Successful");
        return res.status(201).json({message: "user saved successfully"});
    }catch(error){
        console.log(error);//Guys remove it after the deployement
        return res.status(500).json({message: "Internal server error"});
    }
});


//POST request for Login
router.post("/login",async(req,res)=>{
    try{
        const {email, password} = req.body;

        //Checking the input dual validation
        if(!email || !password){
            return res.status(400).json({message: "Email and password both are required !"});
        }

        //check if user exits 
        const userExistance = await User.findOne({email});
        if(!userExistance){
            return res.status(404).json({message : "User not found "});
        }

        //validate password 
        const validpassword = await bcrypt.compare(password,userExistance.password);
        if(!validpassword){
            return res.status(401).json({message: "Incorrect Password! "});
        }

        //Generating JWT token for page protection so that no one can go forward without login using urls
        const token = jwt.sign(
            {
                username : userExistance.username,
                id: userExistance._id
            },
            process.env.KEY,
            {
                expiresIn: "100h"
            }
        );

        res.cookie("token",token,{
            httpOnly: true,
            maxAge: "3600000",// 1 hour
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        //successful response
        return res.status(200).json({
            status: true,
            message:"Login Successful!"
        });
    }catch(error){
        console.error("Login Error: ",error);
        return res.status(500).json({message: "Internal server Error"});
    }
});

//POST request for forgot password
router.post("/forget-password",async(req,res)=>{
    const {email} = req.body;
    try{
        //check if the useer exists
        if(!user){
            return res.status(404).json({message: "User not registered"});
        }

        //create a reset token
        const token = jwt.sign(
            {id: user._id},
            process.env.KEY,
            {expiresIn: "5m"}
        )

        //set up the transporter for sending email
        const trasporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.ORG_MAIL,
                pass: process.env.EMAILPASSWORD
            }
        });

        //Email content 
        const mailpotions = {
            from : process.env.ORG_MAIL,
            to : email,
            subject : "Password Reset Reqest from Education",
            text: `click on the following link to reset your password/${token}`
        };

        //send email
        trasporter.sendMail(mailpotions, function(error,info){
            if(error){
                console.error("Error in send email : ", error);
                return res.status(500).json({message:"something went wrong",error});
            }else{
                return res.status(200).json({message:"Password reset email sent",info: info.response});
            }
        });
    }catch(error){
        console.error("Error in forgot-password route:",error);
        return res.status(500).json({message:"Internal server Error"});
    }
});

//Middleware to verify the user
const verifyuser = async (req,res,next)=>{
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({status:false,message:"no token provided"});
        }

        //verify the token
        const decoded = jwt.verify(token,process.env.KEY);
        req.user = decoded;
        next();
    }catch(error){
        return res.status(403).json({status: false, message: "Unauthorized user",error:error.message});
    }
};

//protected route
router.get('/verify',verifyuser,(req,res)=>{
    return res.json({status:true,message: "Authorized"});
})

router.post('/reset-password/:token',async(req,res)=>{
    const token = req.params;
    const {newPassword} = req.body;

    if(!newPassword){
        return res.status(400).json({message: "new password is required !"});
    }

    try{
        //verify the token
        const decoded = jwt.verify(token,process.env.KEY);
        if(!decoded){
            return res.status(401).json({message:"Your password reset session expired! "});
        }

        //find the user based on the decoded ID
        const user  =  await User.findById(decoded.id);
        if(!user){
            return res.status(404).json({message:"user not found"});
        }

        //hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //Update the user's password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({message:"Password rest successful !"});
    }catch(error){
        console.error("Error restting password: ",error);
        return res.status(500).json({message:"Internal server Error"});
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ status: true });
  });
  
  export const auth = router;
  