import mongoose from "mongoose";

const collection = 'tickets';

const ticketSchema = new mongoose.Schema({
    purchaseDatetime: {
        type: Date,
        default: Date.now,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    purchaser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // Asegúrate de que el modelo "users" esté registrado en tu proyecto
        required: true,
    },
});

// Configurar el `populate` automáticamente antes de realizar cualquier consulta
ticketSchema.pre(/^find/, function (next) {
    this.populate({
        path: "purchaser", // Popula la información completa del usuario
        model: "users", // Nombre del modelo referenciado
    });
    next();
});

const TicketModel = mongoose.models[collection] || mongoose.model(collection, ticketSchema);
export default TicketModel;