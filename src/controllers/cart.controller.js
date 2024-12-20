import CartDao from "../dao/cart.dao.js";
import ProductDao from "../dao/product.dao.js";
import TicketDao from "../dao/ticket.dao.js";
import UserDao from "../dao/user.dao.js";

const cartDao = new CartDao();
const productDao = new ProductDao();
const ticketDao = new TicketDao();

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
            const id = req.user.cart;
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

    updateCartById = async(req, res) => {
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
    
    addProductToCart = async(req, res) => {
        try {
            const { pid } = req.params;
            const cid = req.user?.cart;
            if (!pid || !cid) return res.status(400).json({ message: "Faltan parámetros obligatorios" });
            const cart = await cartDao.getCartById(cid);
            if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
            const product = await productDao.getProductById(pid);
            if (!product) return res.status(404).json({ message: "Producto no encontrado" });
            if (product.available === false) return res.status(400).json({ message: "Ese producto no está disponible para agregarlo al carrito" });
            if (product.stock.quantity <= 0) return res.status(400).json({ message: "El producto no tiene stock disponible" });
            const existingProductIndex = cart.products.findIndex((item) => item.detail._id.toString() === pid.toString());
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].requestedQuantity += 1;
            } else {
                cart.products.push({ detail: pid, requestedQuantity: 1 });
            }
            const addProduct = await cartDao.updateCartById(cid, cart.products);
            return res.status(200).json({ message: "Producto agregado al carrito con éxito", addProduct });
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
            return res.status(500).json({ message: "Error al limpiar el carrito", error: error.message });
        }
    }

    deleteProductFromCart = async(req, res) => {
        try {
            const cid = req.user.cart
            const { pid } = req.params;
            if (!pid || !cid) return res.status(400).json({ message: "Faltan parámetros obligatorios" });
            const cart = await cartDao.getCartById(cid);
            if(!cart) return res.send({ message: "El carrito no existe" });
            const product = await productDao.getProductById(pid);
            if(!product) return res.send({ message: "El producto no existe" });
            const existingProductIndex = cart.products.findIndex(item => item.detail._id.toString() === pid.toString());
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].requestedQuantity -= 1;
                if (cart.products[existingProductIndex].requestedQuantity < 1) {
                    cart.products.splice(existingProductIndex, 1);
                }
            }
            const deleteProduct = await cartDao.updateCartById(cid, cart.products);
            return res.status(200).json({ message: "Producto eliminado del carrito con éxito", deleteProduct });
        } catch (error) {
            return res.status(500).json({ message: "Error al rebajar un producto del carrito", error: error.message });
        }
    }

    completePurchase = async(req, res) => {
        try {
            const cartId = req.user.cart;
            const userId = req.user.id;
            const cart = await cartDao.getCartById(cartId);
            if (!cart || cart.products.length === 0) return res.status(400).json({ message: "El carrito está vacío o no existe." });
            let total = 0;
            const productsPartialSold = [];
            const remainingProducts = [];
            for (const product of cart.products) {
                let productId;
                if (typeof product.detail === "object" && product.detail._id) {
                    productId = product.detail._id;
                } else if (typeof product.detail === "string") {
                    productId = product.detail;
                } else {
                    return res.status(400).json({
                        message: `ID no válido para el producto: ${JSON.stringify(product.detail)}`,
                    });
                }
                const productDetails = await productDao.getProductById(productId);
                if (!productDetails) {
                    return res.status(404).json({
                        message: `Producto con ID ${productId} no encontrado.`,
                    });
                }
                const stockAvailable = productDetails.stock.quantity;
                const quantityRequested = product.requestedQuantity;
                if (quantityRequested > stockAvailable) {
                    total += productDetails.price * stockAvailable;
                    productsPartialSold.push({
                        productId: productDetails.id,
                        title: productDetails.title,
                        requestedQuantity: quantityRequested,
                        soldQuantity: stockAvailable,
                        remainingQuantity: quantityRequested - stockAvailable,
                    });
                    remainingProducts.push({
                        detail: productDetails.id,
                        requestedQuantity: quantityRequested - stockAvailable,
                    });
                    await productDao.updateProductById(productDetails.id, {
                        stock: { quantity: 0 },
                    });
                } else {
                    total += productDetails.price * quantityRequested;
                    const stockToUpdate = stockAvailable - quantityRequested;
                    await productDao.updateProductById(productDetails.id, {
                        stock: { quantity: stockToUpdate },
                    });
                }
            }
            if (remainingProducts.length > 0) {
                await cartDao.updateCartById(cartId, remainingProducts);
            } else {
                await cartDao.updateCartById(cartId, []);
            }
            const ticketData = { amount: total, purchaser: userId };
            const createdTicket = await ticketDao.createTicket(ticketData);
            const ticket = await ticketDao.getTicketById(createdTicket.id);
            const ticketInfo = {
                message: "Compra completada con éxito",
                totalAmount: total,
                partiallySoldProducts: productsPartialSold,
                cart: remainingProducts.length > 0 ? remainingProducts : [],
                ticket,
            };
            return res.status(200).json(ticketInfo);
        } catch (error) {
            return res.status(500).json({ message: "Error al realizar la compra", error: error.message });
        }
    };    
}