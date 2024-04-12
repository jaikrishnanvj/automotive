const express = require('express')
const session = require('express-session')
const multer = require('multer')
const bodyparser = require('body-parser')
const admin_route = express()
const adminController = require('../controllers/adminController')
const productController = require('../controllers/productController')
const categoryController = require('../controllers/categoryController')
const couponController=require('../controllers/couponController')
const orderController =require('../controllers/orderController')
const auth = require("../Middlewares/adminAuth")
const path = require("path")
admin_route.use(
    session({
        secret:'secret-key',
        resave:false,
        saveUninitialized:true
    })
)

const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null, "./public/assetsNew/uploads");
    },
    filename:function (req,file,cb){
        cb(null, Date.now() + "-" + file.originalname)
    },
});
const upload = multer({ storage : storage });

admin_route.use(bodyparser.json())
admin_route.use(bodyparser.urlencoded({extended:true}));

admin_route.use('/public', express.static(path.join(__dirname, 'public')));

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

//=======================admin start here=====================================//
admin_route.get("/",auth.isLogin,adminController.loadDashboard)
admin_route.get("/user-management",auth.isLogin,adminController.loadUserManagment)
admin_route.put("/users/:userId/block",auth.isLogin,adminController.blockUser)

//=======================product Mangement=============================//

admin_route.get("/products/product-management",auth.isLogin,productController.ShowProduct)
admin_route.get("/products/add-new-product",auth.isLogin,productController.addNewProduct)
admin_route.post(
    "/products/create-new-product",auth.isLogin,
    upload.array("images",10),
    productController.createNewProduct
    )
admin_route.delete("/products/delete-product",auth.isLogin,productController.deleteProduct)
admin_route.get("/products/edit-product",auth.isLogin,productController.editProduct)
admin_route.post("/products/create-edit-product",auth.isLogin,upload.array("newImages",10),productController.UpdateCreateEditProduct)
admin_route.post("/delete-single-image",auth.isLogin,productController.deleteSingleImage)

//=======================category in admin side===============================================//
admin_route.get("/products/category-management",auth.isLogin,categoryController.loadCategoryManagement)
admin_route.post("/category/add-new-category",auth.isLogin,categoryController.addNewCategory)
admin_route.get("/category/edit-category",auth.isLogin,categoryController.editCategory)
admin_route.delete("/category/delete-category",auth.isLogin,categoryController.deleteCategory)
admin_route.post("/category/add-updated-category",auth.isLogin,categoryController.updateCategory)

// -------------------------order-------------------------------

admin_route.get('/orderDetails',auth.isLogin,orderController.adminOrderManagement);
admin_route.get('/order-details',auth.isLogin,orderController.adminOrderDetails)
admin_route.post('/order-details',auth.isLogin,orderController.adminStatusChange)
admin_route.delete('/adminCancelOrder/:orderId/:pId',auth.isLogin,orderController.adminCancelOrder)

// ==========================coupon=======================================

admin_route.get("/listCoupon", auth.isLogin, couponController.listCoupon);
admin_route.get("/editCoupon", auth.isLogin, couponController.loadEditCoupon);
admin_route.post("/editCoupon", auth.isLogin, couponController.editCoupon);
admin_route.get("/coupon", auth.isLogin, couponController.loadAddCoupon);
admin_route.post("/addcoupon",auth.isLogin, couponController.addCoupon);
admin_route.delete("/deleteCoupon", auth.isLogin, couponController.deleteCoupon);

// ============================offer=========================================
admin_route.put("/submitOffer",auth.isLogin, productController.addProductOffer);
admin_route.put("/removeProductOffer",auth.isLogin, productController.removeProductOffer);
admin_route.put("/submitCategoryOffer",auth.isLogin, categoryController.addCategoryOffer);
admin_route.put("/products/remove-category-offer",auth.isLogin, categoryController.removeCategoryOffer);

// report
admin_route.get("/saleReport", auth.isLogin, orderController.saleReportPage)
admin_route.get("/download-pdf", auth.isLogin, orderController.downloadPdf)
admin_route.get("/download-excel", auth.isLogin, orderController.downloadExcel)
admin_route.get("/sales-data",auth.isLogin,orderController.saleChart)

// top selling
admin_route.get("/bestSellingProducts",auth.isLogin,adminController.topSellingProducts)
admin_route.get('/topCategories',auth.isLogin,adminController.topSellingCategory)




//============================================admin logout========================================================================================//
admin_route.get("/logout", auth.isLogin,adminController.adminLogout);

module.exports = admin_route;