import transport from "./nodemailerTransport";
import dotenv from 'dotenv';
dotenv.config();
import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "../templates/email-templates";
import asyncErrorHandler from 'express-async-handler';


// send otp verification mail : 
export const sendOtpVerification = async (email: string, otp: string) => {

    try {
        const sendMail = await transport.sendMail({
            from: process.env.USER,
            to: email,
            subject: "Verify your email address",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", otp)
        })
        console.log("Verification code has been sent successfully", sendMail.messageId);
    } catch (error: any) {
        console.log("Could not send mail, Error -> ", error.message);
    }
};


//Send Reset password link : 
export const sendResetPasswordInstruction = async (email: string, resetPasswordToken: string) => {

    const constructResetLInk = `${process.env.BASE_URL}/user/api/reset-password-instruction/${resetPasswordToken}`

    try {
        const sendResetPasswordLink = await transport.sendMail({
            from: process.env.APP_USER,
            to: email,
            subject: "Reset Password Instruction",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", constructResetLInk)
        })
        console.log("Reset password link has been sent to your registered email", sendResetPasswordLink.messageId);

    } catch (error: any) {
        console.log("Could not send reset password link, Error -> ", error.message);
    }
}