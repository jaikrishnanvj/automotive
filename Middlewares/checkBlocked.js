const userSchema=require('../Models/userModel')
const checkBlocked = async (req, res, next) => {
    try {
        
        const userId = req.session.user_id;

        const user = await userSchema.findById(userId);

        if (user && user.is_blocked) {
            req.session.userLogin = false;
            const message="You are temporarily blocked"
            // Redirect to the login page with a query parameter for the blocked message
            return res.render('registration',{message})
        }

        next();
    } catch (error) {
        console.error('Error in checkBlocked middleware:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = checkBlocked;