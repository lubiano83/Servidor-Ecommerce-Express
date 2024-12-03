import mongoose from "mongoose";

const collection = "carts";

const cartItemSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    _id: false, // Esto para que no aparezca el _id.
});

const cartSchema = new mongoose.Schema({
    products: [cartItemSchema],
});

cartSchema.pre(/^find/, function (next) {
    this.populate({
        path: "products.id",
        model: "products",
    });
    next();
});

const CartModel = mongoose.models[collection] || mongoose.model(collection, cartSchema);
export default CartModel;