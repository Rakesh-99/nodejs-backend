import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();



// create nodemaier transport : 
const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: process.env.NODE_ENV === "production" ? true : false,
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASSWORD
    }
});

export default transport;