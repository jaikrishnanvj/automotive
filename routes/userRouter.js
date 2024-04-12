const express=require("express") 
const session=require("express-session")
const user_route=express()
const path = require('path')
const bodyparser=require('body-parser')
const nocache = require('nocache')
// const multer=require("multer")
user_route.use("/public", express.static(path.join(__dirname, "public")));
user_route.set('view engine','ejs')
user_route.set('views','./views/user')
const config=require("../config/session")
const auth=require("../Middlewares/auth")
const productController = require("../controllers/productController")
const categoryController = require("../controllers/categoryController")
user_route.use(session({secret: config.sessionSecret,resave: false, // Set resave option to false
saveUninitialized: true }));
user_route.use(nocache())
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({extended:true}))
const cartModel = require("../Models/cartModel");
const cartController=require('../controllers/cartController')
const addressController=require('../controllers/addressController')
const orderController=require('../controllers/orderController')
const checkBlocked=require('../Middlewares/checkBlocked')
const couponController=require('../controllers/couponController')
const wishlistController=require('../controllers/wishlistController')


// to convert the incoming quest into url encoded format

const userController=require("../controllers/userControllers");
const wishlist = require("../Models/wishlistModel")

// user_route.get('/register',auth.isLogout,userController.loadLogin)

user_route.post("/register",userController.insertUser);
user_route.get('/otp', auth.isLogout, userController.loadOtp);
user_route.post('/otp', auth.isLogout, userController.otpConfirm);
// Other routes...

// user_route.post('/otp',userController.checkOTP)
user_route.get('/home',checkBlocked,auth.isLogin,userController.loadHome)
user_route.get('/resendOtp',checkBlocked,auth.isLogout,userController.resendOTP)
user_route.get('/login',checkBlocked,auth.isLogout,userController.loginLoad)
user_route.post('/login',checkBlocked,userController.verifyLogin)
// cart

// user_route.post('/addcart',auth.isLogin,cartController.)
user_route.get('/cart',auth.isLogin,cartController.loadCart)
user_route.post('/productDetails/:id',auth.isLogin,cartController.addToCart);
user_route.post('/updatequantity',auth.isLogin,cartController.updateQuantity);
user_route.delete('/delete-cartItem',auth.isLogin,cartController.deleteCartItem);
user_route.post("/cart/quantityInc",auth.isLogin,cartController.quantityInc);
user_route.post("/cart/quantityDec",auth.isLogin,cartController.quantityDec);

// wishlist
user_route.get('/wishlist',auth.isLogin,wishlistController.laodWishlist)
user_route.post('/productsDetails/:id',auth.isLogin,wishlistController.addToWishlist)
user_route.post('/wishlistCart',auth.isLogin,wishlistController.wishlistToCart)
user_route.delete("/delete-wishlist",auth.isLogin,wishlistController.deleteWishlist)

// address
user_route.get("/checkout",auth.isLogin,cartController.checkoutPage)
user_route.get("/profile",auth.isLogin,addressController.profilePage)
// user_route.get("/AddAddress",auth.isLogin,addressController.AddAddress)
user_route.post("/addAddress",auth.isLogin,addressController.addAddress)
user_route.delete("/deleteAddress",auth.isLogin,addressController.deleteAddress)
user_route.get('/editAddress',auth.isLogin,addressController.editAddress)
user_route.post('/editAddress',auth.isLogin,addressController.editAddressSave)
user_route.get("/editprofile",auth.isLogin,addressController.editProfile)
user_route.post("/editprofile",auth.isLogin,addressController.updateEditProfile)
user_route.get('/addressAdd',auth.isLogin,addressController.addressAdd)
user_route.post('/editPassword',auth.isLogin,addressController.editUserPassword)
user_route.get('/loadeditPassword',auth.isLogin,addressController.loadeditPassword)
// search

// user_route.get("/search", auth.isLogin,userController.shopFilter);
// user_route.post("/filter",auth.isLogin,productController.filer)
// user_route.get('/filter', userController.filterProductsByCategory);
user_route.get("/invoice", auth.isLogin, orderController.invoice);
user_route.get("/saveinvoice", auth.isLogin, orderController.saveInvoice);



// order
user_route.post('/orderPlaced',auth.isLogin,orderController.orderComplete)
user_route.get('/order',auth.isLogin,orderController.orderCompleteLoad)
user_route.get("/orderDetails", auth.isLogin, orderController.orderDetails);
user_route.put("/cancelOrder/:orderId/:pId",auth.isLogin,orderController.cancelOrder);
user_route.post("/order-return/:orderId/:productId",auth.isLogin,orderController.returnOrder)
user_route.get("/continuePayment",auth.isLogin,orderController.continuePayment)
user_route.post('/rePayment/:id',auth.isLogin,orderController.failedOrder)


// coupon
user_route.post('/addcouponCode',checkBlocked,auth.isLogin,couponController.addCouponCode)
user_route.post('/remove-coupon',checkBlocked,auth.isLogin,couponController.removeCoupon)


// home
user_route.get('/about',auth.isLogin,userController.about)
user_route.get('/contact',auth.isLogin,userController.contact)
user_route.get('/appointment',auth.isLogin,userController.appointment)
user_route.get('/shop',auth.isLogin,productController.loadShop)

user_route.get("/product-details",productController.loadProductDetail)
user_route.get('/account',auth.isLogin,userController.account)
// user_route.get('/filter',auth.isLogin,userController.filterProductsByCategory)
// logout
user_route.get('/logout',auth.isLogin,userController.userLogout)

// forget password
user_route.get("/forgetPasswordEmail",userController.forgetPassEmailVerifyPageLoad);
user_route.post("/forgetPasswordEmail", userController.verifyEmail);
user_route.get("/ForgetPassVerifyOtp", userController.forgetPassVerifyOtp);
user_route.post("/ForgetPassVerifyOtp", userController.verifyOtp);
user_route.post("/changePassword", userController.changePassword);



module.exports=user_route


