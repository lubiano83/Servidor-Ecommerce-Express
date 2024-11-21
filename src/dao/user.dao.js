import UserModel from "../models/user.model.js";
import CartModel  from "../models/cart.model.js";
import { isValidId, connectDB } from "../config/mongoose.config.js";

export default class UserDao {

    constructor() {
        // Intentamos conectar a la base de datos
        connectDB();
    }
    
    getUsers = async() => {
        try {
            return await UserModel.find();
        } catch (error) {
            console.log(error.message);
            throw new Error({ message: "Error al obtener los usuarios en el dao", error: error.message });
        }
    };

    getUserById = async(id) => {
        if (!isValidId(id)) {
            return "ID no válido";
        }
        try {
            return await UserModel.findOne({ _id: id });
        } catch (error) {
            console.log(error.message);
            throw new Error( "Error al obtener el usuario por el id: " + error.message );
        }
    }

    findUserByEmail = async( email ) => {
        try {
            return await UserModel.findOne({ email: email });
        } catch (error) {
            console.log(error.message);
            throw new Error( "Error al obtener el usuario por el email: " + error.message );
        }
    };

    createUser = async( userData ) => {
        try {
            const user = await UserModel( userData );
            await user.save();
            return user;
        } catch (error) {
            console.log(error.message);
            throw new Error( "Error al crear un usuario: " + error.message );
        }
    }

    updateUserById = async(id, doc) => {
        if (!isValidId(id)) {
            throw new Error("ID no válido");
        }
        try {
            const user = await UserModel.findById(id);
            if (!user) throw new Error("Usuario no encontrado");
            
            return await UserModel.findByIdAndUpdate(id, { $set: doc }, { new: true });
        } catch (error) {
            console.log(error.message);
            throw new Error(`Error al actualizar un usuario por el id: ${error.message}`);
        }
    };    

    deleteUserById = async (id) => {
        if (!isValidId(id)) {
            return { status: 400, message: "ID no válido" };
        }
        try {
            const user = await UserModel.findById(id);
            if (!user) return { status: 404, message: "Usuario no encontrado" };
            const cartId = user.cart.toString();
            await UserModel.findOneAndDelete({ _id: id }) && await CartModel.findOneAndDelete({ _id: cartId });
            return { status: 200, message: "Usuario y carrito eliminados exitosamente" };
        } catch (error) {
            console.log(error.message);
            throw new Error("Error al eliminar un usuario y su carrito: " + error.message);
        }
    };
    
}