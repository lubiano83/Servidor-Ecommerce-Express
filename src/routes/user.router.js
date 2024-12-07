import { Router } from "express";
import UserController from "../controllers/users.controller.js";
import { uploadProfile } from "../utils/uploader.js";
import passport from "passport";
import { soloAdmin, soloUser } from "../middlewares/auth.middleware.js";

const userController = new UserController();
const permissions = passport.authenticate("current", { session: false });

const ROUTER = Router();

ROUTER.get("/users", userController.getUsers);
ROUTER.delete("/users", userController.logoutUser);
ROUTER.get("/users/:id", userController.getUserById);
ROUTER.patch("/users/:id", uploadProfile.single('image'), userController.updateUser);
ROUTER.delete("/users/:id", permissions, soloAdmin, userController.deleteUserById);
ROUTER.post("/register", userController.registerUser);
ROUTER.get("/register", permissions, soloAdmin, userController.usersRegistered);
ROUTER.post("/login", userController.loginUser);
ROUTER.get("/login", userController.usersLogged);
ROUTER.patch("/role/:id", userController.updateRole);

export default ROUTER;