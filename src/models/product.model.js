import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const collection = "products";

const productSchema = new mongoose.Schema({
    images: {
        type: [String],
        required: false,
        default: [],
    },
    title: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: { name: "idx_title" },
    },
    category: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: { name: "idx_category" },
    },
    brand: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    model: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    filter: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    stock: {
        quantity: {
            type: Number,
            required: true,
        },
        units: {
            type: String,
            enum: ["units", "package"],
            default: "units",
        },
        minSafeQuantity: {
            type: Number,
            required: true,
        }
    },
    available: {
        type: Boolean,
        default: true,
        index: { name: "idx_available" },
    },
    description: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    tags: {
        type: [String],
        required: false,
        lowercase: true,
        trim: true,
        default: [],
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Configuración de índices
productSchema.index({ category: 1, title: 1 }, { name: "idx_category_title" });
productSchema.plugin(paginate);

const ProductModel = mongoose.models[collection] || mongoose.model(collection, productSchema);
export default ProductModel;