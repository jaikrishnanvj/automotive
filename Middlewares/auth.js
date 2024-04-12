

const isLogin = (req, res, next) => {
    try {
        if (req.session.isAuth) {

            next();
        } else {
            res.redirect("/login"); 
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}
// const User = require("../Models/userModel");
// const isLogin = async(req,res,next)=>{
//     try {

//         if (req.session.user_id) {
//             console.log(req.session.user_id);
//             const userData = await User.findById(req.session.user_id);

//             if (userData && userData.is_blocked) {
//                 delete req.session.user_id;
//                 res.redirect("/register")
//             } else {
//                 next();
//             }
            
//         } else {
//             res.redirect("/register")
//         }
        
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const isLogout = (req, res, next) => {
//     try {
//         if (!req.session.isAuth && !req.session.isAdminAuth) {
//             next();
            
//         } else {
//             if (req.session.isAuth) {
//                 res.redirect("/home"); // Redirect to home if already logged in
//             } else if(req.session.isAdminAuth) {
//                 res.redirect("/admin"); // Redirect to admin page if already logged in as admin
//             }
//         }
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send("Internal Server Error");
//     }
// }

const isLogout = (req, res, next) => {
    if (!req.session.isAuth && !req.session.isAdminAuth) {
        next();
    } else {
        if (req.session.isAuth) {
            res.redirect("/home"); // Redirect to home if already logged in
        } else if(req.session.isAdminAuth) {
            res.redirect("/admin"); // Redirect to admin page if already logged in as admin
        }
    }
};


module.exports = {
    isLogin,
    isLogout
};
