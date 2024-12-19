import { Request } from 'express';
import multer from 'multer';




// Multer configurtion : 
const storage = multer.diskStorage({
    // Destination : 
    destination: (req: Request, filename, callback) => {
        callback(null, 'temp/uploads')
    },

    filename: (req: Request, filename, callback) => {
        callback(null, filename.filename)
    }
});

const multerFileUpload = multer({ storage });
export default multerFileUpload;