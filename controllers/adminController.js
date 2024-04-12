const Cart =require('../Models/cartModel')
const address=require('../Models/addressModel')
const product=require('../Models/ProductModel')
const Category=require('../Models/categoryModel')
const User=require('../Models/userModel')
const Coupon=require('../Models/couponModel')
const Order=require('../Models/orderModel')


const loadDashboard = async(req,res)=>{
    try {
      
           const categories=await Category.find({})
           const orders=await Order.find({})

           const revenue= orders.reduce((totalrevenue,order)=>{
            if(order.status!='Cancelled'){
                const orderRevenue=order.products.reduce((subtotal,product)=> subtotal +product.price* product.quantity,0)
                totalrevenue=totalrevenue+orderRevenue
            }
        return totalrevenue
        }  ,0)
        // calculate the total number of the products 
        const totalNumberOfOrders =orders.reduce((totalOrders,order)=>{
            if(order.status!=='Cancelled'){
                return totalOrders+order.products.length
            }
            return totalOrders
        },0)

        // fetch the total number of products
        const totalNumberOfProducts=await product.countDocuments()

        const totalCategories=await Category.countDocuments()

        const currentDate = new Date();
        const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
    
        const monthlyOrders = await Order.find({
          createdOn: { $gte: firstDayOfMonth },
        });
    


        // calculate the monthly revenue
        const monthlyRevenue=monthlyOrders.reduce((totalRevenue,order)=>{
            const completedProducts=order.products.filter((product)=>product.status!=='Cancelled')
       
        const orderRevenue = completedProducts.reduce(
            (subtotal, product) => subtotal + product.price * product.quantity,
            0
          );
    
          return totalRevenue + orderRevenue;
        },0);
    
        res.render("dashboard", {
            categories,
            orders,
            revenue,
            totalNumberOfOrders,
            totalNumberOfProducts,
            totalCategories,
            monthlyRevenue,
          });



    }catch (error) {
        console.log(error.message);
    }
}

const loadUserManagment = async (req, res) => {
    try {
        const user = await User.find({is_admin:false})    
        res.render('userManagement',{user}); 
    } catch (error) {
        console.log(error.message);
    }
};

const blockUser = async(req,res)=>{
    try {
        const userId = req.params.userId;
        const userData = await User.findById(userId)
        if (!userData) {
            console.log("user not Found...!");
        } 
        userData.is_blocked = !userData.is_blocked
        await userData.save()
        if (userData.is_blocked) {
            res.json({ success:true , is_blocked:true })
        }
        if (!userData.is_blocked) {
            res.json({ success:true , is_blocked:false })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const adminLogout = async (req, res) => {
    console.log("In adminlogout");
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            res.status(500).send("Error occurred during logout");
        } else {
            res.redirect("/login");
        }
    });
};
const topSellingProducts = async (req, res) => {
    try {
      console.log("IN BEST");
      const bestSellingProducts = await Order.aggregate([
        { $match: { status: "Delivered" } },
        { $unwind: '$products' },
        { $group: { _id: "$products.product", totalQuantity: { $sum: "$products.quantity" } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 6 },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $project: { _id: "$product._id", productName: "$product.productName", totalQuantity: 1 } } // Adjusted field names
      ]);
  
      console.log("BESTSELLING", bestSellingProducts);
      res.render('bestSellingProduct', { bestSellingProducts });
    } catch (error) {
      console.log("Error occurred during top-selling products", error);
      res.render('error');
    }
  };
  
const topSellingProduct=async(req,res)=>{
    try {
        res.render('bestSellingProduct')
    } catch (error) {
        
    }
}
const topSellingCategory = async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        console.log('ORDERCOUNT', orderCount);

        const bestSellingCategory = await Order.aggregate([
            { $match: { status: "Delivered" } },
            { $unwind: "$products" },
            { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$category._id",
                    categoryName: { $first: "$category.categoryName" }, // Project category name from category document
                    totalQuantity: { $sum: "$products.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            {
                $project: {
                    categoryId: '$_id', // Include Category ID
                    categoryName: 1,
                    totalQuantity: 1
                }
            }
        ]);

        res.render('bestSellingCategory', { bestSellingCategory });
        console.log('bestsellingcategory', bestSellingCategory);
    } catch (error) {
        console.log("Error occurred during topsellingCategory", error);
    }
};




module.exports = {
    loadDashboard,
    loadUserManagment,
    blockUser,
    adminLogout,
    topSellingProducts,
    topSellingCategory,
    topSellingProduct
}