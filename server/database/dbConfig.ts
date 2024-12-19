import mongoose from "mongoose";




const connectDB = async (db_url: string) => {
    try {
        const connect = await mongoose.connect(db_url);
        if (connect) {
            console.log("Database conected successfully");
        }
    } catch (error) {
        console.log(error, " Could not connect to the Database!");
    }
};
export default connectDB;