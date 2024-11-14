import mongoose from "mongoose";

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

const TickeModel = mongoose.model("tickets", ticketSchema);
export default TickeModel;