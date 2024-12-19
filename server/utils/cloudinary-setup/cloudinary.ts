import { v2 as cloudinary } from 'cloudinary';
import asyncErrorHandler from 'express-async-handler';
import dotenv from 'dotenv'
dotenv.config();




// Cloudinary config :
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


// Cloudinary uploader : 
const uploadOnCloudinary = async (imageURL: string) => {
    try {
        const file = await cloudinary.uploader.upload(imageURL, { resource_type: "auto" })
        if (file) {
            return file.url
        }
    } catch (error: any) {
        console.log("Could not upload the image ", error.message);
    }
};
export default uploadOnCloudinary;
