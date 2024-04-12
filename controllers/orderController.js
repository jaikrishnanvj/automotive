const  Product = require('../Models/ProductModel');
const User = require("../Models/userModel");
const Category = require("../Models/categoryModel");
const Address = require("../Models/addressModel");
const bcrypt = require("bcrypt");
const Order = require("../Models/orderModel");
const Cart = require('../Models/cartModel');
const Coupon=require('../Models/couponModel')
const Wallet=require('../Models/walletModel')
const { Readable } = require("stream");
const Razorapay=require("razorpay")
const PDFDocument=require('pdfkit')
const ExcelJS = require("exceljs");
const easyInvoice=require("easyinvoice");
const { response } = require('../routes/userRouter');
const moment=require("moment")




const instance= new Razorapay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY
})


// const orderCompleteLoad = async (req, res) => {
//   try {
//       const loggedIn = !!req.session.user_id;
//       const categoryData = await Category.find({ is_active: false });
//       const {payment, addressId } = req.session.orderData;
//       const addressData = await Address.findById({ _id: addressId });

//       const user_id = req.session.user_id;

//       const cartItems = await Cart.find({ user_id: user_id });
//         for (const item of cartItems) {
//           const product = await Product.findById(item.product_id);

//           // Ensure the product exists and has enough stock
//           if (product && product.stock >= item.quantity) {
//             // Subtract the ordered quantity from the product stock
//             product.stock -= item.quantity;

//             // Save the updated product information
//             await product.save();
//           } else {
//             // Handle the case where there's not enough stock
//             console.error(`Insufficient stock for product: ${item.product_id}`);
//             // You might want to consider rolling back the order or taking appropriate action
//           }
//         }

//         // const couponCode = req.session.couponCode;
//         // const coupon = await Coupon.findOne({ code: couponCode });

//         // if (coupon) {
//         //   const user = await User.findById(req.session.user_id);
//         //   const userId = {
//         //     userId: user._id,
//         //   };
//         //   coupon.used_coupons.push(userId);
//         //   await coupon.save();
//         // }

//       const totalPrice = cartItems.reduce((total, item) => {
//           const numericPrice = parseFloat(item.price);
//           return isNaN(numericPrice) ? total : total + numericPrice * item.quantity;
//       }, 0);

//       const products = cartItems.map((item) => ({
//           product: item.product_id,
//           quantity: item.quantity,
//           price: item.quantity * item.price,
//           status: "confirmed",
//       }));

//       const order = new Order({
//           user: user_id,
//           products,
//           payment ,
//           address: {
//               city: addressData.townCity,
//               zipCode: addressData.pinCode,
//               streetAddress: addressData.addressLine,
//           },
//           totalPrice,
//           status: "placed",
//       });

//       const deleted = await Cart.deleteMany({ user_id: user_id });

//       const orderDb = await order.save();

//       res.render("ordercomplete", {
//           loggedIn,
//           category: categoryData,
//       });
//     } catch (error) {
//       console.error("Error occurred:", error);
//       res.status(500).send("Internal Server Error: " + error.message);
//   }
  
// };
// ==============================================================================================================

