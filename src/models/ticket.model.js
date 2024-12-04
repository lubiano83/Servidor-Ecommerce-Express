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
        ref: "users",
        required: true,
    },
});

const TicketModel = mongoose.models[collection] || mongoose.model(collection, ticketSchema);
export default TicketModel;