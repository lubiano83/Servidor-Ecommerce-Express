import { Router } from "express";
import UserController from "../controllers/users.controller.js";
import { uploadProfile } from "../utils/uploader.js";

const userController = new UserController();

const ROUTER = Router();

ROUTER.get("/users", userController.getUsers);
ROUTER.delete("/users", userController.logoutUser);
ROUTER.get("/users/:id", userController.getUserById);
ROUTER.patch("/users/:id", uploadProfile.single('image'), userController.updateUser);
ROUTER.delete("/users/:id", userController.deleteUserById);
ROUTER.post("/register", userController.registerUser);
ROUTER.get("/register", userController.usersRegistered);
ROUTER.post("/login", userController.loginUser);
ROUTER.get("/login", userController.usersLogged);

export default ROUTER;