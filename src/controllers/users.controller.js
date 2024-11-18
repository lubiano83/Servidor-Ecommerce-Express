import UserDao from '../dao/user.dao.js';
import CartDao from '../dao/cart.dao.js';
import SessionDao from "../dao/session.dao.js";
import { createHash, isValidPassword } from '../utils/bcrypt.js';
import jwt from "jsonwebtoken";

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
            const hashedPassword = await createHash(password);
            const newCart = await cartDao.createCart({ products: [] });
            const newUserData = { first_name, last_name, email, password: hashedPassword, cart: newCart._id };
            const user = await userDao.createUser(newUserData);
            return res.status(201).json({ message: "Usuario creado con exito", user });
        } catch (error) {
            console.log(error.message);
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
            const token = jwt.sign({ email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, cart: user.cart, id: user._id.toString() }, "coderhouse", { expiresIn: "1h" });
            res.cookie("coderCookieToken", token, { maxAge: 3600000, httpOnly: true,  });
            await sessionDao.createSession(user._id, token);
            return res.status(200).json({ token });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: "Error al logear un usuario", error: error.message });
        }
    };

    usersLogged = async(req, res) => {
        try {
            const users = await sessionDao.getSessions();
            const usersOnline = users.length;
            return res.status(200).json({ usersOnline });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: "Error al obtener los usuarios online", error: error.message });
        }
    };

    usersRegistered = async(req, res) => {
        try {
            const users = await userDao.getUsers();
            const usersRegistered = users.length;
            return res.status(200).json({ usersRegistered });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: "Error al obtener los usuarios registrados", error: error.message });
        }
    };

    deleteUserById = async(req, res) => {
        try {
            const { id } = req.params;
            await userDao.deleteUserById(id);
            return res.status(200).json({ message: "Usuario eliminado con exito" });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: "Error al eliminar un usuario", error: error.message });
        }
    };

    updateUser = async(req, res) => {
        try {
            const { id } = req.params;
            const { first_name, last_name, address, images, password } = req.body;
            const updateData = {};
            if (first_name) updateData.first_name = first_name;
            if (last_name) updateData.last_name = last_name;
            if (address) updateData.address = address;
            if (password) updateData.password = password;
            if (req.file) {
                const imagePath = req.file.path;
    
                // Convierte la imagen a Base64
                const imageBuffer = await fs.promises.readFile(imagePath);
                updateData.images = imageBuffer.toString("base64");
            }
            const updatedUser = await userDao.updateUserById(id, updateData);
            if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });
            return res.status(200).json({ message: "Usuario modificado exitosamente", updatedUser });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
        }
    };

    logoutUser = async(req, res) => {
        try {
            const { token } = req.body;       
            const userToken = await sessionDao.getUserToken(token);
            await sessionDao.deleteSession(userToken);
            return res.status(200).json({ message: "Sesion cerrada con exito" });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            return res.status(500).json({ message: "Error al cerrar sesión", error: error.message });
        }
    };
}