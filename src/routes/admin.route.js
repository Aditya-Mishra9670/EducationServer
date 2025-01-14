import express from "express";
import {allUsers, getUserbyId,deletebyId,createNotification} from "../controllers/admin.controller.js";
const router = express.Router();


  
router.get('/allUsers',allUsers);
router.get('/:userId',getUserbyId);
router.post('/createNotification',createNotification);
router.delete('/removeUser',deletebyId);

export default router;