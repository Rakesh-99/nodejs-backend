import express from 'express';
const userRouter = express.Router();
import { checkUserProfile, deleteUser, forgetPasssowrd, loginUser, logoutUser, resetPassword, searchUser, signupUser, updateUserProfile, verifyEmail } from '../controllers/user.controller';
import verifyUserByJwt from '../middlewares/verifyUserByJwt';
import multerFileUpload from '../middlewares/multer-config/multerFileUpload';

userRouter.post('/signup', signupUser)
    .post('/verify-email', verifyEmail)
    .post("/login", loginUser)
    .post("/logout", logoutUser)
    .post("/forget-password", forgetPasssowrd)
    .post("/reset-password-instruction/:passwordToken", resetPassword)
    .put("/update-user", verifyUserByJwt, multerFileUpload.single("profilePicture"), updateUserProfile)
    .delete('/delete-user', verifyUserByJwt, deleteUser)
    .get("/check-user-profile", verifyUserByJwt, checkUserProfile)
    .get("/search-user/:search", searchUser)



export default userRouter;