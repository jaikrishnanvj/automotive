const Cart =require('../Models/cartModel')
const address=require('../Models/addressModel')
const product=require('../Models/ProductModel')
const category=require('../Models/categoryModel')
const user=require('../Models/userModel')
const Coupon=require('../Models/couponModel')


// const { cart } = require('./userControllers')


// load cart--------------------
// const loadCart=async(req,res)=>{
//     try {
//         const loggedIn=req.session.user_id ? true:false;
//         const categoryData=await category.find({is_active:false})
//         const user=req.session.user_id
//         const userCart =user ? await Cart.find({user_id:user}): await Cart.find({user_id:null})
//         const productId=Cart.map((Cart)=>Cart.product_id)
//         const products=await product.find({id:{$in:productId}})
//         res.render('cart',{
//             loggedIn,
//            category : categoryData,
//            products,
//            userCart,
//         })   
//     } catch (error) {
//         console.log("error in the loadcart",error.message);
//         res.status(500).send("internal server error")
        
//     }
    
// }





const loadCart = async (req, res) => {
    try {
        const loggedIn = req.session.user_id ? true : false;
        const categoryData = await category.find({ is_active: false });
        const user = req.session.user_id;
        let cart = [];

        if (user) {
            cart = await Cart.find({ user_id: user });
        } else {
            cart = await Cart.find({ user_id: null });
        }

        // Ensure cart is an array before using the map
        const productId = Array.isArray(cart) ? cart.map(cartItem => cartItem.product_id) : [];
        const products = await product.find({ _id: { $in: productId } });

        const cartProducts = await Cart.aggregate([
             {
                $lookup:{

                    from:"products",
                    localField:"product_id",
                    foreignField:"_id",
                    as: "productData"
                }
             },
             {
                $unwind: "$productData"
             },
             
        ])


        res.render('cart', {
            loggedIn,
            category: categoryData,
            products,
            cart,
        });
    } catch (error) {
        console.log("Error in loadCart:", error.message);
        res.status(500).send("Internal server error");
    }
};

// add to cartIcon
const addCartIcon = async (req, res) => {
  try {

    
    const id = req.query.id;
    const productData = await product.findById(id);
    const product_id = productData._id;
    const productName = productData.productName;
    const quantity = 1;
    const price = productData.salePrice;
    const user_id = req.session.user_id;
    const addedAt = Date.now();
    const cartData = await Cart.findOne({
      user_id: user_id,
      product_id: product_id,
    });

    if (cartData) {
      if (cartData.quantity >= productData.quantity) {
        // Return an error or handle as needed
        console.error("Error: Quantity exceeds available stock");
        return res
          .status(400)
          .json({ error: "Quantity exceeds available stock" });
      } else {
        const updateCart = await Cart.findOneAndUpdate(
          { user_id: user_id, product_id: product_id },
          { $inc: { quantity: quantity } },
          { new: true }
        );
      }
    } else {
        console.log("enter")
      if (productData.quantity == 0) {
        return res
          .status(400)
          .json({ error: "Quantity exceeds available stock" });
      } else {
        const cart = new Cart({
          product_id: product_id,
          productName: productName,
          quantity: quantity,
          category: productData.category,
          price: price,
          user_id: user_id,
          addedAt: addedAt,
        });
        await cart.save();
      }
    }
    res.status(200).json({ success: "product added to the art" });
  } catch (error) {
    console.error("Error in addCartIcon:", error.message);
  }
};


// add to cart

