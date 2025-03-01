import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import {authRouter, userRouter,teacherRouter, adminRouter} from "./routes/routes.js"
import { checkAdminAuth, checkAuth, checkStudentAuth, checkTeacherAuth } from './middleware/auth.middleware.js';
import { getAllData } from './controllers/database.controller.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: ['http://localhost:8000','http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(cookieParser());

app.use('/auth',authRouter);

app.use('/about',getAllData);

app.use('/user',checkAuth,checkStudentAuth,userRouter);


app.use('/ping', (req, res) => {
    res.status(200).json({ message: "pong" });
});

app.use('/teacher',checkAuth,checkTeacherAuth,teacherRouter);

app.use('/admin',checkAuth,checkAdminAuth,adminRouter);

app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`);
});