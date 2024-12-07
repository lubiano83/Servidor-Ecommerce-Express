import { Router } from "express";
import UserController from "../controllers/users.controller.js";
import { uploadProfile } from "../utils/uploader.js";
import passport from "passport";
import { soloAdmin, soloUser } from "../middlewares/auth.middleware.js";

const userController = new UserController();
const permissions = passport.authenticate("current", { session: false });

const ROUTER = Router();

ROUTER.get("/users", permissions, soloAdmin, userController.getUsers);
ROUTER.delete("/logout", permissions, soloUser, userController.logoutUser);
ROUTER.get("/users/:id", permissions, soloUser, userController.getUserById);
ROUTER.patch("/update", permissions, soloUser, uploadProfile.single('image'), userController.updateUser);
ROUTER.delete("/users/:id", permissions, soloAdmin, userController.deleteUserById);
ROUTER.post("/register", userController.registerUser);
ROUTER.get("/register", permissions, soloAdmin, userController.usersRegistered);
ROUTER.post("/login", userController.loginUser);
ROUTER.get("/login", permissions, soloAdmin, userController.usersLogged);
ROUTER.patch("/role/:id", permissions, soloAdmin, userController.updateRole);

export default ROUTER;