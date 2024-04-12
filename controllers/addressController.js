const products=require("../Models/ProductModel")
const User=require("../Models/userModel")
const Category=require("../Models/categoryModel")
const Address=require("../Models/addressModel")
const bcrypt=require("bcrypt")
const Order = require("../Models/orderModel");
const Wallet=require('../Models/walletModel')

const profilePage=async(req,res)=>{
    try {
        
    const walletData = await Wallet.findOne({ user_id: userId });

    // Sort transactions in descending order based on date
    walletData.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        const userId=req.session.user_id;
        const userData=await User.findById({_id:userId})
        const addressData= await Address.findById({_id:userId})
        const orderData= await Order.find({user:userId}).sort({createdOn:-1})
        const loggedIn=req.session.user_id ? true : false
        

        const categoryData= await Category.find({is_active:false})

        res.render('account',{
            loggedIn,
            category:categoryData,
            user:userData,
            order:orderData,
            address:addressData,
            wallet: walletData,
        })
    } catch (error) {
        res.status(500).send("internal server error ,pls try agian later")

    }
}

const addAddress= async(req,res)=>{
 try{ 
    
    console.log(req.body);
    const fullName=req.body.fullName
    const mobile=req.body.mobile
    const region=req.body.region
    const pinCode=req.body.pinCode
    const addressLine = req.body.addressLine;
    const areaStreet = req.body.areaStreet;
    const landmark = req.body.landmark;
    const townCity = req.body.townCity;
    const state = req.body.state;
    const adressType = req.body.addressType;
    const userId = req.session.user_id;
    const newAddress = new Address({
        fullName: fullName,
        mobile: mobile,
        region: region,
        pinCode: pinCode,
        addressLine: addressLine,
        areaStreet: areaStreet,
        landmark: landmark,
        townCity: townCity,
        state: state,
        adressType: adressType,
        user_id: userId,
      });
      await newAddress.save()
      res.redirect("/account")
}
catch(error){
    console.log(error);
    res.status(500).send("internal server error,pls try agian later")

}
}

