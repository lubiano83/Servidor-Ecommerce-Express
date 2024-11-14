import SessionModel from "../models/session.model.js";
import { isValidId, connectDB } from "../config/mongoose.config.js";

export default class UserDao {

    constructor() {
        connectDB();
    }

    getSessions = async () => {
        try {
            return await SessionModel.find();
        } catch (error) {
            throw new Error( "Error al obtener las sessions " + error.message );
        }
    };
    
    createSession = async (id, token) => {
        if (!isValidId(id)) {
            return "ID no válido";
        }
        try {
            const session = await SessionModel({ id, token });
            await session.save();
            return session;
        } catch (error) {
            throw new Error( "Error al crear una session " + error.message );
        }
    };

    deleteSession = async (token) => {
        try {
            const session = await SessionModel.findOneAndDelete({ token });
            if (!session) {
                return { status: 404, message: "Sesión no encontrada" };
            }
            return { status: 200, message: "Sesión eliminada de la base de datos" };
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            return { status: 500, message: "Error al eliminar la sesión", error: error.message };
        }
    };

    getUserToken = async(token) => {
        try {
            const user = await SessionModel.findOne({ token });
            const userToken = user.token
            return userToken;
        } catch (error) {
            console.error("Error al obtener el token ", error);
            return { status: 500, message: "Error al obtener el token", error: error.message };
        }
    };
}