import { Router } from "express";
import CartController from "../controllers/cart.controller.js";
import passport from "passport";
import { soloAdmin, soloUser } from "../middlewares/auth.middleware.js";

const ROUTER = Router();
const cartController = new CartController();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", cartController.getCarts);
ROUTER.post("/", permissions, soloAdmin, cartController.createCart);
ROUTER.get("/:id", cartController.getCartById);
ROUTER.delete("/:id", permissions, soloAdmin, cartController.deleteCardById);
ROUTER.patch("/:id", permissions, soloAdmin, cartController.updateCartById);
ROUTER.post("/products/:pid", permissions, soloUser, cartController.addProductToCart);
ROUTER.put("/clear/:id", cartController.clearCart);
ROUTER.put("/completepurchase", permissions, soloUser, cartController.completePurchase);
ROUTER.get("/:cid/products/:pid", cartController.deleteProductFromCart);

export default ROUTER;