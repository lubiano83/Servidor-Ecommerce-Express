import express from "express";
import userRouter from "./routes/user.router.js";
import productRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";
import ticketRouter from "./routes/ticket.router.js";
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

// Middlewares
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use(cookieParser());
APP.use(passport.initialize());
initializePassport();

// Rutas estaticas
APP.use("/", express.static(path.join(process.cwd(), "src/public/")));

// Configuración de CORS
APP.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true
}));

// Rutas
APP.use("/api/auth", userRouter);
APP.use("/api/products", productRouter);
APP.use("/api/carts", cartRouter);
APP.use("/api/tickets", ticketRouter);

// Método que gestiona las rutas inexistentes.
APP.use("*", (req, res) => {
    return res.status(404).send("<h1>Error 404: Not Found</h1>");
});

// Control de errores internos
APP.use((error, req, res) => {
    console.error("Error:", error.message);
    res.status(500).send("<h1>Error 500: Error en el Servidor</h1>");
});

// Escuchando al servidor
APP.listen(PORT, () => console.log(`Escuchando en http://${HOST}:${PORT}`));