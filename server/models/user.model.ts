import mongoose from 'mongoose';





interface IUserSchema extends Document {
    username: string,
    email: string,
    password: string,
    profilePicture?: string,
    isAdmin: boolean,
    otpVerificationCode: string,
    otpVerificationCodeExpiresAt: Date,
    isVerified: boolean,
    resetPasswordToken: string,
    resetPasswordTokenExpiresAt: Date
    lastLogin: Date
}


// User schema : 
const userShcma = new mongoose.Schema<IUserSchema>({
    username: {
        type: String,
        required: [true, "Username is required!"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required!"]
    },
    profilePicture: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    otpVerificationCode: {
        type: String,
        required: [true, "OTP is required!"]
    },
    otpVerificationCodeExpiresAt: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordTokenExpiresAt: {
        type: Date
    },
    lastLogin: {
        type: Date
    }

}, { timestamps: true });


// User model : 
const userModel = mongoose.model("User", userShcma);
export default userModel;