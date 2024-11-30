import ProductDao from "../dao/product.dao.js";
import fs from "fs";
import path from "path";

const productDao = new ProductDao();

export default class ProductController {

    getProducts = async(req, res) => {
        try {
            const products = await productDao.getProducts();
            return res.status(200).json({ products });
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener los productos", error: error.message });
        }
    }

    getProductById = async(req, res) => {
        try {
            const { id } = req.params;
            const product = await productDao.getProductById(id);
            if(!product) return res.status(404).json({ message: "Producto no encontrado" });
            return res.status(200).json({ product });
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener el producto", error: error.message });
        }
    }

    createProduct = async (req, res) => {
        try {
            const { title, category, brand, model, filter, specifications, price, stock, description } = req.body;
            const { filename } = req.file || {};
            if (!filename) return res.status(400).json({ message: "No se subió ninguna imagen" });
            const newImagePath = `/products/${filename}`;
            const newProductData = { image: newImagePath, title, category, brand, model, filter, specifications, price, stock, description };
            const product = await productDao.createProduct(newProductData);
            return res.status(201).json({ message: "Producto creado con éxito", product });
        } catch (error) {
            if (req.file && req.file.filename) {
                const uploadedImagePath = path.join(process.cwd(), "src/public/products", req.file.filename);
                if (fs.existsSync(uploadedImagePath)) {
                    fs.unlinkSync(uploadedImagePath);
                    console.log("Imagen eliminada debido a un error:", uploadedImagePath);
                }
            }
            return res.status(500).json({ message: "Error al registrar el producto", error: error.message });
        }
    };
    
    deleteProductById = async (req, res) => {
        try {
            const { id } = req.params;
            const product = await productDao.getProductById(id);
            if (!product) return res.status(404).json({ message: "Producto no encontrado" });
            const imagePath = path.join(process.cwd(), "src/public", product.image);
            console.log("Ruta de la imagen a eliminar:", imagePath);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log("Imagen eliminada correctamente:", imagePath);
            } else {
                console.log("La imagen no existe:", imagePath);
            }
            await productDao.deleteProductById(id);
            return res.status(200).json({ message: "Producto eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    };

    updateProduct = async (req, res) => {
        try {
            const { title, category, brand, model, filter, specifications, price, stock, description } = req.body;
            const { id } = req.params;
            const product = await productDao.getProductById(id);
            if (!product) return res.status(404).json({ message: "Producto no encontrado" });
            if (product.image) {
                const oldImagePath = path.join(process.cwd(), "src/public", product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log("Imagen anterior eliminada correctamente:", oldImagePath);
                } else {
                    console.log("La imagen anterior no existe:", oldImagePath);
                }
            }
            const { filename } = req.file || {};
            if (!filename) return res.status(400).json({ message: "No se subió ninguna imagen" });
            const newImagePath = `/products/${filename}`;
            const updateData = { title, category, brand, model, filter, specifications, price, stock, description, image: newImagePath };
            const updatedProduct = await productDao.updateProductById(id, updateData);
            return res.status(200).json({ message: "Producto actualizado con éxito", updatedProduct });
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            if (req.file && req.file.filename) {
                const uploadedImagePath = path.join(process.cwd(), "src/public/products", req.file.filename);
                if (fs.existsSync(uploadedImagePath)) {
                    fs.unlinkSync(uploadedImagePath);
                    console.log("Nueva imagen eliminada debido a un error:", uploadedImagePath);
                }
            }
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    };
}