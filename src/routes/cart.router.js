import { Router } from "express";
import CartController from "../controllers/cart.controller.js";

const ROUTER = Router();
const cartController = new CartController();

ROUTER.get("/", cartController.getCarts);

export default ROUTER;