import { Router } from "express";
import ProductController from "../controllers/products.controller.js";
import { uploadProducts } from "../utils/uploader.js";

const ROUTER = Router();
const productController = new ProductController();

ROUTER.get("/", productController.getProducts);
ROUTER.post("/", uploadProducts.single('image'), productController.createProduct);
ROUTER.get("/:id", productController.getProductById);
ROUTER.delete("/:id", productController.deleteProductById);
ROUTER.patch("/:id", uploadProducts.single('image'), productController.updateProduct);

export default ROUTER;