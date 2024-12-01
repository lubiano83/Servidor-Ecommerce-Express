import CartModel from "../models/cart.model.js";
import { isValidId, connectDB } from "../config/mongoose.config.js";

export default class CartDao {

    constructor() {
        // Intentamos conectar a la base de datos
        connectDB();
    }
    
    getCarts = async() => {
        try {
            return await CartModel.find();
        } catch (error) {
            throw new Error({ message: "Error al obtener los carritos en el dao", error: error.message });
        }
    }

    getCartById = async( id ) => {
        try {
            if (!isValidId(id)) {
                throw new Error("ID no válido");
            }
            return await CartModel.findOne({ _id: id });
        } catch (error) {
            throw new Error( "Error al obtener el carrito por el id: " + error.message );
        }
    }

    createCart = async( cartData ) => {
        try {
            const cart = await CartModel( cartData );
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error( "Error al crear un carrito: " + error.message );
        }
    }

    updateCartById = async( id, doc ) => {
        try {
            if (!isValidId(id)) {
                throw new Error("ID no válido");
            }
            const cart = await CartModel.findById( id );
            if(!cart) throw new Error("Carrito no encontrado");
            return await CartModel.findByIdAndUpdate(id, { $set: doc }, { new: true });
        } catch (error) {
            throw new Error(`Error al actualizar el carrito por el id: ${error.message}`);
        }
    }

    deleteCartById = async( id ) => {
        try {
            if (!isValidId(id)) {
                throw new Error("ID no válido");
            }
            const cart = await CartModel.findById( id );
            if(!cart) throw new Error("Carrito no encontrado");
            return await CartModel.findByIdAndDelete( id );
        } catch (error) {
            throw new Error("Error al eliminar un carrito por el id: " + error.message);
        }
    }
}