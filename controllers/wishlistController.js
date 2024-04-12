const Cart =require('../Models/cartModel')
const address=require('../Models/addressModel')
const Product=require('../Models/ProductModel')
const Category=require('../Models/categoryModel')
const User=require('../Models/userModel')
const Coupon=require('../Models/couponModel')
const Wishlist=require('../Models/wishlistModel')

const laodWishlist=async(req,res)=>{
    try {
        const loggedIn=req.session.user_id?true:false;
        const categoryData=await Category.find({is_active:false})

        const userId=req.session.user_id;
        const wishlist=userId? await Wishlist.find({user_id:userId}):Wishlist.find({user_id:null})

        const productId=wishlist.map((wishlist)=>wishlist.product_id)
        const products= await Product.find({_id:{$in:productId}})
         // The $in operator is used to specify a range of values.
        res.render('wishlist',
        {
            loggedIn,
            products,
            Category:categoryData,
            wishlist,
        })


        
    } catch (error) {
        console.error('error handling wishlist',error.message);
        res.status(500).send('internal server Error')
        
    }
}
const addToWishlist = async (req, res) => {
    try {
        const productId =  req.params.id;
        const productData = await Product.findById(productId);
        console.log(productId);
        if (!productData) {
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log();
        const { _id: product_id, productName, salePrice } = productData;
        const user_id = req.session.user_id;

        // Check if the product already exists in the wishlist
        const existingWishlistItem = await Wishlist.findOne({ product_id, user_id });

        if (existingWishlistItem) {
            // Update the existing wishlist item (e.g., increase quantity)
            existingWishlistItem.quantity += 1; // Example: Increase quantity by 1
            await existingWishlistItem.save();
            return res.status(200).json({ message: 'Product updated in wishlist successfully'});
        } else {
            // Create a new wishlist item
            const wishlist = new Wishlist({
                product_id,
                productName,
                price: salePrice,
                user_id,
                //  Initial quantity is 1
            });

            const wishlistData = await wishlist.save();
            
            if (wishlistData) {
                return res.status(201).json({ message: 'Product added to wishlist successfully' });
            } else {
                return res.status(500).json({ error: 'Failed to add product to wishlist' });
            }
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const wishlistToCart=async(req,res)=>{
    try {
        const id=req.query.id
        const productData = await Product.findById(id)

        if(!productData){
            return res.status(404).json('product not found')
        }
        
            const {_id:product_id,productName,salePrice,category}=productData

            const quantity=1;

            const user_id=req.session.user_id;

            const cartData=await Cart.findOne({user_id,product_id})

            if(cartData){
                if(cartData.quantity>=productData.stock)
                {
                    console.error('error:Quantity exceeds the available the stock');
                    return res.status(400).json({error:'Quantity exceeds the available stock'})
                }
                else
                {
                    const updateCart=await Cart.findOneAndUpdate(
                        {user_id,product_id},
                        {$inc:{quantity:quantity}},
                        {new:true}
                    )

                }
            }else{
                    if(productData.stock==0){
                        return res.status(400).json({error:'quantity exceeds the available stock'})
                    }
                
                else{
                    const cart=new Cart({
                        product_id,
                        productName,
                        quantity,
                        category,
                        price:salePrice,
                        user_id,
                        addedAt:Date.now()
                    })
                    await cart.save();
                }
            }
        res.status(200).json('products added to cart successsfully')
    } catch (error) {
        console.error("Error in wishlistToCart:", error.message);
        res.status(500).json("Internal Server Error");
    }
}
const deleteWishlist=async(req,res)=>{
    try {
        const id =req.body.id
        const result=await Wishlist.deleteOne({product_id:id})
        if(result){
            res.status(200).json('wishlist product deleted')
        }
    } catch (error) {
      console.error('error deleting from the wishlist',error.message);
      res.status(500).send('internal server error')  
    }
}

module.exports={
    laodWishlist,
    addToWishlist,
    wishlistToCart,
    deleteWishlist,

}