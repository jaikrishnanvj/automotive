const User = require('../Models/userModel');
const bcrypt = require('bcrypt');
const session = require('express-session');
const nodemailer = require('nodemailer')
const Address=require('../Models/addressModel');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const Order = require("../Models/orderModel");
const products=require('../Models/ProductModel')
const Wallet=require('../Models/walletModel')
const Category=require('../Models/categoryModel')
const Cart=require('../Models/cartModel')

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash

    }
    catch (error) {
        console.log(error.message);
    }

}


const loadLogin = async (req, res) => {
    try {
      
        res.render("registration", { message: 'Successfully signed in ', errMessage: '' });
    } catch (error) {
        console.log(error.message);
    }
}
const loadOtp = async (req, res) => {
    try {
        res.render("otp", { message: 'Successfully signed in', errMessage: '' })
    }
    catch (error) {
        console.log(error.message);
    }
}
// ---------------------------------------insertuser--------------------------------------------------------
const insertUser = async (req, res) => {
    try {
        console.log('ddd');
        const { username, email, mobile, password } = req.body;
        req.session.tempUser = { username, email, mobile, password };
        console.log(req.session.tempUser);
        const existname = await User.findOne({ username: username })
        const existEmail = await User.findOne({ email: email })

       if (!existname) {
    if (!existEmail) {
        await emailVerification(email);
        res.redirect("/otp");
    } else {
        setTimeout(() => {
            res.render('registration', { message: "" }); // Clearing the error message after 5 seconds
        }, 5000); // 5 seconds timeout
        res.render('registration', { message: "Email Already Exists..." });
    }
} else {
    setTimeout(() => {
        res.render("registration", { message: "" }); // Clearing the error message after 5 seconds
    }, 5000);
    res.render('registration', { message: "Username Already Exists..." });
}

        
//         if (!existname) {
//     if (!existEmail) {
//         await emailVerification(email);
//         res.json({ success: true, redirectTo: "/otp" }); // Send success JSON response
//     } else {
//         res.status(400).json({ success: false, message: "Email Already Exists..." }); // Send error JSON response
//     }
// } else {
//     res.status(400).json({ success: false, message: "Username Already Exists..." }); // Send error JSON response
// }

    } catch (error) {
        console.log(error.message);
        // Handle the error and send an appropriate response
        res.status(500).send("Internal Server Error");
    }
}
// ===================================otp confirmation============================================================
const otpConfirm = async (req, res) => {
    try {
       
       let wallet;
        const { otp } = req.body;
        console.log("User entered OTP:", otp);
        console.log("Temporary User Data:", req.session.tempUser);

        if (otpVal === otp) {
            console.log("OTP verification successful");
            const { username, email, mobile, password } = req.session.tempUser;

            try {
                const hashedPassword = await securePassword(password);
                const newUser = new User({
                    username,
                    email,
                    mobile,
                    password: hashedPassword,
                    is_admin: false
                });

                const userData = await newUser.save();

                if (userData) {
                    wallet= new Wallet({
                        user_id:userData._id,
                        balance:0,
                        transactions:[],
                    })

                    const walletData= await wallet.save()
                    if(walletData){
                        const refereeName= await User.findOne({referralCode:referralCode,})
                        if (refereeName) {
                            // Update the referee's wallet
                            const updatedWallet = await Wallet.findOneAndUpdate(
                              { user_id: refereeName._id },
                              {
                                $inc: { balance: 500 },
                                $push: {
                                  transactions: {
                                    amount: 500,
                                    transactionType: "credit",
                                    date: new Date(),
                                  },
                                },
                              },
                              { new: true }
                            );
                
                            // Further logic if needed based on the updatedWallet
                          }
                        }
                      
                    console.log("User created successfully");
                    req.session.user_id = userData._id;
                    return res.redirect("/home");
                } else {
                    console.log("Failed to create user");
                    return res.render("registration", { message: "Failed to create user" });
                }
            } catch (error) {
                console.log("Error while creating user:", error.message);
                return res.status(500).send("Internal Server Error");
            }
        } else {
            console.log("Incorrect OTP provided");
            return res.render("otp", { message: "Incorrect OTP provided", errMessage: "" });
        }
    } catch (error) {
        console.log("Error in otpConfirm function:", error.message);
        return res.status(500).send("Internal Server Error");
    }
};


// ==================================email verification=======================================

var otpVal = Math.floor(Math.random() * 10000).toString();

