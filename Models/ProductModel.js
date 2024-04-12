const { ObjectId } = require("mongodb");
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:ObjectId,
        required:true
    },
    regularPrice:{
        type:String,
        required:true
    },
    salePrice:{
        type:String,
        required:true
    },
    createdOn:{
        type:Date,
        default:Date.now
    },
    quantity:{
        type:Number,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    productOffer:{
        type:Number,
        default:0
    },
})
module.exports = mongoose.model("products",productSchema)