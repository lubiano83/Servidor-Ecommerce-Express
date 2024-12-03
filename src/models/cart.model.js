import mongoose from "mongoose";

const collection = "carts";

const cartItemSchema = new mongoose.Schema({
    product: { // Referencia al producto por su `_id`
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    _id: false, // Evita que se genere un `_id` adicional para cada elemento
});

const cartSchema = new mongoose.Schema({
    products: [cartItemSchema],
});

// Configurar el `populate` correctamente
cartSchema.pre(/^find/, function (next) {
    this.populate({
        path: "products.product", // Popula `product` en lugar de `id`
        model: "products",
    });
    next();
});

const CartModel = mongoose.models[collection] || mongoose.model(collection, cartSchema);
export default CartModel;