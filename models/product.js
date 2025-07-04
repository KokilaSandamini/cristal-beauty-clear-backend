import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productID : {
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    altNames:{
        type:[String],
        default:[]
    },
    price:{
        type:Number,
        required:true
    },
    labeledPrice:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    images:{
        type:[String],
        required:true,
        default:["https://encrypted-tbn0.gstaic.com/images?q=tbn:ANd9GcQyrVHW3ETfRAAtf780OQqLRYM6inchgfNgQg&s"]
    },
    stock:{
        type:Number,
        required:true
    }
})

const Product = mongoose.model("products",productSchema)
export default Product;