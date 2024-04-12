const Cart =require('../Models/cartModel')
const address=require('../Models/addressModel')
const product=require('../Models/ProductModel')
const category=require('../Models/categoryModel')
const user=require('../Models/userModel')

const { json } = require('body-parser')
const Coupon = require('../Models/couponModel')

// to render the addcoupon page
const loadAddCoupon=async(req,res)=>{
    try {
        res.render('addCoupon')
    } catch (error) {
        console.error('error in LoadAddCoupon',error.message)
        res.status(500).send('internal Server Error')
        
    }
}

// add a new coupon

const addCoupon=async(req,res)=>{
    try {
        const {name,couponCode,percentageDiscount,minimumAmount,expiryDate}=req.body
        const user=req.session.user_id;
        const couponData= await Coupon.find({code:couponCode})
        if(couponData.length===0){
            const coupon= await new Coupon({
                name,
                code: couponCode,
                percentageDiscount,
                minimumAmount,
                createdOn: Date.now(),
                expiryDate,
                user,
            })
            await coupon.save()
            res.redirect('/admin/listCoupon');
        }
        else{
            res.render('addCoupon',{message:'this coupon already exist'});
    }
  } catch (error) {
        res.status(500).send('internal server error')
    }
}

const listCoupon=async(req,res)=>{
    try {
        const coupon =await Coupon.find()
        res.render('couponManagement',{coupon})
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
}

const loadEditCoupon=async(req,res)=>{
    try {
        const id=req.query.id
        const coupon=await Coupon.findById(id)
        if(!coupon){
            return res.status(400).send('coupon not found')
        }
        res.render('editCoupon',{coupon})

    } catch (error) {
        console.error('error in load edit coupon',error.message);
        res.status(500).send('internal server error')
        
    }
}
const editCoupon=async(req,res)=>{
    try{ 
    const {name,couponCode,percentageDiscount,minimumAmount,expiryDate}=req.body
    const coupon =await Coupon.find()
    const couponData= await Coupon.findByIdAndUpdate(
        { _id:req.body._id },
        {
            $set:{
                name,
                code:couponCode,
                percentageDiscount,
                minimumAmount,
                createdOn:Date.now(),
                expiryDate,

            },
        
        },
    )
    if(couponData){
        res.render('couponManagement',{coupon})//here 
    }
}catch(error){
        console.error('errror in the edit coupon',error.message);
        res.status(500).send('internal server error')
    }
}
// DELETE COUPON
const deleteCoupon=async(req,res)=>{
    try{ 
    const id=req.query.id
    await Coupon.deleteOne({_id:id})
    res.status(200).json('coupon got deleted')
}catch(error){
    console.error('error in the deletecoupon',error.message);
    res.status(500).send('internal server Error')
}
}

// admin side add coupon

const addCouponCode=async(req,res)=>{
    try {

        const {subtotal,couponCode}=req.body
        const numericSubtotal= parseFloat(subtotal.replace(/[$,]/g,''))
        const userId=req.session.user_id

        req.session.couponCode=couponCode;
        const validCoupon=await Coupon.findOne({code:couponCode})
console.log(validCoupon);
        if(validCoupon){
            if(
                validCoupon.minimumAmount&&numericSubtotal>validCoupon.minimumAmount
            ){
                const userUsedCoupon=validCoupon.used_coupons.some((usedCoupon)=>
                usedCoupon.userId.equals(userId))
                
                if(userUsedCoupon){

                    res.status(400).json({
                        success:false,
                        message:'this coupon is already used'
                    })
                }
                else{
                    if(validCoupon.percentageDiscount){
                        const discountAmount=(numericSubtotal*validCoupon.percentageDiscount)/100
                        res.status(400).json({
                            success:true,
                            message:'the coupon is valid',
                            discountAmount
                        })
                    }
                    else{
                        res.status(200).json({
                            success:true,
                            message:'coupon is vlaid',
                            discountAmount:validCoupon.offerPrice,
                        })
                    }
                }
              } else {
                res.status(400).json({
                  success: false,
                  message: `minium amount ${validCoupon.minimumAmount}`,
                });
              }
            } else {
              res.status(400).json({
                success: false,
                message: "Invalid Coupon",
              });
            }
          } catch (error) {
            console.error("Error in addCouponCode:", error.message);
            res.status(500).json({
              success: false,
              message: "Internal Server Error",
            });
          }
        };

// remove coupon
const removeCoupon=async (req,res)=>{
    try {
        const couponCode=req.session.couponCode
        const validCoupon=await Coupon.findOne({code:couponCode})

    res
      .status(200)
      .json({ success: true, discountAmount: validCoupon.percentageDiscount });
  } catch (error) {
    console.error("Error in removeCoupon:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports={
    addCouponCode,
    editCoupon,
    loadEditCoupon,
    listCoupon,
    addCoupon,
    loadAddCoupon,
    removeCoupon,
    deleteCoupon
    

}

