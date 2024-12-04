import TicketModel from "../models/ticket.model.js";
import { isValidId, connectDB } from "../config/mongoose.config.js";

export default class TicketDao {

    constructor() {
        connectDB(); // Intentamos conectar a la base de datos
    }

    getTickets = async() => {
        try {
            return await TicketModel.find();
        } catch (error) {
            throw new Error({ message: "Error al obtener los tickets en el dao", error: error.message });
        }
    };

    getTicketById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            return await TicketModel.findOne({ _id: id });
        } catch (error) {
            throw new Error( "Error al obtener el ticket por el id: " + error.message );
        }
    }

    createTicket = async( ticketData ) => {
        try {
            const ticket = await TicketModel( ticketData );
            await ticket.save();
            return ticket;
        } catch (error) {
            throw new Error( "Error al crear un usuario: " + error.message );
        }
    }

    updateTicketById = async( id, doc ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            const ticket = await TicketModel.findById(id);
            if (!ticket) throw new Error("Usuario no encontrado");
            return await TicketModel.findByIdAndUpdate(id, { $set: doc }, { new: true });
        } catch (error) {
            throw new Error(`Error al actualizar un usuario por el id: ${error.message}`);
        }
    };

    deleteTicketById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            const ticket = await TicketModel.findById(id);
            if (!ticket) return new Error("Usuario no encontrado");
            await TicketModel.findOneAndDelete({ _id: id })
            return { status: 200, message: "Usuario y carrito eliminados exitosamente" };
        } catch (error) {
            throw new Error("Error al eliminar un usuario y su carrito: " + error.message);
        }
    };
}