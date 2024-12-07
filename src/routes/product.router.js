import { Router } from "express";
import ProductController from "../controllers/products.controller.js";
import { uploadProducts } from "../utils/uploader.js";
import passport from "passport";
import { soloAdmin, soloUser, soloDev } from "../middlewares/auth.middleware.js";

const ROUTER = Router();
const productController = new ProductController();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", productController.getProducts);
ROUTER.post("/",  permissions, soloUser, uploadProducts.single('image'), productController.createProduct);
ROUTER.get("/:id", productController.getProductById);
ROUTER.delete("/:id", permissions, soloAdmin, productController.deleteProductById);
ROUTER.patch("/:id",  permissions, soloAdmin, uploadProducts.single('image'), productController.updateProduct);
ROUTER.put("/available/:id", permissions, soloAdmin, productController.toggleAvailability);

export default ROUTER;