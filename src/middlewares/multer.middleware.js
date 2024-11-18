import multer from 'multer';

const storage = multer.memoryStorage(); // Almacena los archivos en memoria para convertirlos a base64
const upload = multer({ storage });

export default upload;