const deleteAddress = async (req, res) => {
    try {
       
        const addressId = req.query.id;
        console.log(addressId)
        if (!addressId) {
            throw new Error("Address ID is missing");
        }
        // Assuming addressId is in the format 'id=addressId', we split it at '=' and take the second part as the address ID.
       
        await Address.findByIdAndDelete(addressId);
        console.log("Deleted successfully");
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// const AddAddress=async(req,res)=>{
//     try {
//         const userId = req.session.user_id;
//         const user = await User.findById(userId); // Assuming you fetch the user data here
//         const address = await Address.findById(userId);
//         // Other necessary logic for rendering the add address page
//         const order = await Order.find({ user: userId }).sort({ createdOn: -1 });

//         res.render('AddAddress', { user: user,address: address,order: order });
//     } catch (error) {
//         res.status(500).send("Internal server error, please try again later");
//     }
// }
const editAddress=async(req,res)=>{
    try {

        const id=req.query.id
        
        const addressData= await Address.findById({_id:id})
        const loggedIn=req.session.user_id ?true:false
        // const categoryData=await Category.find({is_active:false})
        res.render("editAddress",{ loggedIn,address:addressData,_id:id})
    } catch (error) {
        res.status(500).send("internal server errorr")        
    }
}



const editAddressSave = async (req, res) => {
    try {
      const addressData = await Address.findByIdAndUpdate(
        { _id: req.body._id },
        {
          $set: {
            fullName: req.body.fullName,
            mobile: req.body.mobile,
            region: req.body.region,
            pinCode: req.body.pinCode,
            addressLine: req.body.addressLine,
            areaStreet: req.body.areaStreet,
            landmark: req.body.landmark,
            townCity: req.body.townCity,
            state: req.body.state,
            adressType: req.body.addressType,
          },
        }
      );
      if (addressData) {
        res.redirect("/account");
      }
    } catch (error) {
      res.status(500).send("Internal Server Error. Please try again later.");
    }
  };
//    User profile area-----------------
//   const editProfile=async(req,res)=>{
//     try {
//         const  id=req.query.id
//         const userData=await User.findById({_id:id})
//         const loggedIn= await req.session.user_id? true:false
//         const categoryData=await Category.find({is_active:false})

//         res.render('editprofile',{
//             loggedIn,
//             category:categoryData,
//             user:userData
//         })
//     } catch (error) {
//         res.status(500).send("internal server errors")
//     }
//   }
  
//   const updateUser = async (req, res) => {
//     try {
//         console.log("ENTERED THE FUNCTION");
//         console.log(req.body);
        
//         const id = req.session.user_id; // Assuming user ID is stored in the session under 'userId'
//         console.log("User ID:", id);
        
//         const user = await User.findById(id);
        
//         if (!user) {
//             console.error('User not found for ID:', id);
//             return res.status(404).send('User not found');
//         }
        
//         const updateFields = {}; // Object to store fields to be updated
        
//         // Check if name is provided and update it if so
//         if (req.body.name) {
//             updateFields.name = req.body.name;
//         }
        
//         // Check if mobile is provided and update it if so
//         if (req.body.mobile) {
//             updateFields.mobile = req.body.mobile;
//         }
        
//         // Check if new password is provided and update it if so
//         if (req.body.npassword && req.body.cpassword) { // Update field names here
//             if (req.body.npassword !== req.body.cpassword) {
//                 return res.status(400).send('New password and confirm password do not match');
//             }
            
//             const saltRounds = 10; // Define salt rounds
            
//             try {
//                 const newPasswordHash = await bcrypt.hash(req.body.npassword, saltRounds); // Update field name here
                
//                 updateFields.password = newPasswordHash;
//             } catch (error) {
//                 // console.error('Error hashing new password:', error.message);
//                 return res.status(500).send('Error hashing new password');
//             }
//         }
        
//         await User.findByIdAndUpdate(id, { $set: updateFields });
        
//         return res.redirect("/account");
//     } catch (error) {
//         console.error('Error:', error.message);
//         return res.status(500).send('Internal Server Error');
//     }
// };
// const updateUser = async (req, res) => {
//     try {
//         console.log("ENTERED THE FUNCTION");
//         console.log(req.body);
        
//         const id = req.body.id;
//         const user = await User.findById(id);
        
//         if (!user) {
//             throw new Error('User not found');
//         }
        
//         // Check if current password matches only if it is provided
//         if (req.body.password !== "") {
//             const passwordMatch = await bcrypt.compare(req.body.password, user.password);
//             if (!passwordMatch) {
//                 throw new Error('Current password is incorrect');
//             }
//         }
        
//         // Prepare update fields
//         const updateFields = {
//             name: req.body.name, // Change 'firstName' to 'name'
//             mobile: req.body.mobile
//         };
        
//         // Update password only if new password is provided
//         if (req.body.npassword !== "" && req.body.cpassword !== "") {
//             if (req.body.npassword !== req.body.cpassword) {
//                 throw new Error('New password and confirm password do not match');
//             }
            
//             const spassword = await bcrypt.hash(req.body.npassword, 10);
//             updateFields.password = spassword;
//         }
        
//         await User.findByIdAndUpdate(id, { $set: updateFields });
        
//         res.redirect("/account");
//     } catch (error) {
//         console.error('Error:', error.message);
//         const loggedIn = req.session.user_id ? true : false;
//         const categoryData = await Category.find({ is_active: false });
//         const userDetail = await User.findById(id);
//         res.render("editprofile", {
//             loggedIn,
//             Category: categoryData,
//             message: error.message,
//             user: userDetail
//         });
//     }
// };
const editProfile = async(req,res)=>{
    try {
       const user_id = req.query.id
       const userData = await User.findById( user_id )
       const loggedIn = req.session.isAuth ? true : false
       const addressData = await Address.findOne({ user_id : user_id })
       
       res.render("editProfile",{
        user : userData,
        loggedIn,
        address : addressData
       })

    } catch (error) {
        console.log(error.message);
    }
}

const updateEditProfile = async(req,res)=>{
    try {
        const { id } = req.query

        const {
            username,
            email,
            mobile,
        } = req.body
      
        const userData = await User.findByIdAndUpdate(
            id,
            {
                username,
                email,
                mobile
            },
            { new : true }
        )
        if (userData) {
            res.redirect("/account")
        }else{
            res.json({ message: " user not found... " })
        }

    } catch (error) {
        console.log(error.message);
    }
}
// .password
const loadeditPassword = async(req,res)=>{
    try {
        const user_id = req.session.user_id;
        const userData = await User.findById(user_id)
        const loggedIn = req.session.isAuth ? true : false

        res.render("editPassword",{
            user : userData,
            loggedIn
        })
    } catch (error) {
        console.log(error.message);
    }
}
// const editUserPassword = async(req,res)=>{
//  try{ 
//         const { id } = req.query
//         const { password , newPassword } = req.body
        
//         const  user = await User.findById(id)

//         if (!user) {
//             res.json({ success : false , message:"user not found" })
//         }
//         const passwordMatch = await bcrypt.compare(
//             password,
//             user.password
//         )
//         if (passwordMatch) {
//             const newPassword = req.body.npassword;
//             const confirmPassword = req.body.cpassword;
            
//             if (newPassword !== confirmPassword) {
//                 throw new Error('New password and confirm password do not match');
//             }
            
//             const updatedPass = await bcrypt.hash(newPassword, 10);
            
//             await User.findByIdAndUpdate(id, {
//                 $set: {
//                     name: req.body.name,
//                     mobile: req.body.mobile,
//                     password: updatedPass
//                 }
//             });
            
//             res.redirect("/account");
//         } else {
//             const loggedIn = req.session.user_id ? true : false;
           
//             const userDetail = await User.findById(id);

//             res.render("editpassword", {
//                 loggedIn,
               
//                 message: 'Current password is incorrect',
//                 user: userDetail
//             });
        
//          }
//         } catch (error) {
//                 console.log(error.message);
//                 res.status(500).json({ error: false,  message: "An error occurred on the server" });
//             
//         }
//     }
            
const editUserPassword = async (req, res) => {
    try {
        // const { id } = req.query;
        // const { currentPassword, newPassword } = req.body;
        //  const id=req.session.user_id
        // // Find the user by ID
        // const user = await User.findById(id);

        const id = req.body.id;
        const user = await User.findById(id);
       
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        console.log(passwordMatch);
        if (passwordMatch) {
            const newPassword = req.body.npassword;
            const confirmPassword = req.body.cpassword;
            
            if (newPassword !== confirmPassword) {
                throw new Error('New password and confirm password do not match');
            }
            
            const spassword = await bcrypt.hash(newPassword, 10);
            
            await User.findByIdAndUpdate(id, {
                $set: {
                    name: req.body.name,
                    mobile: req.body.mobile,
                    password: spassword
                }
            });
            
            res.redirect("/account");
        } else {
            const loggedIn = req.session.user_id ? true : false;
            const categoryData = await Category.find({ is_active: false });
            const userDetail = await User.findById(id);

            res.render("editPassword", {
                loggedIn,
                Category: categoryData,
                message: 'Current password is incorrect',
                user: userDetail
            });
        }
      } catch (error) {
  
        console.error(error.message);
        return res.status(500).json({ success: false, message: "An error occurred on the server" });
    }
};

// const editUserPassword = async (req, res) => {
//     try {
//         // const { id } = req.query;
//         // const { currentPassword, newPassword } = req.body;
//         //  const id=req.session.user_id
//         // // Find the user by ID
//         // const user = await User.findById(id);

//         const id = req.body.id;
//         const user = await User.findById(id);
//         console.log(currentPassword,"ssssssss");
//         console.log(newPassword,"new password");
        
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         const passwordMatch = await bcrypt.compare(req.body.password, user.password);
//         console.log(passwordMatch);
//         if (passwordMatch) {
//             const NewHashedPassword = await bcrypt.hash(newPassword , 10)
//             user.password = NewHashedPassword
//             const updatedPass = await user.save()
          
//               if (updatedPass) {
//               res.json({ success : true , message :" password successfully Updated... " })
//               }
//           }else{
//               res.status(400).json({ success : false , message:"Current Password is Incorrect" })
//           }
  
//       } catch (error) {
  
//         console.error(error.message);
//         return res.status(500).json({ success: false, message: "An error occurred on the server" });
//     }
// };




// addressAdd

const addressAdd=async(req,res)=>{
    try {
        res.render('addressAdd')
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
        
    }
}



  module.exports={
    addAddress,
    profilePage,
    deleteAddress,
    editAddress,
    editAddressSave,
    editProfile,
    updateEditProfile,
    addressAdd,
    editUserPassword,
    loadeditPassword
    
  }