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
            return res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
        }
    }

    getUserById = async(req, res) => {
        try {
            const id = req.user.id;
            const user = await userDao.getUserById(id);
            if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
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
            if (!email || !password) return res.status(400).json({ status: 400, message: "Email y contraseña son requeridos" });
            const user = await userDao.findUserByEmail(email);
            if (!user) return res.status(404).json({ status: 404, message: "El usuario no está registrado" });
            const passwordMatch = await isValidPassword(user, password);
            if (!passwordMatch) return res.status(401).json({ status: 401, message: "La contraseña es incorrecta" });
            const token = jwt.sign({ email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, cart: user.cart, id: user._id.toString() }, process.env.COOKIE_KEY, { expiresIn: "1h" });
            res.cookie("coderCookieToken", token, { maxAge: 3600000, httpOnly: true, secure: true, sameSite: "strict", path: "/" });
            await sessionDao.createSession(user._id, token);
            return res.status(200).json({ status: 200, message: "Usuario logeado con éxito", token });
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

    updateUser = async (req, res) => {
        try {
            const { first_name, last_name, region, city, street, number, phone } = req.body;
            const id = req.user.id;
            const { filename } = req.file;
            if (!filename) return res.status(400).json({ message: "No se subió ninguna imagen" });
            const newImagePath = `/profile/${filename}`;
            const updateData = { first_name, last_name, address: { region, city, street, number }, phone, image: newImagePath };
            const user = await userDao.getUserById(id);
            if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
            if (user.image) {
                const oldImagePath = path.join(process.cwd(), "src/public", user.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log("Imagen anterior eliminada correctamente.");
                } else {
                    console.log("La imagen anterior no existe:", oldImagePath);
                }
            }
            const updatedUser = await userDao.updateUserById(id, updateData);
            res.status(200).json({ message: "Usuario actualizado con éxito", updatedUser });
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    };
    
    logoutUser = async(req, res) => {
        try {
            const token = req.cookies.coderCookieToken;
            res.clearCookie("coderCookieToken", { httpOnly: true, secure: true, sameSite: "strict", path: "/" });
            if (!token) {
                return res.status(401).json({ message: "Token no encontrado, sesión cerrada" });
            }
            await sessionDao.deleteSession(token);
            return res.status(200).json({ message: "Sesión cerrada con éxito" });
        } catch (error) {
            return res.status(500).json({ message: "Error al cerrar sesión", error: error.message });
        }
    };

    updateRole = async(req, res) => {
        try {
            const { id } = req.params
            const { role } = req.body;
            if (Array.isArray(role)) role = role[0];
            const validRoles = ["admin", "user", "developer"];
            if (!role || typeof role !== "string" || !validRoles.includes(role)) return res.status(400).json({ message: `El campo 'role' debe ser uno de los siguientes valores: ${validRoles.join(", ")}` });
            if (!role) return res.status(400).json({ message: "El campo 'role' es requerido" });
            const updateUser = await userDao.updateUserById( id, { role } );
            return res.status(200).json({ message: "Rol actualizado con éxito", updateUser });
        } catch (error) {
            return res.status(500).json({ message: "Error al cerrar sesión", error: error.message });
        }
    }
}   