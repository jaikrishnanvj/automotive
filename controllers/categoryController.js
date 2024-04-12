
const Category = require("../Models/categoryModel")
const User = require("../Models/userModel")
const Product=require('../Models/ProductModel')

//====================create it and update into database======================================//
const addNewCategory = async(req,res)=>{
    try {
        const formData = req.body;
        const selectedList = req.body["list-unlist"];
        const categoryName = formData.categoryName;
        const listed = selectedList === "list"? true : false;
        const category = new Category({
            categoryName,
            listed,
        });
        await category.save()

        res.json({
            success:true,
            message:"Category Added Successfully...",
            newCategory : category
        })
  
    } catch (error) {
        console.log(error.message);
    }
}

//=============================edit category============================================//
const editCategory = async(req,res)=>{
    try {

        const { id } = req.query

        const category = await Category.findById({_id : id})

        if (category) {
            res.render("edit-category",{
                title:"Edit Category",
                category
            })
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
//=============================delete Category=======================================//
const deleteCategory = async(req,res)=>{
    try {

        const { id } = req.query
        req.session.categoryId = id;

        const categoryData = await Category.deleteOne({ _id : id })
        if (categoryData.deletedCount > 0) {
            res.json({success : true , message:"Category deleted Successfully..."})
        }else{
            res.json({success : false , message:"Category Not found...!"})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
//=========================edit and update in Database========================================//
const updateCategory = async (req, res) =>  {
    try {
      const { categoryName, categoryId } = req.body;
      const categoryLower = (categoryName || "").trim().toLowerCase();
  
      // Check if the categoryName is not empty
      if (categoryName.trim() !== "") {
        const selectedList = req.body["list-unlist"];
        const listed = selectedList === "list" ? true : false;
  
        const existingCategory = await Category.findOne({
          categoryName: { $regex: new RegExp(categoryLower, "i") },
          _id: { $ne: categoryId },
        });
  
        if (existingCategory) {
          return res
            .status(409)
            .json({ error: "Category with this name already exists." });
        } else {
          // categoryName is not empty, proceed with the update
          const updatedCategory = await Category.findByIdAndUpdate(
            { _id: categoryId },
            {
              categoryName,
              listed,
            },
            { new: true }
          );
  
          if (updatedCategory) {
            return res.status(200).json({
              success: true,
              message: "Category edited successfully",
              data: updatedCategory,
            });
          }
        }
      } else {
        // categoryName is empty, return a 400 response
        return res.status(400).json({ error: "Fields cannot be empty" });
      }
    } catch (error) {
      console.error("Error in updateCategory:", error.message);
      return res.status(500).json({ error: "Internal Server Error"});
        }
  };

  // add category offer

  const addCategoryOffer = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const offerPercentage = req.body.offer;

        // Find the category by its ID
        const categoryData = await Category.findById(categoryId);

        if (!categoryData) {
            return res.status(404).json({ 
                success: false,
                message: "Category not found.",
            });
        }

        // Update the categoryOffer field and save the changes
        categoryData.categoryOffer = offerPercentage;
        await categoryData.save();

        // Find products belonging to the category
        const productData = await Product.find({ category: categoryId });

        // Apply offer to each product
        for (const product of productData) {
            // Calculate the sale price without decimals
            product.salePrice = product.salePrice - Math.floor(product.regularPrice * (offerPercentage / 100));
            await product.save();
        }

        // Send success response
        res.status(200).json({ 
            success: true,
            message: "Category offer updated successfully.",
        });
    } catch (error) {
        // Handle errors
        console.error("An error occurred:", error);
        res.status(500).json({ 
            success: false,
            message: "An error occurred while updating category offer.",
        });
    }
};

  // remove category offer
  const removeCategoryOffer = async (req, res) => {
    try {
      const { categoryId } = req.body;
  
      const categoryData = await Category.findById(categoryId);
  
      const productData = await Product.find({ category: categoryId });
  
      const offerPercentage = categoryData.categoryOffer;
  
      if (productData.length > 0) {
        for (const product of productData) {
          // Calculate the sale price without decimals
          product.salePrice =
            product.salePrice +
            Math.floor(product.regularPrice * (offerPercentage / 100));
  
          await product.save();
        }
        categoryData.categoryOffer = 0;
        await categoryData.save();
      }
  
      res.status(200).json({
        success: true,
        // Note: The next line may not work as expected, consider revising
        salePrice: productData[0].salePrice, // Use index 0 to get the first product's salePrice
        message: "Offer removed successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  };
  




//=========================load category management=====================================//
const loadCategoryManagement = async(req,res)=>{
    try {
        const user = await User.find({is_admin:false})
        const category = await Category.find({})
        res.render("categoryManagement",{
            user,
            title:"Category Management",
            category
        })
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    addNewCategory,
    editCategory,
    deleteCategory,
    updateCategory,
    loadCategoryManagement,
    addCategoryOffer,
    removeCategoryOffer
}