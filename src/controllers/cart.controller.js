import CartDao from "../dao/cart.dao.js";
import ProductDao from "../dao/product.dao.js";

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
            const { pid } = req.params; // ID del producto
            const cid = req.user.cart; // ID del carrito asociado al usuario
    
            // Validar los IDs
            if (!pid || !cid) {
                return res.status(400).json({ message: "Faltan parámetros obligatorios" });
            }
    
            // Obtener el carrito y el producto
            const cart = await cartDao.getCartById(cid);
            if (!cart) {
                return res.status(404).json({ message: "Carrito no encontrado" });
            }
    
            const product = await productDao.getProductById(pid);
            if (!product) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }
    
            // Verificar si el producto ya está en el carrito
            const existingProduct = cart.products.find(
                (item) => item.id.toString() === pid
            );
    
            if (existingProduct) {
                // Incrementar la cantidad del producto existente
                existingProduct.quantity += 1;
            } else {
                // Agregar el producto al carrito
                cart.products.push({ id: pid, quantity: 1 });
            }
    
            // Actualizar el carrito
            const updatedCart = await cartDao.updateCartById(cid, cart.products);
    
            // Obtener el carrito actualizado con productos populados
            const populatedCart = await cartDao.getCartById(cid);
    
            return res.status(200).json({
                message: "Producto agregado al carrito con éxito",
                cart: populatedCart,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Error al agregar el producto al carrito",
                error: error.message,
            });
        }
    };    
};