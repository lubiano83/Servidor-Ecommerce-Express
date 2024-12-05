import ProductModel from "../models/product.model.js";
import { connectDB, isValidId } from "../config/mongoose.config.js";

export default class ProductDao {

    constructor() {
        connectDB(); // Intentamos conectar a la base de datos
    }
    
    getProducts = async (paramFilters = {}) => {
        try {
            const $and = [];
            if (paramFilters.category) $and.push({ category: paramFilters.category });
            if (paramFilters.title) $and.push({ title: paramFilters.title });
            if (paramFilters.code) $and.push({ code: paramFilters.code });
            if (paramFilters.available) $and.push({ available: paramFilters.available });
            const filters = $and.length > 0 ? { $and } : {};
            let sort = {};
            if (paramFilters.sort) sort.price = paramFilters.sort === "asc" ? 1 : -1;
            const limit = paramFilters.limit ? parseInt(paramFilters.limit) : 10;
            const page = paramFilters.page ? parseInt(paramFilters.page) : 1;
            const productsFound = await ProductModel.paginate(filters, { limit: limit, page: page, sort: sort, lean: true, pagination: true });
            productsFound.docs = productsFound.docs.map(({ id, ...productWithoutId }) => productWithoutId);
            return productsFound;
        } catch (error) {
            throw new Error("Hubo un error al obtener los productos.." + error.message );
        }
    };    

    getProductById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            return await ProductModel.findOne({ _id: id });
        } catch (error) {
            throw new Error( "Error al obtener el producto por el id: " + error.message );
        }
    }

    getProductByTitle = async(title) => {
        try {
            return await ProductModel.findOne({ title });
        } catch (error) {
            throw new Error( "Error al obtener el producto por el titulo: " + error.message );
        }
    }

    createProduct = async( productData ) => {
        try {
            const product = await ProductModel( productData );
            await product.save()
            return product;
        } catch (error) {
            throw new Error( "Error al crear un producto: " + error.message );
        }
    }

    updateProductById = async( id, doc ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            const product = await this.getProductById(id);
            if(!product) throw new Error("Producto no encontrado");
            return await ProductModel.findByIdAndUpdate(id, { $set: doc }, { new: true });
        } catch (error) {
            throw new Error(`Error al actualizar un producto por el id: ${error.message}`);
        }
    }

    deleteProductById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            const product = await this.getProductById(id);
            if(!product) throw new Error("Producto no encontrado");
            return await ProductModel.findByIdAndDelete( id );
        } catch (error) {
            throw new Error("Error al eliminar un producto por el id: " + error.message);
        }
    }

    paginate = async(filters, { limit, page, sort }) =>  {
        try {
            return await ProductModel.paginate(filters, { limit: limit, page: page, sort: sort, lean: true, pagination: true });
        } catch (error) {
            throw new Error("Error al obtener los datos: " + error.message);
        }
    }

    explain = async(filters) => {
        try {
            return await ProductModel.find(filters).explain();
        } catch (error) {
            throw new Error("Error al obtener los datos: " + error.message);
        }
    }
}