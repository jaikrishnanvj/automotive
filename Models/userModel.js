const mongoose = require("mongoose");
const shortid = require("shortid");
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        required: true
    },
    is_blocked:{
        type:Boolean,
        default:0,
        required:true
    },
    createdAt: {
        type: Date, // corrected type name
        default: Date.now, // corrected syntax
      },
    referralCode: {
        type: String,
        unique: true,
      },
});
// Automatically generate a referral code before saving a new user
userSchema.pre("save", function (next) {
    // Only generate a referral code if it doesn't exist yet
    if (!this.referralCode) {
      this.referralCode = shortid.generate();
    }
    next();
  });
  

module.exports = mongoose.model("User", userSchema);
