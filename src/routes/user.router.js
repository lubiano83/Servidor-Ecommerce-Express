import { Router } from "express";
import UserController from "../controllers/users.controller.js";
import upload from "../utils/multer.js"

const userController = new UserController();

const ROUTER = Router();

ROUTER.get("/users", userController.getUsers);
ROUTER.delete("/users", userController.logoutUser);
ROUTER.get("/users/:id", userController.getUserById);
ROUTER.patch("/users/:id", upload.single("images"), userController.updateUser);
ROUTER.delete("/users/:id", userController.deleteUserById);
ROUTER.post("/register", userController.registerUser);
ROUTER.get("/register", userController.usersRegistered);
ROUTER.post("/login", userController.loginUser);
ROUTER.get("/login", userController.usersLogged);

export default ROUTER;