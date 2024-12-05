import mongoose from "mongoose";

const collection = "carts";

const cartItemSchema = new mongoose.Schema({
    detail: { // Referencia al producto por su `_id`
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    requestedQuantity: {
        type: Number,
        required: true,
    },
    _id: false, // Evita que se genere un `_id` adicional para cada elemento
});

const cartSchema = new mongoose.Schema({
    products: [cartItemSchema],
});

// Configurar el `populate` automáticamente antes de realizar cualquier consulta
cartSchema.pre(/^find/, function (next) {
    this.populate({
        path: "products.detail", // Popula `detail` dentro de `products`
        model: "products",
    });
    next();
});

const CartModel = mongoose.models[collection] || mongoose.model(collection, cartSchema);
export default CartModel;