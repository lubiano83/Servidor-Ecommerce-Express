import { Router } from "express";
import CartController from "../controllers/cart.controller.js";
import passport from "passport";
import { soloAdmin, soloUser, soloDev } from "../middlewares/auth.middleware.js";

const ROUTER = Router();
const cartController = new CartController();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", permissions, soloAdmin, soloDev, cartController.getCarts);
ROUTER.post("/", permissions, soloAdmin, cartController.createCart);
ROUTER.get("/:id", cartController.getCartById);
ROUTER.delete("/:id", permissions, soloAdmin, cartController.deleteCardById);
ROUTER.patch("/:id", permissions, soloAdmin, cartController.updateCartById);
ROUTER.post("/products/:pid", permissions, soloUser, cartController.addProductToCart);
ROUTER.delete("/clear/:id", permissions, soloUser, cartController.clearCart);
ROUTER.delete("/:cid/products/:pid", permissions, soloUser, cartController.deleteProductFromCart);
ROUTER.put("/completepurchase", permissions, soloUser, cartController.completePurchase);

export default ROUTER;