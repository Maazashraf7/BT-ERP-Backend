import multer from "multer";

import fs from "fs";

// Store files temporarily on disk before uploading to Cloudinary
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let subfolder = "";

        // Decide subfolder based on fieldname or route context
        if (file.fieldname === "coverImage") {
            subfolder = "books/";
        } else if (file.fieldname === "file" && req.originalUrl.includes("branding")) {
            subfolder = "branding/";
        } else if (file.fieldname === "studentImage") {
            subfolder = "students/";
        }

        const path = `uploads/${subfolder}`;

        // Ensure directory exists
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }

        cb(null, path);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

export const upload = multer({ storage, fileFilter });
