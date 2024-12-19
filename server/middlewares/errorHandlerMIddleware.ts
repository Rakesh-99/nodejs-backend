import { NextFunction, Request, Response } from "express";

const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
   
    err.errMessage = err.message || "Internal Server Error!";
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
        success: false,
        message: err.errMessage,
    })
};

export default errorHandlerMiddleware;