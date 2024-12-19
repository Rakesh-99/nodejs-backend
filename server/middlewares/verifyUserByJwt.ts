import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction, } from 'express';
import asyncErrorHandler from 'express-async-handler';
import ErrorHandler from '../utils/ErrorHandler';




declare global {
    namespace Express {
        interface Request {
            userId: string
        }
    }
}


const verifyUserByJwt = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {

    const cookie = req.cookies.token;

    // Chekck if the cookie is available or not :
    if (!cookie) {
        return next(new ErrorHandler(401, "Cookie or user not found!"))
    }

    // if cookie avalibale , verify it : 

    const isCookieVerified = jwt.verify(cookie, process.env.ACCESS_TOKEN!) as JwtPayload;

    if (!isCookieVerified) {
        return next(new ErrorHandler(401, "Invalid cookie!"));
    }

    req.userId = isCookieVerified._id;
    next();
});


export default verifyUserByJwt;