const addToCart = async (req, res) => {
    
    try {
        
        const id = req.params.id;
        const productData = await product.findById(id);
        const product_id = productData._id;
        const productName = productData.productName;
        const quantity = req.body.quantity;
        const price = productData.salePrice;
        const user_id = req.session.user_id;
        const addedAt = Date.now();


        const cartData = await Cart.findOne({
            user_id: user_id,
            product_id: product_id,
        });

    
        if (cartData) {
            if (cartData.quantity >= productData.quantity) {
                console.error("Error: The quantity exceeds the available stock");
                return res.status(400).json({ error: 'Quantity exceeds the available stock' });
            } else {
                const updateCart = await Cart.findOneAndUpdate(
                    { user_id: user_id, product_id: product_id },
                    { $inc: { quantity: quantity } },
                    { new: true }
                );
            }
        } else {
            if (productData.quantity == 0) {
                return res.status(400).json({ error: 'Quantity exceeds the available stock' });
            } else {
                const cart = new Cart({
                    product_id: product_id,
                    user_id: user_id,
                    productName: productName,
                    quantity: quantity,
                    price: price,
                    category: productData.category, // Add category field
                    addedAt: addedAt
                });
                await cart.save();
            }
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error occurred while adding to the cart:", error.message);
        res.status(500).send("Internal server error");
    }
}


// const addToCart = async (req, res) => {
//     try {
//         console.log("nnnnnnn")
//         const id = req.params.id;
//         const productData = await product.findById(id);
//         const product_id = productData._id;
//         const productName = productData.productName;
//         const quantity = req.body.quantity;
//         const price = productData.salePrice;
//         const user_id = req.session.user_id; // Corrected this line
//         const addedAt = Date.now();

//         const cartData = await Cart.findOne({
//             user_id: user_id,
//             product_id: product_id,
//         });

//         if (cartData) {
//             if (cartData.quantity >= productData.quantity) {
//                 console.error("Error: The quantity exceeds the available stock");
//                 return res.status(400).json({ error: 'Quantity exceeds the available stock' });
//             } else {
//                 const updateCart = await Cart.findOneAndUpdate(
//                     { user_id: user_id, product_id: product_id },
//                     { $inc: { quantity: quantity } },
//                     { new: true }
//                 );
//             }
//         } else {
//             if (productData.quantity == 0) {
//                 return res.status(400).json({ error: 'Quantity exceeds the available stock' });
//             } else {
//                 const cart = new Cart({
//                     product_id: product_id,
//                     user_id: user_id,
//                     productName: productName,
//                     quantity: quantity,
//                     price: price,
//                     addedAt: addedAt
//                 });
//                 await cart.save();
//             }
//         }
//         res.status(200).json({ success: true });
//     } catch (error) {
//         console.error("Error occurred while adding to the cart:", error.message);
//         res.status(500).send("Internal server error");
//     }
// }

// const addToCart=async(req,res)=>{
//     try {
//         console.log("nnnnnnn")
//         const id =req.params.id
//         const productData=await product.findById(id)
//         const product_id=productData._id
//         const productName=productData.productName
//         const quantity =req.body.quantity
//         const price =productData.salePrice
//         const user_id=user.session.user_id
//         const addedAt=Date.now()

//         const cartData=await Cart.findOne({
//             user_id:user_id,
//             product_id:product_id,
//         })

//         if(cartData){
//             if(cartData.quantity>=productData.quantity){
//                 console.error("Error:The quantity exceeds the available stock")
//                 return res.status(400)
//                 .json({error:'quantity exceeds the available stock'})
//             }
//             else{
//                 const updateCart=await Cart.findOneAndUpdate(
//                     {user_id:user_id,product_id:product_id},
//                     {$inc:{quantity:quantity}},
//                     {new:true}
//                 )
//             }

//         }else{
//             if(productData.quantity==0){
               
//                 return res.status(400).json({error:'Quantity exceeds the available stock'})
//             }else{
//                 const cart=new Cart({
//                     product_id:product_id,
//                     user_id:user_id,
//                     productName:productName,
//                     quantity:quantity,
//                     price:price,
//                     addedAt:addedAt
//                 })
//                 await cart.save()
//             }
//         }
//         res.status(200).json({success:true})

//     }catch(error){
//         console.error("Error occured while adding to the cart",error.message);
//         res.status(500).send("internal server error")
//     }
// }
//----------delete the cart------------

const deleteCartItem=async(req,res)=>{
    try {
        const id=req.query.id
        console.log('Working',id)
         const result=await Cart.deleteOne({product_id:id});
     if(result.deletedCount==0){
        console.log('work')
        return res.status(404).send('cart item not found')
    }
    return res.status(200).json({message:'Deleted successfully'})
    // res.redirect('/cart')   
    } catch (error) {
        console.error("error in deleted cart item:",error);
        res.status(500).send('internal server error')
        
    }
}
// update the cart quantity

const updateQuantity = async (req, res, quantityModifier) => {
    try {
        const product_id = req.query.id;
        const productData = await product.findById(product_id);
        const productStock = productData.quantity;
        const quantity = quantityModifier;
        const user_id = req.session.user_id;

        const existingCart = await Cart.findOne({
            user_id: user_id,
            product_id: product_id,
        });

        if (!existingCart) {
            return res.status(400).json({
                error: "Cart not found for the specified user and product.",
            });
        }

        const newQuantity = existingCart.quantity + quantity;

        if (newQuantity > productStock) {
            return res.status(400).json({
                error: 'Quantity exceeds the current stock',
                stock: productStock
            });
        }

        if (newQuantity <= 0) {
            return res.status(400).json({
                error: 'Quantity must be at least one',
                stock: productStock,
            });
        }

        const updatedCart = await Cart.findOneAndUpdate({
            user_id: user_id, product_id: product_id
        },
            { $inc: { quantity: quantity } },
            { new: true }
        );

        res.json({ quantity: updatedCart.quantity });
    } catch (error) {
        console.error("Error updating the quantity", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const quantityDec=async(req,res)=>{
    try {
        console.log("dd");
        await updateQuantity(req,res,-1)
    } catch (error) {
        console.error("decremented the quantity",error);
        res.status(500).json({error:'internal server error'})
    }
}
// const quantityInc=async(req,res)=>{

//     console.log('jjjjjjjjjjjjj');
//     try {
//         await updateQuantity(req,res,+1)
//     } catch (error) {
//         console.error("Incremented  the quantity",error);
//         res.status(500).json({error:'internal server error'})
//     }
// }
const quantityInc = async (req, res) => {
    try {
        const product_id = req.query.id;
        const productData = await product.findById(product_id);
        const productStock = productData.quantity;

        // Check if the requested quantity exceeds the available stock
        const existingCart = await Cart.findOne({
            user_id: req.session.user_id,
            product_id: product_id,
        });

        if (!existingCart) {
            return res.status(400).json({
                error: "Cart not found for the specified user and product.",
            });
        }

        const newQuantity = existingCart.quantity + 1;

        if (newQuantity > productStock) {
            // Display error message in SweetAlert if quantity exceeds stock
            return res.status(400).json({
                error: 'Out of Stock',
                stock: productStock,
            });
        }

        await updateQuantity(req, res, +1);
    } catch (error) {
        console.error("Error incrementing the quantity", error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const checkoutPage=async(req,res)=>{
    try{
        const userId=req.session.user_id;
        const cartData=await Cart.find({user_id:userId})
       
        const addressData=await address.find({user_id:userId})
        const productId=cartData.map((cart)=>cart.product_id);
        const products=await product.find({_id:{$in:productId}})
        const allCoupons = await Coupon.find({});

        // to get the used coupns by the user
        const usedCoupons= cartData.map((cart)=> cart.used_coupons).flat();

        const availableCoupons=allCoupons.filter((coupon)=>{
            const isUsedByUser= coupon.used_coupons.some((usedCoupons)=>usedCoupons.userId.equals(userId)
            )
            return !isUsedByUser
        })
        
        const loggedIn = req.session.user_id ? true : false;
        const categoryData = await category.find({ is_active: false });

        if (cartData.length > 0) {
        res.render("checkout", {
          loggedIn,
          category: categoryData,
          address: addressData,
          cart: cartData,
          product: products,
          coupon:availableCoupons
        });
      } else {
        res.render("cart", {
          loggedIn,
          category: categoryData,
          cart: cartData,
          product: products,
          message: "cart is empty",
        });
      }
    } catch (error) {
      console.error("Error in checkoutPage:", error.message);
      res.status(500).send("Internall Server Error");
    }
}




module.exports={
    loadCart,
    addToCart,
    deleteCartItem,
    updateQuantity,
    quantityDec,
    quantityInc,
    checkoutPage,
    addCartIcon

}

