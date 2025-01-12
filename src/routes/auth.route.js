import express from "express";
import { login, logout, resetPassMail, resetPassword, signup, userAuth } from "../controllers/auth.controller.js";
import { checkAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup",signup );

router.post("/login",login);

router.post("/forget-password",resetPassMail);

router.get('/verify',checkAuth,userAuth);

router.post('/reset-password/:token',resetPassword);

router.get('/logout', logout);
  
export default router;
  
