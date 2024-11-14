import ProductModel from "../models/product.model.js";
import { connectDB, isValidId } from "../config/mongoose.config.js";

export default class ProductDao {

    constructor() {
        // Intentamos conectar a la base de datos
        connectDB();
    }
    
    getProducts = async( params ) => {
        return await ProductModel.find( params );
    }

    getProductById = async( id ) => {
        if (!isValidId(id)) {
            return "ID no válido";
        }
        return await ProductModel.findOne( id );
    }

    createProduct = async( doc ) => {
        return await ProductModel.save( doc );
    }

    updateProductById = async( id, doc ) => {
        if (!isValidId(id)) {
            return "ID no válido";
        }
        return await ProductModel.findByIdAndUpdate( id, { $set: doc } )
    }

    deleteProductById = async( id ) => {
        if (!isValidId(id)) {
            return "ID no válido";
        }
        return await ProductModel.findByIdAndDelete( id );
    }
}