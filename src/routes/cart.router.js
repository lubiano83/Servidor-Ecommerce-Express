import { Router } from "express";
import CartController from "../controllers/cart.controller.js";

const ROUTER = Router();
const cartController = new CartController();

ROUTER.get("/", cartController.getCarts);
ROUTER.post("/", cartController.createCart);
ROUTER.get("/:id", cartController.getCartById);
ROUTER.delete("/:id", cartController.deleteCardById);
ROUTER.patch("/:id", cartController.updateCartById);

export default ROUTER;