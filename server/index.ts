import express from 'express';
const app = express();
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 8090;
import connectDB from './database/dbConfig';
import userRouter from './routes/user.routes';
import errorHandlerMiddleware from './middlewares/errorHandlerMIddleware';
import cookieParser from 'cookie-parser';
connectDB(process.env.DB_URI!);




//Middleware : 
app.use(cors());
app.use(express());
app.use(express.json());
app.use(cookieParser());
app.use('/user/api', userRouter)
app.use(errorHandlerMiddleware);




app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:/${PORT}`);
});



