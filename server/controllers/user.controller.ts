import { NextFunction, Request, Response } from "express";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import asyncErrorHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { sendOtpVerification, sendResetPasswordInstruction } from "../config/nodemailer-config/sendMail";
import createJwtToken from "../utils/jwt/createJwtToken";
import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';
import uploadOnCloudinary from "../utils/cloudinary-setup/cloudinary";


type ResetPasswordParams = {
    passwordToken: string
}



// User signup : 
export const signupUser = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { username, email, password }: { username: string, email: string, password: string } = req.body;

    const user = await userModel.findOne({ email: email });

    // Check for the user existance : 
    if (user) {
        return next(new ErrorHandler(400, "User is already exist!"));
    }

    // Hash password and , add user if not exist : 
    const hashPassword = await bcrypt.hash(password, 10);

    // Generate six digit OTP : 
    const generateOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const addUser = new userModel({
        username,
        email,
        password: hashPassword,
        otpVerificationCode: generateOTP,
        otpVerificationCodeExpiresAt: (new Date(Date.now() + 15 * 60 * 1000))
    });

    // save the user in DB : 
    await addUser.save();


    // Send OTP : 
    await sendOtpVerification(addUser.email, addUser.otpVerificationCode);

    // Extracting password from user : 
    const { password: _, ...rest } = addUser.toObject();

    // return the response : 
    return res.status(200).json({
        success: true,
        message: "User has been registered",
        user: rest
    })
})


// Verify email :
export const verifyEmail = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { otp }: { otp: string } = req.body;

    const user = await userModel.findOne({ otpVerificationCode: otp });

    // check for the otp in DB : 
    if (!user) {
        return next(new ErrorHandler(401, "Invalid OTP entered!"));
    } else if (new Date(Date.now()) > user.otpVerificationCodeExpiresAt!) {
        return next(new ErrorHandler(401, "OTP has been expired!"))
    }

    // Otp has been verified, now set the verified user to true and remove the otp : 
    await userModel.findByIdAndUpdate({ _id: user._id }, {
        isVerified: true,

        // Remove the "otp" and "verification code expires at" fields after verifying the email : 
        $unset: {
            otpVerificationCode: "",
            otpVerificationCodeExpiresAt: ""
        }
    }, { new: true })

    return res.status(200).json({
        success: true,
        message: `Hi ${user.username}, Your email address has been verified`
    })
})


// Login user : 
export const loginUser = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password }: { email: string, password: string } = req.body;

    // Find user: 
    const user = await userModel.findOne({ email: email });
    if (!user) {
        return next(new ErrorHandler(404, "Invalid email or password!"))
    }
    // check if the password match ot not : 
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return next(new ErrorHandler(401, "Invalid email or password!"));
    }

    // Create Jwt token and set cookies: 
    createJwtToken(user._id, res);

    //Update the last login : 
    await userModel.findByIdAndUpdate({ _id: user._id }, { lastLogin: new Date(Date.now()) })

    // Extracting password from user : 
    const { password: _, ...rest } = user.toObject();

    return res.status(200).json({
        success: true,
        message: "Login successfull",
        user: rest
    })
});


// Logout User : 
export const logoutUser = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    res.clearCookie("token");

    return res.status(200).json({
        success: true,
        message: "Logout successfull"
    })
})


// Forget password :
export const forgetPasssowrd = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email }: { email: string } = req.body;

    // Check the email in DB : 
    const user = await userModel.findOne({ email: email });

    if (!user) {
        return next(new ErrorHandler(401, "User not found!"));
    }

    // Generate reset password token : 
    const resetPasswordTokenString = crypto.randomBytes(30).toString("hex");
    const resetPaswordExpires = new Date(Date.now() + 15 * 60 * 1000);;

    // save the reset password token in database : 
    const updateUser = await userModel.findByIdAndUpdate({ _id: user._id }, {
        resetPasswordToken: resetPasswordTokenString,
        resetPasswordTokenExpiresAt: resetPaswordExpires
    }, { new: true })

    // send reset password link mail : 
    await sendResetPasswordInstruction(user.email, resetPasswordTokenString);

    // Send response to the user : 
    return res.status(200).json({
        success: true,
        message: `Hi ${user.username}, Reset password link has been sent to your email`
    })
});

