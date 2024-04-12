
const {ObjectId}=require('mongodb')
const mongoose=require('mongoose')

const wishlistSchema=new mongoose.Schema({
    product_id:{
        type:ObjectId,
        required:true
    },
    productName:{
        type: String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    user_id:{
        type:ObjectId,
        default:null,
    }
})
module.exports=mongoose.model('wishlist',wishlistSchema)