const orderCompleteLoad = async (req, res) => {
  try {
    const loggedIn = !!req.session.user_id;
    console.log('IN ORDERCOMPLETETLOAD')
    const categoryData = await Category.find({ is_active: false });
    const { payment, addressId } = req.session.orderData;
    const addressData = await Address.findById({ _id: addressId });
    const orderId = req.session.orderId;
    console.log("2222222",orderId)
    const existingOrder = await Order.findOne({ _id: orderId });
    if(existingOrder)
    {
      existingOrder.status='placed'
      await existingOrder.save();
      delete req.session.orderId;
    }

    const user_id = req.session.user_id;

    const cartItems = await Cart.find({ user_id: user_id });

    // Iterate through each item in the cart and update the product stock
    for (const item of cartItems) {
      const product = await Product.findById(item.product_id);

      // Ensure the product exists and has enough stock
      if (product && product.quantity >= item.quantity) {
        // Subtract the ordered quantity from the product stock
        product.quantity -= item.quantity;

        // Save the updated product information
        await product.save();
      } else {
        // Handle the case where there's not enough stock
        console.error(`Insufficient stock for product: ${item.product_id}`);
        // You might want to consider rolling back the order or taking appropriate action
      }
    }

    // const couponCode = req.session.couponCode;
    // const coupon = await Coupon.findOne({ code: couponCode });

    // if (coupon) {
    //   const user = await User.findById(req.session.user_id);
    //   const userId = {
    //     userId: user._id,
    //   };
    //   coupon.used_coupons.push(userId);
    //   await coupon.save();
    // }

    const totalPrice = cartItems.reduce((total, item) => {
      const numericPrice = parseFloat(item.price);
      return isNaN(numericPrice) ? total : total + numericPrice * item.quantity;
    }, 0);

    const products = cartItems.map((item) => ({
      product: item.product_id,
      quantity: item.quantity,
      price: item.quantity * item.price,
      status: "confirmed",

    }));

    const order = new Order({
      user: user_id,
      products,
      payment,
      address: {
        city: addressData.townCity,
        zipCode: addressData.pinCode,
        streetAddress: addressData.addressLine,
      },
      totalPrice,
      status: "placed",
    });

    // if (req.session.couponCode) {
    //   const couponCode = req.session.couponCode;
    //   const coupon = await Coupon.findOne({ code: couponCode });

    //   if (coupon) {
    //     const user = await User.findById(req.session.user_id);
    //     const userId = {
    //       userId: user._id,
    //     };
    //     coupon.used_coupons.push(userId);
    //     await coupon.save();
    //   }
    // }

    const deleted = await Cart.deleteMany({ user_id: user_id });

    // const orderDb = await order.save();

    res.render("ordercomplete", {
      loggedIn,
      category: categoryData,
    });
  } catch (error) {
    console.error("hello",error.message);
    res.status(500).send("Internal Server Error");
  }
};

// -------------------------------------------------------------


  const orderComplete = async (req, res) => {
    try {
      const { payment,addressId, totalAmount } = req.body;
      console.log("IN ORDERCOMPLETE",req.body)
      const addressData = await Address.findById({ _id: addressId });

      req.session.orderData = { payment, addressId };
      console.log('payment',payment)
  
      const user_id = req.session.user_id;
  
      const user = await User.findById(user_id);
  
      const cartItems = await Cart.find({ user_id: user_id });
      const product=await Product.find()
  
      const totalPrice = cartItems.reduce((total, item) => {
        const numericPrice = parseFloat(item.price);
        return isNaN(numericPrice) ? total : total + numericPrice * item.quantity;
      }, 0);
  
      const products = cartItems.map((item) => ({
        product: item.product_id,
        quantity: item.quantity,
        price: item.quantity * item.price,
        status: "confirmed",
      }));
      
  
      const order = new Order({
        user: user_id,
        products,
        payment, 
        address: {
          city: addressData.townCity,
          zipCode: addressData.pinCode,
          streetAddress: addressData.addressLine,
        },
        totalPrice: totalAmount ,
        status: "failed",
      });
      const savedOrder = await order.save();
      req.session.orderId = savedOrder._id;
      if(payment==='cod'){
        res.json({
          payment :false,
          method:'cod',
          orderId:user
        })
      }  else if(payment==='razorPay'){
            await order.save()

            // let orderPlaced= await newOrder.save()
           
     
           

          // const orderId=await Order.findById({user:user_id})
          console.log("ORDERID")
          
          const generatedOrder= await generateOrderRazorpay(order._id,order.totalPrice)
        
      res.json({
        payment: false,
        method: "Online",
        razorpayOrder: generatedOrder, 
        orderId: savedOrder._id,      });
    }  else if(payment=='wallet'){
        const wallet=await Wallet.findOne({user_id:user._id})
        
        if(!wallet || wallet.balance <totalAmount){
          return res.status(400).json({error:'insufficient balance'})
        }
        wallet.balance-=totalAmount;
        wallet.transactions.push({
          amount:totalAmount,
          reason:'order',
          transactionType:'debit',
          date:new Date().toISOString(),
        })
        await wallet.save();

        res.json({
          payment:false,
          method:'wallet',
          orderId:user,
        })
      }
       }
       catch(error){
        console.log("Error occured",error)
       }
      }
    
      const generateOrderRazorpay=(orderId,total)=>{
        console.log("IN Generateorderrazorpay")
        return new Promise((resolve,reject)=>{
          const options={
            amount:total*100,
            currency:'INR',
            receipt:String(orderId),
          }
          console.log('OPTIONS',options)
          instance.orders.create(options,(err,order)=>{
            if(err){
              reject(err)
              console.log("Error occured",err)
            }
            else{
              resolve(order)
            }
          })
        })
      }
      
