import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import {auth} from "./routes/authentication.js"

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

app.use('/auth',auth);

app.get("/", (req, res) => {
    res.send("Hello World");
});


app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`);
});