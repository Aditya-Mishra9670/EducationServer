import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import {authRouter, userRouter,teacherRouter, adminRouter} from "./routes/routes.js"
import { checkAdminAuth, checkAuth, checkTeacherAuth } from './middleware/auth.middleware.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(cookieParser());

app.use('/auth',authRouter);

app.use('/user',checkAuth,userRouter);

app.use('/teacher',checkAuth,checkTeacherAuth,teacherRouter);

app.use('/admin',checkAuth,checkAdminAuth,adminRouter);
// app.use('/admin',adminRouter);

app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`);
});