// continuepayment


const continuePayment = async (req, res) => {
  try {
    console.log("In continue", req.query);
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    const orderId = req.query.id;
    console.log(orderId);
    const order = await Order.findById(orderId).populate('products');
    console.log(order, 'ds');

    let total = 0;

    // Calculate total price of products in the order
    for (const product of order.products) {
      const productDetails = await Product.findById(product.product);
      if (productDetails) {
        total += parseFloat(productDetails.salePrice) * product.quantity;
      } else {
        console.error(`Product not found: ${product.product}`);
      }
    }
    console.log("TOT",total)
    

    res.render('continuePayment', {
      user,
      products: order.products,
      order,
      total,
    });

  } catch (error) {
    console.error("Error occurred during the payment", error);
    res.status(500).render('error'); // Send appropriate error response
  }
};

const failedOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.user_id;
    console.log("IN RETYRPAYMENT");
    console.log(orderId,"orderid");
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order not found with ID: ${orderId}`);
      return res.status(404).render('error'); // Send appropriate error response
    }

    // Update order status and payment method
    order.status = "placed";
    for (const products of order.products) {
      products.status = "placed";
    }
    order.paymentMethod = req.body.paymentMethod;
    const deleted = await Cart.deleteMany({ user_id: userId });
    await order.save();
    // await Cart.save()

    // Remove corresponding cart items
    const cart = await Cart.findOneAndDelete({ userId: userId });
    res.status(200).send('Failed order placed successfully');
  } catch (error) {
    console.error("Error occurred during failedOrderPlacing", error);
    res.status(500); // Send appropriate error response
  }
};

// const failedOrder=async(req,res)=>{
//   try {
//     const orderId = req.params.id;
//     const userId = req.session.userId;
//     console.log("IN RETYRPAYMENT");
//     const order = await orderSchema.findById(orderId);
//     order.orderStatus = "Pending";
//     for (const product of order.products) {
//       product.orderStatus = "Pending";
//     }
//     order.paymentMethod = req.body.paymentMethod;
//     await order.save();
//     const cart = await cartSchema.findOneAndDelete({ userId: userId });
//   } catch (error) {
//     console.log("Error occured during failedOrderPlacing", error);
//     res.render("error");
//   }
// };



  // cancel order-------------------------------

  const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const pId = req.params.pId;
        const userId = req.session.user_id;

        const order = await Order.findOne({_id: orderId, 'products.product': pId});

        if (!order || !order.products || order.products.length === 0) {
            return res.status(404).send("Order or product not found.");
        }

        // Extract payment method from the order
        const paymentMethod = order.payment;

        const updatedOrder = await Order.updateOne(
            { _id: orderId, "products.product": pId },
            { $set: { "products.$[elem].status": "Cancelled" } },
            { arrayFilters: [{ "elem.product": pId }] }
        );

        const refundAmount = order.products[0].price;

        if (updatedOrder) {
            // Check if payment method is not cash on delivery (COD)
            if (paymentMethod !== 'COD') {
                const userWallet = await Wallet.findOne({ user_id: userId });

                if (userWallet) {
                    userWallet.balance += refundAmount;
                    await userWallet.save();

                    // Save the transaction history
                    userWallet.transactions.push({
                        amount: refundAmount,
                        reason: 'refund',
                        transactionType: 'credit',
                        date: new Date().toISOString()
                    });
                    await userWallet.save();
                } else {
                    const wallet = new Wallet({
                        user_id: userId,
                        balance: refundAmount,
                        transactions: [{
                            amount: refundAmount,
                            reason: 'refund',
                            transactionType: 'credit',
                            date: new Date().toISOString,
                        }]
                    });
                    await wallet.save();
                }
            }
        }
        res.status(200).redirect(`/orderDetails?id=${orderId}`);
    } catch (error) {
        return res.status(500).send('Internal server error');
    }
}



 // Import the Product model

  const orderDetails = async (req, res) => {
      try {
          const orderId = req.query.id;
          const user_id = req.session.user_id;
          const loggedIn = req.session.user_id ? true : false;
          const categoryData = await Category.find({ is_active: false });
      
          const userData = await User.findById(user_id);
      
          // Populate the products field with the details from the Products collection
          const orderData = await Order.findOne({ _id: orderId, user: user_id })
              .populate({
                  path: "products.product",
                  model: Product, // Use the imported Product model
              })
              .populate("address");
      
          // Check if orderData is null or undefined before accessing its properties
          if (!orderData) {
              console.error("Order not found");
              return res.status(404).send("Order not found");
          }
      
          // Iterate over the products array to access the populated "product" field
          const populatedProducts = orderData.products.map(
              (product) => product.product
          );
      
          res.render("orderDetails", {
              loggedIn,
              category: categoryData,
              user: userData,
              order: orderData.toObject(),
              products: populatedProducts,
              moment
          });
      } catch (error) {
          console.error("Error in orderDetails:", error);
          res.status(500).send("Internal Server Errors");
      }
  };
  
  // admin side ----------------------

  const adminOrderManagement = async (req, res) => {
    try {
  
        const page = parseInt(req.query.page) || 1;
        const perPage =req.query.OrderPerPage||20; // Adjust the number of orders per page as needed
        const selectedCategory = req.query.status; // Get the selected category from the query parameters
  
        let query = {}; // Define an empty query object
  
        // If a category is selected, add it to the query
        if (selectedCategory) {
          
            query.status= selectedCategory;
        }
       console.log( query )
        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / perPage);
  
        const orders = await Order.find(query)
            .populate("user")
            .sort({ createdOn: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);
  
        res.status(200).render("adminOrders", {
            title: "Admin Orders",
            orders,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        res.status(500).send("Internal Server Error. Please try again later.");
    }
  };
  
  // admin side order details 
  
  
  const adminOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.id;
        const user_id = req.session.user_id;
        console.log(orderId);
      

        // Check if user is logged in
        const loggedIn = !!user_id;

        // Assuming Category, User, and Order models are properly defined
        const categoryData = await Category.find({ is_active: true });
        
        // Fetch user data if user is logged in
        let userData;
        if (loggedIn) {
            userData = await User.findById(user_id);
        }

        // Fetch order data
        const orderData = await Order.findOne({ _id: orderId })
            .populate({
                path: "products.product",
                model: "products", // The name of the referenced model
            })
            .populate("address")
            .populate("user");

        console.log(orderData);

        // Check if orderData is null or undefined before accessing its properties
        if (!orderData) {
            console.error("Order not found");
            return res.status(404).send("Order not found");
        }

        // Iterate over the products array to access the populated "product" field
        const populatedProducts = orderData.products.map(
            (product) => product.product
        );

        res.render("admin-orders-details", {
            loggedIn,
            category: categoryData,
            user: userData,
            order: orderData.toObject(),
            products: populatedProducts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error. Please try again later.");
    }
};
  // admin order status change 
  
  const adminStatusChange = async (req, res) => {
    try {
      const id = req.query.id;
      const orderStatus = req.body.orderStatus;
  
      const orderData = await Order.findById({ _id: id });
      
      orderData.status = orderStatus;
  
      const changeProductsOrder = orderData.products.forEach((product) => {
        product.status = orderStatus;
      });
      // T/e purpose of using forEach in this context is to update the status of each product
      //  within the order to match the new order status provided in the req.body.orderStatus

      const statusUpdated = await orderData.save();
      if (statusUpdated) {
        res.status(200).redirect("/admin/orderDetails");
      }
    } catch (error) {
      res.status(500).send("Internal Server Error. Please try again later.");
    }
  };
  
  // admin side order cancel 
  
  const adminCancelOrder = async (req, res) => {


    console.log("--------------------------------------------------------------------------");
    
    try {
      
      const orderId = req.params.orderId;
      const pId = req.params.pId;
      console.log(orderId);

      // Update p  croduct status
      console.log(pId)
      console.log(orderId)
      const updatedOrder  = await Order.updateOne(
        { _id: orderId, "products.product": pId },
        { $set: { "products.$[elem].status": "Cancelled" } },
        { arrayFilters: [{ "elem.product": pId }] }
      );
     console.log(updatedOrder) 
     if(updatedOrder )   {
      updatedOrder.save()
     }
      // Find the updated order
      const order = await Order.findOne({ _id: orderId, "products.product": pId });
  
      if (order) {
        // Check if all products are cancelled
        const allProductsCancelled = order.products.every(product => product.status === "Cancelled");
  
        if (allProductsCancelled) {
          // Update order status and save
          order.status = "Cancelled";
          await Order.save();
        }
      }
  
      if (updatedOrder) {
        // Redirect after successful cancellation
        res.status(200).redirect(`/admin/order-details?id=${orderId}`);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error. Please try again later.");
    }
  };
  



// salereportpage
const saleReportPage = async (req, res) => {
  try {
    const { startDate, endDate, filter, page = 1, limit = 5 } = req.query;
    let query = { status: 'Delivered' };

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);

      query.createdOn = { $gte: start, $lt: end };
    }

    if (filter) {
      if (filter === 'yearly') {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);
        query.createdOn = { $gte: startOfYear, $lt: endOfYear };
      } else if (filter === 'monthly') {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
        query.createdOn = { $gte: startOfMonth, $lt: endOfMonth };
      } else if (filter === 'daily') {
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);
        query.createdOn = { $gte: startOfDay, $lt: endOfDay };
      }
    }

    const count = await Order.countDocuments(query);
    const totalPages = Math.ceil(count / limit);

    const deliveredOrders = await Order.find(query)
      .populate('user')
      .populate('products')
      .sort({ createdOn: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.render('saleReport', { orders: deliveredOrders, startDate, endDate, totalPages, currentPage: page });

  } catch (error) {
    console.error('Error in the sale report page', error);
    res.status(500).send('Internal server error. Please try again later.');
  }
};




const downloadPdf = async (req, res) => {
  try {
    const { date } = req.query;
    let query = { status: "Delivered" };
    
    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
    
      // Correct the field to 'createdOn' for date filtering
      query.createdOn = { $gte: startDate, $lt: endDate };
    }
    
    // Fetch delivered orders from the database
    const deliveredOrders = await Order.find(query)
      .populate("user")
      .sort({ createdOn: -1 });

    const doc = new PDFDocument();
    

    // Set the Content-Type header to display the PDF in the browser
    res.setHeader("Content-Type", "application/pdf");
    // Set Content-Disposition to suggest a filename
    res.setHeader("Content-Disposition", 'inline; filename="sale_report.pdf"');
    // Pipe the PDF content to the response stream
    doc.pipe(res);

    // Add content to the PDF (based on your sale report structure)
    doc.text("Sale Report", { fontSize: 17, underline: true }).moveDown();
    doc
      .fontSize(22)
      .text("777 automotive", { align: "center" })
     
      

    // Add overall sales count, discount, and coupon offer
    const overallSalesCount = deliveredOrders.length;
    // const overallDiscount = deliveredOrders.reduce((acc, order) => acc + (order.discount || 0), 0);
    // const overallCouponOffer = deliveredOrders.reduce((acc, order) => acc + (order.couponOffer || 0), 0);
    

    doc.moveDown().fontSize(12);
    doc.text(`Overall Sales Count: ${overallSalesCount}`);
    // doc.text(`Overall Discount: ${overallDiscount}`);
    // doc.text(`Overall Coupon Offer: ${overallCouponOffer}`);

    const rowHeight = 20; // You can adjust this value based on your preference

    // Calculate the vertical position for each line of text in the row
    const yPos = doc.y + rowHeight / 2;

    // Create a table header
    doc
      .fontSize(12)
      .rect(50, doc.y, 750, rowHeight) // Set a rectangle for each row
      .text("Order ID", 50, yPos)
      .text("Date", 190, yPos)
      .text("Customer", 250, yPos)
      .text("Product Name", 310, yPos) // Added product name to the heading
      .text("Quantity", 400, yPos)
      .text("Total", 450, yPos)
      .text("Status", 480, yPos)
      .text("Payment", 550, yPos);
    doc.moveDown();

    // Loop through fetched orders and products
    for (const order of deliveredOrders) {
      for (let j = 0; j < order.products.length; j++) {
        const currentProduct = order.products[j];

        // Set a fixed height for each row
        const rowHeight = 20; // You can adjust this value based on your preference

        // Calculate the vertical position for each line of text in the row
        const yPos = doc.y + rowHeight / 2;

        // Add the sale report details to the PDF table
        doc
          .fontSize(10)
          .rect(50, doc.y, 750, rowHeight) // Set a rectangle for each row
          .stroke() // Draw the rectangle
          .text(order._id.toString(), 50, yPos)
          .text(order.createdOn.toISOString().split("T")[0], 190, yPos)
          .text(order.user ? order.user.name : "User not available", 250, yPos)
          .text(
            currentProduct.productName || "Product not available",
            310,
            yPos
          ) // Add product name
          .text(currentProduct.quantity.toString(), 400, yPos)
          .text(order.totalPrice.toString(), 450, yPos)
          .text("Delivered", 480, yPos)
          .text(order.payment, 550, yPos);

        // Move to the next row
        doc.moveDown();
      }
    }

    // End the document
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





// const download EXCEL
const downloadExcel = async (req, res) => {
  try {
    const { date } = req.query;
    let query = { status: 'Delivered' };

    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);

      // Correct the field to 'createdOn' for date filtering
      query.createdOn = { $gte: startDate, $lt: endDate };
    }

    // Fetch delivered orders from the database
    const deliveredOrders = await Order.find(query)
      .populate("user")
      .exec();

    // Set headers for the response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sale_report.xlsx"
    );

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sale Report");

    // Add headers to the worksheet
    worksheet.addRow([
      "Order ID",
      "Date",
      "Customer",
      "Product Name",
      "Quantity",
      "Total",
      "Status",
      "Payment Method"
    ]);

    // Iterate over delivered orders and products
    deliveredOrders.forEach(order => {
      order.products.forEach(product => {
        worksheet.addRow([
          order._id.toString(),
          order.createdOn.toISOString().split("T")[0],
          order.user ? order.user.name : "User not available",
          product.productName || "Product not available",
          product.quantity.toString(),
          order.totalPrice.toString(),
          "Delivered",
          order.payment
        ]);
      });
    });

    // Write the Excel workbook to the response
    await workbook.xlsx.write(res);

    // End the response
    res.end();
  } catch (error) {
    console.error("Error downloading Excel:", error);
    res.status(500).send("Internal Server Error");
  }
};




const returnOrder = async (req, res) => {
  try {
    console.log("Entering returnOrder");

    const { productId, orderId } = req.params;
    console.log("Received parameters: productId =", productId, ", orderId =", orderId);

    const productStatus = "Returned";

    const updatedOrder = await Order.updateOne(
      { _id: orderId, "products._id": productId },
      { $set: { "products.$.status": productStatus } }
    );

    console.log("Updated Order:", updatedOrder);
    
    if (updatedOrder) {
      console.log("Entering refund amount calculation");

      const order = await Order.findById(orderId);
      const canceledProduct = order.products.find(
        (product) => product._id.toString() === productId
      );
      

      if (canceledProduct) {
  

        const productQuantity = canceledProduct.quantity;
        const refundAmount = canceledProduct.price * productQuantity;

        const user_id = req.session.user_id;

        const updatedWallet = await Wallet.findOneAndUpdate(
          { user_id: user_id },
          {
            $inc: { balance: refundAmount },
            $push: {
              transactions: {
                amount: refundAmount,
                reason: "return order refund",
                transactionType: "credit",
                date: new Date().toISOString()
              },
            },
          },
          { new: true }
        );

        const updateStock = await Product.findByIdAndUpdate(canceledProduct.product, {
          $inc: { stock: productQuantity },
        });

        console.log("Success! Redirecting to /orderDetails");
        res.status(200).json("/orderDetails");
      }
    }
  } catch (error) {
    console.error("Error in returnOrder:", error.message);
    res.status(500).json("Internal Server Error");
  }
};

const saleChart = async (req, res) => {
  try {
      if (!req.query.interval) {
          console.log('Missing the interval');
          return res.status(400).send('Interval server error is missing');
      }

      // Convert interval to lowercase
      const interval = req.query.interval.toLowerCase();
      console.log(interval);

      let dateFormat, groupByFormat;

      switch (interval) {
          case 'yearly':
              dateFormat = '%Y';
              groupByFormat = {
                  $dateToString: { format: '%Y', date: '$createdOn' }
              };
              break;
          case 'monthly':
              dateFormat = '%m-%Y';
              groupByFormat = {
                  $dateToString: { format: '%m-%Y', date: '$createdOn' }
              };
              break;
          case "daily":
                dateFormat = "%Y-%m-%d";
                groupByFormat = {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdOn" },
                };
                break;
          default:
              console.error("Error: Invalid time interval");
              return res.status(400).json({ error: "Invalid time interval" });
      }

      const salesData = await Order.aggregate([
          {
              $group: {
                  _id: groupByFormat,
                  totalSales: { $sum: '$totalPrice' }
              }
          },
          { $sort: { _id: 1 } }
      ]);

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      const labels = salesData.map((item) => {
          if (interval === 'monthly') {
              const [month, year] = item._id.split('-');
              return `${monthNames[parseInt(month) - 1]} ${year}`;
          }
          return item._id;
      });

      const values = salesData.map((item) => item.totalSales);

      res.json({ labels, values });
  } catch (error) {
      console.error('Internal server error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};
// invoice
const invoice = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const orderId = req.query.id;
    const loggedIn = req.session.user?.id ? true : false;

    const userData = await User.findById(userId); 
    const categoryData = await Category.find({ is_active: false });

    const orderData = await Order.findOne({ _id: orderId, user: userId })
      .populate({
        path: "products",
        model: Product, 
      })
      .populate("address");

    if (!orderData) {
      console.error("Order not found");
      return res.status(404).send("Order not found");
    }

    // Iterate over the product array field in order to access the populated product field
    const populatedProducts = orderData.products.map((product) => product.product);

    res.render("invoice", {
      loggedIn,
      category: categoryData,
      user: userData,
      order: orderData.toObject(),
      products: populatedProducts,
    });
  } catch (error) {
    console.error("Internal server error:", error.message);
    res.status(500).send("Internal server error");
  }
};
// 
// ==================================================================================================================
const saveInvoice = async (req, res) => {
  try {
    const orderId = req.query.id;
    const userId = req.session.user_id;

    // Fetch user details
    const user = await User.findById(userId);

    // Fetch order details including products and address
    const order = await Order.findById(orderId).populate({
      path: 'products',
      select: 'productName price', // Select only necessary fields from product
    });

    if (!order || !user) {
      return res.status(404).json({ error: 'Order or user not found' });
    }

    // Calculate total price
    const totalPrice = order.products.reduce(
      (total, product) => total + product.price ,
      0
    );

    // Create a new PDF document
    const doc = new PDFDocument();

    // Pipe the PDF into the response
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.font('Helvetica').fontSize(15).text('SALE INVOICE', { align: 'center', underline: true }).moveDown(0.5);
    // Company details
    doc.font('Helvetica-Bold').fontSize(20).text('777 Automotive', { align: 'center' }).moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text('Mg Road ', { align: 'center' }).moveDown(0.2);
    doc.font('Helvetica').fontSize(12).text('Kochi, India', { align: 'center' }).moveDown(0.2);
    doc.font('Helvetica').fontSize(12).text('Phone: +1 234-567-8900', { align: 'center' }).moveDown(0.2);
    doc.font('Helvetica').fontSize(12).text('Email: 777automotiveofficial@gmail.com', { align: 'center', underline: true }).moveDown(0.5);

    // User details
    doc.font('Helvetica-Bold').fontSize(16).text('User Details:', { align: 'left' }).moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text(`Name: ${user.username}`, { align: 'left' }).moveDown(0.2);
    // Add more user details as needed

    // Address details
    doc.font('Helvetica-Bold').fontSize(16).text('Address:', { align: 'left' }).moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text(`City: ${order.address.city}`, { align: 'left' }).moveDown(0.2);
    doc.font('Helvetica').fontSize(12).text(`Zip Code: ${order.address.zipCode}`, { align: 'left' }).moveDown(0.2);
    doc.font('Helvetica').fontSize(12).text(`Street Address: ${order.address.streetAddress}`, { align: 'left' }).moveDown(0.5);

  // Order details
// Order details
    doc.font('Helvetica-Bold').fontSize(16).text('Order Details:', { align: 'left' }).moveDown(0.5);
    for (const item of order.products) {
  // Fetch product details from the Product collection using its ID
     const product = await Product.findById(item.product);

  // Check if product exists
    if (!product) {
    console.error('Product not found for ID:', item.product);
    continue; // Skip this item if product not found
  }

  doc.font('Helvetica').fontSize(12).text(`${item.quantity}x ${product.productName} `, { align: 'left' }).moveDown(0.2);
}

    // Total amount
    doc.font('Helvetica-Bold').fontSize(16).text(`Total Price: $${totalPrice}`, { align: 'left' }).moveDown(0.5);

    // Thank you message
    doc.font('Helvetica').fontSize(14).text('Thank you for your purchase!', { align: 'center' }).moveDown(0.5);

    // Finalize the PDF and end the response
    doc.end();
  } catch (error) {
    console.error('Error generating invoice:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


  module.exports={
    orderCompleteLoad,
    orderComplete,
    cancelOrder,
    adminCancelOrder,
    adminOrderDetails,
    adminOrderManagement,
    adminStatusChange,
    orderDetails,
    returnOrder,
    generateOrderRazorpay,
    saleReportPage,
    downloadExcel,
    downloadPdf,
    saleChart,
    continuePayment,
    saveInvoice,
    invoice,
    failedOrder

  }
  