import express from "express";
import {allUsers, getUserbyId,createNotification, deleteUserbyId, getReports, getReportedContent, reviewReport} from "../controllers/admin.controller.js";
const router = express.Router();


  
router.get('/allUsers',allUsers);
router.get('/:userId',getUserbyId);
router.post('/createNotification',createNotification);
router.delete('/removeUser',deleteUserbyId);
router.get('/reports',getReports);
router.get('/specificReport',getReportedContent);
router.post('/reviewReport',reviewReport);

export default router;