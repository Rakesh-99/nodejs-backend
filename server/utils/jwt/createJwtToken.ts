import dotenv from 'dotenv'
dotenv.config();
import jwt from 'jsonwebtoken';
import userModel from '../../models/user.model';
import mongoose from 'mongoose';
import { Response } from 'express';





// Create jwt token and set cookies : 

const createJwtToken = (userId: mongoose.Types.ObjectId, res: Response) => {

    const token = jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN!, { expiresIn: "1d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 Day
    })
};
export default createJwtToken;