// Reset password : 
export const resetPassword = asyncErrorHandler(async (req: Request<ResetPasswordParams>, res: Response, next: NextFunction): Promise<any> => {

    const { passwordToken }: { passwordToken: string } = req.params;
    const { newPassword }: { newPassword: string } = req.body;

    // Fnd the user through password toekn coming from params: 
    const user = await userModel.findOne({ resetPasswordToken: passwordToken });
    if (!user) {
        return next(new ErrorHandler(401, "Invalid reset password link!"));
    } else if (new Date(Date.now()) > user.resetPasswordTokenExpiresAt) {
        return next(new ErrorHandler(401, "Reset password link has been expired!"));
    }

    // hash the password coming from body : 

    const hashPassword = await bcrypt.hash(newPassword, 10);

    // Update the password : 
    await userModel.findByIdAndUpdate({ _id: user._id }, {
        password: hashPassword,
        $unset: {
            resetPasswordToken: "",
            resetPasswordTokenExpiresAt: ""
        }
    }, { new: true })

    // Send response : 
    return res.status(200).json({
        success: true,
        message: "Password has been reset successfully"
    });
})


// Update user : 
export const updateUserProfile = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    const cookieUserId = req.userId;
    const user = await userModel.findById({ _id: cookieUserId });
    const { username, email, password }: { username: string, email: string, password: string } = req.body;
    const userAvatar = req.file;
    let cloudinaryImageUrl;

    // if file is available upload on cloudinary : 
    if (userAvatar) {
        cloudinaryImageUrl = await uploadOnCloudinary(userAvatar.path);
    }

    // Hash the password coming from client body : 
    const hashedPassword = await bcrypt.hash(password, 10);


    // Update user : 
    await userModel.findOneAndUpdate({ _id: user && user._id }, {
        username,
        email,
        password: hashedPassword,
        profilePicture: cloudinaryImageUrl
    }, { new: true });

    return res.status(200).json({
        success: true,
        message: `Hi ${user && user.username}, Your profie has been updated`
    })
})


//  Delete user by cookie Id : 
export const deleteUser = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const cookieUser = req.userId;

    const user = await userModel.findById({ _id: cookieUser });

    if (!user) {
        return next(new ErrorHandler(404, "User not found!"));
    }
    // Delete the user 
    await userModel.findByIdAndDelete({ _id: cookieUser });

    return res.status(200).json({
        success: true,
        message: "User has been deleted!"
    })
});



// Check user profile : 
export const checkUserProfile = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const cookieUser = req.userId;

    const user = await userModel.findById({ _id: cookieUser });

    if (!user) {
        return next(new ErrorHandler(404, "User not found!"));
    }

    // Extract password from User : 
    const { password, ...rest } = user.toObject();

    // send user info as response : 
    res.status(200).json({
        success: true,
        message: "Your profile has been fetched",
        user: rest
    })
});


// Search user api : 
export const searchUser = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const searchParams = req.params.search;
    const query = req.query.searchQuery;

    // implement search logic  : 
    const fetchUser = [];
    
    // search through params : 
    if (searchParams) {
        fetchUser.push(
            { username: { $regex: searchParams, $options: "i" } },
            { email: { $regex: searchParams, $options: "i" } }
        )
    }
    // search through query : 
    if (query) {
        fetchUser.push(
            { username: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } }
        )
    }


    const user = await userModel.find({ $or: fetchUser });

    if (user.length === 0) {
        return next(new ErrorHandler(404, "No user found!"));
    }

    return res.status(200).json({
        success: true,
        message: `${user.length} user found`,
        user: user
    })
});

