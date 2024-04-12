const { ObjectId } =require('mongodb')
const mongoose=require('mongoose')

const couponSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    code:{
        type:String,
        required:true,
    },
    percentageDiscount:{
        type:Number,
        required:true
    },
    minimumAmount:{
        type:Number,
        required:true

    },
    createdOn:{
        type:Date,
        default:Date.now
    },
    expiryDate:{
        type:Date,
        required:true,
    },
    used_coupons:
    [{ 
        userId: {
            type: ObjectId,
            ref: "User",
          },
        }
    ]
})

const Coupon=mongoose.model('Coupon',couponSchema)

module.exports=Coupon;