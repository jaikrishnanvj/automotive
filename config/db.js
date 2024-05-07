const { urlencoded } = require("body-parser")
const mongoose=require("mongoose")
const connectdb= ()=> {
    
    mongoose.connect(process.env.MONGO_URI)
}
module.exports=connectdb