const emailVerification = async (email) => {
    try {
        console.log("entering to otp send")

        //   otpCache[email] = otpVal;

        console.log(otpVal);
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.OTP_EMAIL,
                pass: process.env.OTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        let mailOptions = {
            from: process.env.OTP_EMAIL,
            to: email,
            subject: "Your Email Verification Code is shared herewith....",
            text: otpVal,
        };

        let info = await transporter.sendMail(mailOptions);
        console.log(info);
    } catch (error) {
        res.status(500).send("Internal Server Error. Please try again later.");
    }
};
// =========================================verify login===========================================
const verifyLogin = async (req, res) => {
    try {
        console.log('Attempting login for:', req.body.email);
        const email = req.body.email;
        const password = req.body.pass;

        const userData = await User.findOne({ email: email });
        console.log('Retrieved user data:', userData);

        if (userData) {
            // Check if user exists
            if (userData.password) {

                console.log(password)

                // Check if password is available
                const passwordMatch = await bcrypt.compare(password, userData.password);
                console.log(passwordMatch)
                if (passwordMatch) {

                    if (userData.is_blocked) {
                        res.render('registration', { message: 'User is blocked' })
                    } else {

                        if (userData.is_admin) {
                            req.session.isAdminAuth = true;

                            return res.redirect("/admin");
                        } else {
                            // Successful login
                            req.session.user_id = userData._id;
                            req.session.isAuth = true;
                            return res.redirect("/home");

                        }
                    }

                } else {
                  
                    console.log('Incorrect password.');
                    return res.render('registration', { message: 'Email or password is incorrect' });

                    // res.status(500).json({message: 'Email or password is incorrect'})
                }
            } else {
                // Password not available
                console.log('Password not available.');
                return res.render('registration', { message: 'Password is not set for this account' });
            }
        } else {
            // User not found
            console.log('User not found.');
            return res.render('registration', { message: 'User not found' });
        }
    } catch (error) {
        console.log('Error in login:', error.message);
        return res.status(500).send('Internal Server Error');
    }
};



//===================================== Resend OTP======================================================
// Define a variable to store the timestamp of the last OTP sent
// Define a variable to store the timestamp of the last OTP sent
// Define a variable to store the timestamp of the last OTP sent

let lastOtpSentTime = "";

