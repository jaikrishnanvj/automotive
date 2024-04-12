// const isLogin = async(req,res,next)=>{
//     try {
//         if (req.session.isAdminAuth) {
//             next()
//         } else {
//             res.redirect("/register")
//         }
        
//     } catch (error) {
//         console.log(error.message);
//     }
// }
// const isLogout = async (req, res, next) => {
//     try {
        
//         req.session.isAdminAuth = false;
//         console.log("In admin logout");

      
//         res.redirect('/register');
//     } catch (error) {
//         console.log(error.message);
//     }
// };

// module.exports = {
//     isLogin,
//     isLogout
// }

const isLogin = async(req, res, next) => {
    try {
        if (req.session.isAdminAuth) {
            next();
        } else {
            res.redirect("/login"); // Redirect to login page if not authenticated
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error. Please try again later.");
    }
};

const isLogout = async (req, res, next) => {
    try {
        // Clear isAdminAuth when the admin logs out
        req.session.isAdminAuth = false;
        console.log("In admin logout");

        // Redirect to login page after logout
        res.redirect('/login');
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error. Please try again later.");
    }
};

module.exports = {
    
    isLogin,
    isLogout
};