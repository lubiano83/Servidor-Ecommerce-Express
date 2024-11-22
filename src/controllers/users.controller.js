import UserDao from '../dao/user.dao.js';
import CartDao from '../dao/cart.dao.js';
import SessionDao from "../dao/session.dao.js";
import { createHash, isValidPassword } from '../utils/bcrypt.js';
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const userDao = new UserDao();
const cartDao = new CartDao();
const sessionDao = new SessionDao();

export default class UserController {

    getUsers = async(req, res) => {
        try {
            const users = await userDao.getUsers();
            return res.status(200).json({ users });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
        }
    }

    getUserById = async(req, res) => {
        try {
            const { id } = req.params;
            const user = await userDao.getUserById(id);
            if (!user) return res.status(404).json({ status: 404, message: "Usuario no encontrado" });
            return res.status(200).json({ user });
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener el usuario", error: error.message });
        }
    };

    registerUser = async(req, res) => {
        try {
            const { first_name, last_name, email, password } = req.body;
            if (!first_name || !last_name || !email || !password) return res.status(400).json({ status: 400, message: "Todos los campos son requeridos" });
            if (password.length < 6 || password.length > 10) return res.status(400).json({ message: "La contraseña debe tener entre 6 y 10 caracteres." });
            const hashedPassword = await createHash(password);
            const newCart = await cartDao.createCart({ products: [] });
            const newUserData = { first_name, last_name, email, password: hashedPassword, cart: newCart._id };
            const user = await userDao.createUser(newUserData);
            return res.status(201).json({ message: "Usuario creado con exito", user });
        } catch (error) {
            return res.status(500).json({ message: "Error al registrar un usuario", error: error.message });
        }
    }

    loginUser = async(req, res) => {
        try {
            const { email, password } = req.body;
            const user = await userDao.findUserByEmail(email);
            if (!user) return res.status(404).json({ status: 404, message: "El usuario no está registrado" });
            const passwordMatch = await isValidPassword(user, password);
            if (!passwordMatch) return res.status(401).json({ status: 401, message: "La contraseña es incorrecta" });
            const token = jwt.sign({ email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, cart: user.cart, id: user._id.toString() }, process.env.COOKIE_KEY, { expiresIn: "1h" });
            res.cookie("coderCookieToken", token, { maxAge: 3600000, httpOnly: true });
            await sessionDao.createSession(user._id, token);
            return res.status(200).json({ status: 200, message: "Usuario logeado con exito", token });
        } catch (error) {
            return res.status(500).json({ message: "Error al logear un usuario", error: error.message });
        }
    };

    usersLogged = async(req, res) => {
        try {
            const users = await sessionDao.getSessions();
            const usersOnline = users.length;
            return res.status(200).json({ usersOnline });
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener los usuarios online", error: error.message });
        }
    };

    usersRegistered = async(req, res) => {
        try {
            const users = await userDao.getUsers();
            const usersRegistered = users.length;
            return res.status(200).json({ usersRegistered });
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener los usuarios registrados", error: error.message });
        }
    };

    deleteUserById = async(req, res) => {
        try {
            const { id } = req.params;
            const user = await userDao.getUserById(id);
            if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
            if(user.images) {
                const imagePath = path.join(process.cwd(), "src/public", user.images);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            await userDao.deleteUserById(id);
            return res.status(200).json({ message: "Usuario eliminado con éxito" });
        } catch (error) {
            return res.status(500).json({ message: "Error al eliminar un usuario", error: error.message });
        }
    };

    updateUser = async(req, res) => {
        try {
            const { first_name, last_name, region, city, street, number, phone } = req.body;
            const { id } = await req.params;
            const { filename } = req.file;
            const updateData = {
                first_name,
                last_name,
                address: { region, city, street, number },
                phone
            };
            const user = await userDao.getUserById(id);
            if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
            if (filename) {
                const oldImagePath = path.join(process.cwd(), "src/public", user.images);
                if (user.images && fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                updateData.images = `/uploads/${filename}`;
            }
            const updatedUser = await userDao.updateUserById(id, updateData);
            res.status(200).json({ message: "Usuario actualizado", updatedUser });
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };

    logoutUser = async (req, res) => {
        try {
            const token = req.cookies.coderCookieToken; // Obtén el token de la cookie
            if (token) {
                await sessionDao.deleteSession(token); // Opcional: elimina la sesión de la base de datos
            }
            return res.status(200).json({ message: "Sesión cerrada con éxito" });
        } catch (error) {
            return res.status(500).json({ message: "Error al cerrar sesión", error: error.message });
        }
    };    
}