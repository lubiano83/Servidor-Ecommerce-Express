import mongoose from "mongoose";

const collection = 'sessions';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
});

const SessionModel = mongoose.models[collection] || mongoose.model(collection, sessionSchema);
export default SessionModel;