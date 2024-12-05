import CartDao from "../dao/cart.dao.js";
import ProductDao from "../dao/product.dao.js";
import TicketDao from "../dao/ticket.dao.js";

const cartDao = new CartDao();
const productDao = new ProductDao();

export default class CartController {
    getCarts = async(req, res) => {
        try {
            const carts = await cartDao.getCarts();
            return res.status(200).send({ carts });
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener los carritos", error: error.message });
        }
    }

    getCartById = async(req, res) => {
        try {
            const { id } = req.params;
            const cart = await cartDao.getCartById( id );
            if(!cart) return res.status(404).send({ message: "Carrito no encontrado" });
            return res.status(200).json({ cart });
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener el carrtio", error: error.message });
        }
    }

    createCart = async(req, res) => {
        try {
            const products = [];
            await cartDao.createCart( products );
            return res.status(200).json({ message: "Carrito creado correctamnete" });
        } catch (error) {
            return res.status(500).json({ message: "Error al registrar el producto", error: error.message });
        }
    }

    deleteCardById = async(req, res) => {
        try {
            const { id } = req.params;
            const cart = await cartDao.getCartById( id );
            if(!cart) return res.status(404).send({ message: "Carrito no encontrado" });
            await cartDao.deleteCartById( id );
            return res.status(200).json({ message: "Carrito eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    }

    updateCartById = async (req, res) => {
        try {
            const { id } = req.params;
            const { products } = req.body;
            if (!Array.isArray(products)) return res.status(400).json({ message: "El campo 'products' debe ser un array" });
            const updatedCart = await cartDao.updateCartById(id, products);
            return res.status(200).json({ message: "Carrito actualizado con éxito", updatedCart });
        } catch (error) {
            return res.status(500).json({
                message: "Error al actualizar el carrito",
                error: error.message
            });
        }
    };
    
    addProductToCart = async (req, res) => {
        try {
            const { pid } = req.params;
            const cid = req.user?.cart;
            if (!pid || !cid) return res.status(400).json({ message: "Faltan parámetros obligatorios" });
            const cart = await cartDao.getCartById(cid);
            if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
            const product = await productDao.getProductById(pid);
            if (!product) return res.status(404).json({ message: "Producto no encontrado" });
            const existingProductIndex = cart.products.findIndex(item => item.detail._id.toString() === pid.toString());
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].requestedQuantity += 1;
            } else {
                cart.products.push({ detail: pid, requestedQuantity: 1 });
            }
            const addProduct = await cartDao.updateCartById(cid, cart.products);
            return res.status(200).json({ message: "Producto agregado al carrito con éxito", cart: addProduct });
        } catch (error) {
            return res.status(500).json({ message: "Error al agregar el producto al carrito", error: error.message });
        }
    };

    clearCart = async(req, res) => {
        try {
            const { id } = req.params;
            const products = []
            if(!id) return res.status(400).send({ message: "El id es obligatorio" });
            const cart = await cartDao.getCartById(id)
            if(!cart) return res.status().send({ message: "Ese carrito no existe" });
            const clearCart = await cartDao.updateCartById( id, products );
            return res.status(200).send({ message: "El carrito ya esta limpio", clearCart });
        } catch (error) {
            return res.status(500).json({ message: "Error al limpier el carrito", error: error.message });
        }
    }

    deleteProductFromCart = async(req, res) => {
        try {
            const { cid, pid } = req.params;
            if (!pid || !cid) return res.status(400).json({ message: "Faltan parámetros obligatorios" });
            const cart = await cartDao.getCartById(cid)
            if(!cart) return res.send({ message: "El carrito no existe" });
            const product = await productDao.getProductById(pid)
            if(!product) return res.send({ message: "El producto no existe" });
            const existingProductIndex = cart.products.findIndex(item => item.detail._id.toString() === pid.toString());
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].requestedQuantity -= 1;
                if (cart.products[existingProductIndex].requestedQuantity < 1) {
                    cart.products.splice(existingProductIndex, 1);
                }
            }
            const finalCart = await cartDao.updateCartById(cid, cart.products);
            return res.status(200).json({ message: "Producto agregado al carrito con éxito", cart: finalCart });
        } catch (error) {
            return res.status(500).json({ message: "Error al rebajar un producto en el carrito", error: error.message });
        }
    }

    completePurchase = async(req, res) => {
        try {
            const cartId = req.user?.cart;
            const userId = req.user?.id;
            const cart = await cartDao.getCartById(cartId);
            if(!cart) return res.status(400).send({ message: "El carrito no existe" });
        } catch (error) {
            return res.status(500).json({ message: "Error al realizar la compra", error: error.message });
        }
    }
};