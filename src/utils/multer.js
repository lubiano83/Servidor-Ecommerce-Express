import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(), // Almacena las imágenes en memoria
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif|webp/;
        const extName = fileTypes.test(file.originalname.toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new Error("Solo se permiten imágenes"));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
});

export default upload;