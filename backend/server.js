import express from "express";
import api from './routes/index.js'
import dotenv from 'dotenv'
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config()
mongoose.connect(process.env.MONGODB_PATH, () => {
    console.log('connect');
}, (e) => console.log(e))


const PORT = process.env.SERVER_PORT || 9000
const origin = process.env.CORS_ORIGIN || 'http://localhost:3000'

const app = express()

app.use(cors({
    origin
}));
app.use(express.json())
app.use(express.urlencoded())

app.use(api)

app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);

app.listen(PORT, () => {
    console.log(`Your app is running in http://localhost:${PORT}`)
})

//This section replaced by above code
//const express = require("express");
//const mongoose = require("mongoose");
//const userRoutes = require("./routes/userRoutes");

//const app = express();
//app.use(express.json());

// Remove this duplicate connection
// mongoose.connect("mongodb://localhost:27017/phd_tracker", { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(5000, () => console.log("Server running on port 5000"));
