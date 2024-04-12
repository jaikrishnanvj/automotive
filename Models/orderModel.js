const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
const oderSchema = new mongoose.Schema({
  productName:{
    type:String,
    required:false
},
  totalPrice: {
    required: false,
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the Address model
    required: true,
  },
  createdOn: {
    required: true,
    type: Date,
    default: Date.now,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        required: true,
        default: "confirmed",
      },
    },
  ],
  payment: {
    required: true,
    type: String,
  },
  status: {
    required: false,
    type: String,
  },
  address: {
    city: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    streetAddress: {
      type: String,
      required: true,
    },
  },
});

//Export the model
module.exports = mongoose.model("Order", oderSchema);
    