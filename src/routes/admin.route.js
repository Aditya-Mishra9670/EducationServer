import express from "express";
import {allUsers, getUserbyId,createNotification, deleteUserbyId} from "../controllers/admin.controller.js";
const router = express.Router();


  
router.get('/allUsers',allUsers);
router.get('/:userId',getUserbyId);
router.post('/createNotification',createNotification);
router.delete('/removeUser',deleteUserbyId);

export default router;