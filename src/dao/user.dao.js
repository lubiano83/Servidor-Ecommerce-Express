import UserModel from "../models/user.model.js";
import CartModel  from "../models/cart.model.js";
import { isValidId, connectDB } from "../config/mongoose.config.js";

export default class UserDao {

    constructor() {
        connectDB(); // Intentamos conectar a la base de datos
    }
    
    getUsers = async() => {
        try {
            return await UserModel.find();
        } catch (error) {
            throw new Error({ message: "Error al obtener los usuarios en el dao", error: error.message });
        }
    };

    getUserById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            return await UserModel.findOne({ _id: id });
        } catch (error) {
            throw new Error( "Error al obtener el usuario por el id: " + error.message );
        }
    }

    findUserByEmail = async( email ) => {
        try {
            return await UserModel.findOne({ email: email });
        } catch (error) {
            throw new Error( "Error al obtener el usuario por el email: " + error.message );
        }
    };

    createUser = async( userData ) => {
        try {
            const user = await UserModel( userData );
            await user.save();
            return user;
        } catch (error) {
            throw new Error( "Error al crear un usuario: " + error.message );
        }
    }

    updateUserById = async( id, doc ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            const user = await this.getUserById(id);
            if (!user) throw new Error("Usuario no encontrado");
            return await UserModel.findByIdAndUpdate(id, { $set: doc }, { new: true });
        } catch (error) {
            throw new Error(`Error al actualizar un usuario por el id: ${error.message}`);
        }
    };    

    deleteUserById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            const user = await this.getUserById(id);
            if (!user) return new Error("Usuario no encontrado");
            const cartId = user.cart.toString();
            return await UserModel.findOneAndDelete({ _id: id }) && await CartModel.findOneAndDelete({ _id: cartId });
        } catch (error) {
            throw new Error("Error al eliminar un usuario y su carrito: " + error.message);
        }
    };
}