import mongoose from 'mongoose';

const collection = 'users';

const usersSchema = new mongoose.Schema({
    images: {
        type: String,
        required: false,
        default: "",
    },
    first_name:{
        type: String,
        required:true,
        trim: true,
    },
    last_name:{
        type:String,
        required:true,
        trim: true,
    },
    email:{
        type:String,
        required:true,
        trim: true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    role: {
        type: String,
        enum: [ "admin", "user", "developer" ],
        default: "user",
    },
    address: {
        region: {
            type: String,
            required: false,
            lowercase: true,
            default: "",
        },
        city: {
            type: String,
            required: false,
            lowercase: true,
            default: "",
        },
        street: {
            type: String,
            required: false,
            lowercase: true,
            default: "",
        },
        number: {
            type: String,
            required: false,
            lowercase: true,
            default: "",
        }
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts",
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
        default: "",
    },        
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
})

const UserModel = mongoose.models[collection] || mongoose.model(collection, usersSchema);
export default UserModel;