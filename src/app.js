import express from "express";
import userRouter from "./routes/user.router.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import { __dirname } from "./utils/bcrypt.js";
import path from "path";

// Variables
const APP = express();
const PORT = 8080;
const HOST = "localhost";
const permissions = passport.authenticate("current", { session: false });

// Middlewares
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use(cookieParser());
initializePassport();

// Rutas estaticas
APP.use("/uploads", express.static(path.join(process.cwd(), "src/public/uploads")));

// Configuración de CORS
APP.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true
}));

// Rutas
APP.use("/api/auth", userRouter);

// Escuchando al servidor
APP.listen(PORT, () => console.log(`Escuchando en http://${HOST}:${PORT}`));