const resendOTP = async (req, res) => {
    try {
        console.log("In resendotp");
        const { email } = req.session.tempUser || {}; 
        console.log("Email", email);

        // Check if 1 minute has passed since the last OTP resend
        const currentTime = Date.now();
        if (lastOtpSentTime && currentTime - lastOtpSentTime < 60000) {
            const remainingTime = Math.ceil((60000 - (currentTime - lastOtpSentTime)) / 1000);
            return res.status(400).json({ remainingTime }); // Send remaining time in response
        }

        if (email) {
            await emailVerification(email);
            lastOtpSentTime = currentTime; // Update lastOtpSentTime
            res.redirect("/otp");
        } else {
            // Handle the case where email is not found in tempUserData
            res.status(400).send("Email not found in session data");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};









// -------------------------------------------------load home----------------------------------------


const loadHome = async (req, res) => {
    try {
        user_id=req.session.user_id
        const cartItemsCount = await Cart.countDocuments({ user_id });
        console.log("HOME ENTER")
        res.render('home', { message: '',cartItemsCount:cartItemsCount, errMessage: '' })
    } catch (error) {
        console.log(error.message);

    }
}
// ----------------------about------------------------

const about = async (req, res) => {
    try {
        res.render('about')
    } catch {
        console.log(error.message);
    }
}
const loadCart = async (req, res) => {
    try {
        res.render('cart')
    } catch (error) {
        console.log(error.message);

    }
}

const loginLoad = async (req, res) => {
    try {
        res.render('registration', { message: ' ', errMessage: '' })
    } catch (error) {
        console.log(error.message);
    }

}

// --------------------------contact----------------------

const contact = async (req, res) => {
    try {
        res.render('contact')
    }
    catch {
        console.log(errror.message);
    }
}
// ------------appoinment---------------
const appointment = async (req, res) => {
    try {
        res.render('appointment')
    } catch (error) {
        console.log(error.message);

    }
}
// ==================userLogout====================================

const userLogout = async (req, res) => {
    try {
        req.session.destroy(function (err) {
            if (err) {
                console.log(err);
                res.status(500).send("Error occurred during logout");
            } else {
                res.redirect("/login");
            }
        });
    } catch (error) {
        console.log(error.message);
    }
}
// ===============================ACCOUNT======================================


// const account = async (req, res) => {
//     try {
//         const userId = await User.findById(req.session.user_id);
//         const orderData = await Order.find({ user: userId }).sort({ createdOn: -1 });
//         const addressData = await Address.find({ user_id: userId._id });
//         const orderId = req.query.id;
//         const productsData = await products.find({ user_id: orderId }); // Renaming to avoid conflict with variable name
//         let walletData = await Wallet.findOne({ user_id: userId });

//         // Check if walletData is null or transactions property is null
//         if (!walletData || !walletData.transactions) {
//             // If walletData or transactions is null, initialize walletData.transactions to an empty array
//             walletData = { transactions: [] };
//         } else {
//             // Sort transactions if they exist
//             walletData.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
//         }

//         res.render('account', { address: addressData, user: userId, order: orderData, products: productsData, wallet: walletData });
//     } catch (error) {
//         console.log(error.message);
//     }
// }
const account = async (req, res) => {
    try {
        const userId = await User.findById(req.session.user_id);
        const currentPage = parseInt(req.query.page) || 1;
        const perPage = 10; // Adjust the number of items per page as needed
        const orderId = req.query.id;

        // Pagination for orderData
        const orderCount = await Order.countDocuments({ user: userId });
        
        const totalPagesOrder = Math.ceil(orderCount / perPage);
        const orderData = await Order.find({ user: userId })
                                    .sort({ createdOn: -1 })
                                    .skip((currentPage - 1) * perPage)
                                    .limit(perPage);

        // Pagination for productsData

        const productsCount = await products.countDocuments({ user_id: userId });
        const totalPagesProducts = Math.ceil(productsCount / perPage);
        const productsData = await products.find({ user_id: orderId })
                                            .skip((currentPage - 1) * perPage)
                                            .limit(perPage);

        const addressData = await Address.find({ user_id: userId._id });
        
        let walletData = await Wallet.findOne({ user_id: userId });

        // Check if walletData is null or transactions property is null
        if (!walletData || !walletData.transactions) {
            // If walletData or transactions is null, initialize walletData.transactions to an empty array
            walletData = { transactions: [] };
        } else {
            // Sort transactions if they exist
            walletData.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        res.render('account', { 
            address: addressData, 
            user: userId, 
            order: orderData, 
            products: productsData, 
            wallet: walletData, 
            totalPagesOrder: totalPagesOrder, 
            totalPagesProducts: totalPagesProducts, 
            currentPage: currentPage 
        });
    } catch (error) {
        console.log(error.message);
    }
}

// filterproductbycategory
// const filterProductsByCategory = async (req, res) => {
//     try {
//         let productQuery = {};
//         const priceRange = req.query.priceRange;
//         const categoryData=await Category.find({})
//         if (priceRange) {
//             const [minPrice, maxPrice] = priceRange.split('-');
//             productQuery = {
//                 saleprice: {
//                     $gte: Number(minPrice),
//                     $lte: Number(maxPrice)
//                 }
//             };
//         }

//         // Assuming you have a model named "Product", you can use it to find products
//         const filteredProducts = await products.find(productQuery);

//         // Send the filtered products as a response
//         res.render('shop', { products: filteredProducts ,category:categoryData});
//     } catch (error) {
//         // Handle errors
//         console.error('Error filtering products by category:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };




// forgot password
const forgetPassEmailVerifyPageLoad=async(req,res)=>{
    try {
        const loggedIn=req.session.user_id?true:false
        res.render('forgetPassEmailVerify',{loggedIn})
    } catch (error) {
        console.log(error.message);
        
    }
}

const verifyEmail=async(req,res)=>{
    try {
        const loggedIn=req.session.user_id? true:false
        const email=req.body.email
        const userData=await User.findOne({email:email})

        if(!userData){
            res.render("forgetPassEmailVerify",{
                loggedIn,
                message:'emmail not found'
            })}
            else{
                req.session.userEmail=email
                await emailVerification(email)
                res.redirect('/forgetPassVerifyOtp')
            }
        }
      

     catch(error){
        console.error(error);
        res.status(500).send('invalid Server error')
    }
}
const forgetPassVerifyOtp=async(req,res)=>{
    try {
        const loggedIn=req.session.user_id?true:false
        res.render(
            'forgetPassOtpPage',{
                loggedIn
            }
        )
    } catch (error) {
        res.status(500).send('invalid server error')
    }
}

const verifyOtp=async(req,res)=>{
    try {
        const loggedIn=req.session.user_id?true:false
        const otpCode=req.body.otpCode

        if(otpVal==otpCode){
            res.render('changePassword',{loggedIn})
        }else{
            res.render('forgetPassOtpPage',{
                loggedIn,
                message:'otp is incorrect'
            })
        }
        } catch (error) {
            res.status(500).send('invalid server error')
        
    }
}
const changePassword=async(req,res)=>{
    try {
        const newPassword=req.body.newPassword
        const hashedNewPassword=await bcrypt.hash(newPassword,10)
        const email=req.session.userEmail
        const userData=await User.findOne({email:email})
        userData.password=hashedNewPassword
        const updatePass= await userData.save()

        if(updatePass){
            res.redirect('/login')
        }
    } catch (error) {
        res.status(500).send('invalid server error')
    }
}
// =================shop=======================

module.exports = {
    loadLogin,
    insertUser,
    loadOtp,
    otpConfirm,
    emailVerification,
    resendOTP,
    loginLoad,
    verifyLogin,
    loadHome,
    about,
    loadCart,
    userLogout,
    contact,
    appointment,
    account,
    forgetPassEmailVerifyPageLoad,
    verifyEmail,
    forgetPassVerifyOtp,
    verifyOtp,
    changePassword,
 
};
