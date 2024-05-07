const Product = require('../Models/ProductModel')
const Category =require("../Models/categoryModel")
const fs = require("fs")
const Order = require("../Models/orderModel");
const categorySchema = require("../Models/categoryModel");
const Cart=require('../Models/cartModel')





// const ShowProduct = async(req,res)=>{
//     try {
//         const sortCategory = req.query.id;
//         const page = req.query.page || 0;
//         const productPerPage = 10;
//         const category = await Category.find({})
//         const totalNumberOfProducts = sortCategory
//             ? await Product.find({category:sortCategory})
//             : await Product.find({})
//         const totalNumberOfPages = Math.ceil(
//             totalNumberOfProducts / productPerPage
//         )
//         const productData = sortCategory
//             ? await Product.find({ category : sortCategory })
//             .skip(page*productPerPage)
//             .limit(productPerPage)
//             : await Product.find({})
//             .skip(page*productPerPage)
//             .limit(productPerPage);

//         res.render("productManagement",{
//             title:"Product-Mangement",
//             product:productData,
//             totalNumberOfPages,
//             page,
//             category
//         })
        
//     } catch (error) {
//         console.log(error.message);
//     }
// }
const ShowProduct = async (req, res) => {
    try {
        const sortCategory = req.query.id;
        const page = req.query.page || 0;
        const productPerPage = 10;
        const category = await Category.find({});
        const totalNumberOfProducts = sortCategory
            ? await Product.countDocuments({ category: sortCategory })
            : await Product.countDocuments({});
        const totalNumberOfPages = Math.ceil(totalNumberOfProducts / productPerPage);
        const productData = sortCategory
            ? await Product.find({ category: sortCategory })
                .skip(page * productPerPage)
                .limit(productPerPage)
            : await Product.find({})
                .skip(page * productPerPage)
                .limit(productPerPage);

        res.render("productManagement", {
            title: "Product-Management",
            product: productData,
            totalNumberOfPages,
            page,
            category
        });

    } catch (error) {
        console.log(error.message);
    }
}

//====================adding New products===================================//
const addNewProduct = async(req,res)=>{
    try {
        const categoryData = await Category.find({})

        if (categoryData) {
            res.render("add-product",{
                title:"Add Product",
                category:categoryData
            })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const createNewProduct = async (req, res) => {
    try {
        const {
            productName,
            description,
            marketPrice,
            salePrice,
            myCategory,
            quantity,
        } = req.body;
        console.log(req.body)
        // const categories=await Category.find()
        // if (marketPrice === salePrice) {
        //     return res.render("add-product",{ category: categories }, { message: "Regular price and sale price cannot be the same." });
        // }
        // Initialize an array to store image filenames
        let imageFiles = [];

        // Check if files were uploaded
        if (req.files && req.files.length > 0) {
            // Iterate through uploaded files
            for (const file of req.files) {
                // Push filename to the array
                imageFiles.push({ filename: file.filename });
            }
        }

        // Find the category data
        const categoryData = await Category.findOne({ _id: myCategory });

        // Create a new Product object
        const product = new Product({
            productName: productName,
            description: description,
            regularPrice: marketPrice,
            salePrice: salePrice,
            category: categoryData._id,
            quantity: quantity,
            image: imageFiles,
        });

        // Save the product to the database
        const productData = await product.save();

        // Check if the product was successfully saved
        if (productData) {
            // Redirect to the add-new-product page
            return res.redirect("/admin/products/add-new-product");
        } else {
            // Render the add-product page with an error message
            return res.render("add-product", { message: "Failed to Update...!" });
        }
    } catch (error) {
        // Log any errors to the console
        console.log(error.message);
    }
};


//============================delete product=========================================//

const deleteProduct = async(req,res)=>{
    try {
        const { id } = req.query;
        const productData = await Product.deleteOne({ _id : id })
        if (productData.deletedCount > 0 ) {
            res.json({success: true, message: "Product deleted successfully.",})
        }else{
            res.json({ success: false, message: "Product not found" });
        }
    } catch (error) {
        console.log(error.message);
    }
}
const editProduct = async(req,res)=>{
    try {
        const { id } = req.query

        const productData = await Product.findByIdAndUpdate({ _id : id })
        const categoryData = await Category.find({})
        if (productData) {
            res.render("edit-product",{
                title:"Edit Product",
                product:productData,
                category:categoryData
                })
            }
        } catch (error) {
        console.log(error.message);
        }
}
const UpdateCreateEditProduct = async(req,res)=>{
    try {
        const _id = req.query.productId
        const {
            productName,
            description,
            marketPrice,
            salePrice,
            myCategory,
            quantity
        } = req.body

        const imageFiles = req.files;

        let imageArray = [];
        if (imageFiles) {
            imageArray = imageFiles.map((file) => ({ filename : file.filename }))
        }
        //--------------------find existng product---------------------------//
        const existingProduct = await Product.findById({ _id })
        //--------------------apply in the existing image-----------------------------//
        const updatedImage = [...existingProduct.image,...imageArray];
        //---------------update with new product------------------------------------//
        const productData = await Product.findByIdAndUpdate(_id,
        {
            productName:productName,
            description:description,
            regularPrice:marketPrice,
            salePrice:salePrice,
            category:myCategory,
            quantity:quantity,
            image:updatedImage
        },
        { new : true }
        );
        
        if (productData) {
            res.redirect("/admin/products/product-management#products")
        }
    } catch (error) {
        console.log(error.message);
    }
}

// --------------------------------------------------------------------------------------------------------------------------
const loadShop = async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const sortCategory = req.query.id;
        const page = req.query.page || 0;
        const productPerPage = 8;
        let productQuery = {}; //If no specific conditions are added to productQuery, it will remain empty, and the query to fetch products will retrieve all available products.
        // This flexibility allows your code to adapt to different user inputs and filter products accordingly.

        const search = req.query.search;
        const priceRange = req.query.priceRange;
        const categorySearch = req.query.categorySearch;
        let productData;

        // Retrieve cart information from session or database
        const cartItemsCount = await Cart.countDocuments({ user_id });
        console.log(cartItemsCount);

        if (search) {
            productData = await searchProducts(search, categorySearch, page, productPerPage);
        } else {
            if (priceRange) {
                const [minPrice, maxPrice] = priceRange.split("-");
                productData = sortCategory ? await Product.find({
                        category: sortCategory,
                        salePrice: { $gte: minPrice, $lte: maxPrice }
                    })
                        .skip(page * productPerPage)
                        .limit(productPerPage)
                    : await Product.find({
                        salePrice: { $gte: minPrice, $lte: maxPrice }
                    })
                        .skip(page * productPerPage)
                        .limit(productPerPage);

            } else {
                productData = sortCategory
                    ? await Product.find({ category: sortCategory })
                        .skip(page * productPerPage)
                        .limit(productPerPage)
                    : await Product.find({})
                        .skip(page * productPerPage)
                        .limit(productPerPage);
            }
        }

        const totalNumberOfProducts = await Product.find(productQuery).countDocuments();
        const totalNumberOfPages = Math.ceil(totalNumberOfProducts / productPerPage);

        const categoryData = await Category.find({});

        const loggedIn = req.session.isAuth ? true : false;

        // Sorting functionality
        const sortByPrice = req.query.sortByPrice;
        if (sortByPrice === 'lowToHigh') {
            productData.sort((a, b) => a.salePrice - b.salePrice); // Sort low to high
        } else if (sortByPrice === 'highToLow') {
            productData.sort((a, b) => b.salePrice - a.salePrice); // Sort high to low
        }

        // Pass cart information to the view
        if (productData && categoryData) {
            res.render('shop', {
                loggedIn,
                currentPage: "Shop",
                title: "Shop",
                category: categoryData,
                products: productData,
                page: page,
                totalNumberOfPages,
                totalNumberOfProducts: productData.length,
                selectedPriceRange: priceRange,
                selectedSortByPrice: sortByPrice,
                cartItemsCount:cartItemsCount // Add cart information to the rendered view
            });
        }

    } catch (error) {
        console.log(error.message);
    }
}










// ---------------------------------------------------------------------------------------------------------------------
// const shopList = async (req, res) => {
//   try {
//     const search = req.query.search;
//     const searchCategory = req.query.category;
//     const sortCategory = req.query.id;

//     const page = req.query.page || 0;
//     const productsPerPage = 6;

//     let productQuery = {};
//     console.log("aaa");

//     if (search) {
//       if (searchCategory === 'All') {
//         productQuery = {
//           productName: { $regex: ".*" + search + ".*", $options: "i" },
//         };
//       } else {
//         productQuery = {
//           category: searchCategory,
//           productName: { $regex: ".*" + search + ".*", $options: "i" },
//         };
//       }
//     }

//     if (sortCategory) {
//       productQuery = { category: sortCategory };
//     }


//     const priceRange = req.query.priceRange;

//     if (priceRange) {
//       const [minPrice, maxPrice] = priceRange.split("-");
//       productQuery.regularPrice = {
//         $gte: Number(minPrice),
//         $lte: Number(maxPrice),
//       };
//     }

//     const selectedBrands = req.query.brands;

//     if (selectedBrands) {
//       const lowercasedBrands = selectedBrands.toLowerCase();
//       productQuery.Brand = {
//         $regex: new RegExp(lowercasedBrands.split(",").join("|"), "i"),
//       };
//     }

//     const selectedSizes = req.query.sizes;

//     if (selectedSizes) {
//       productQuery.size = {
//         $in: selectedSizes.split(","),
//       };
//     }

//     const totalNumberOfProducts = await Product.find(
//       productQuery
//     ).countDocuments();

//     const totalNumberOfPages = Math.ceil(
//       totalNumberOfProducts / productsPerPage
//     );

//     const productData = await Product.find(productQuery)
//       .skip(page * productsPerPage)
//       .limit(productsPerPage);

//     const categoryData = await Category.find({});
//     const loggedIn = req.session.isAuth ? true : false;

//     if (productData && categoryData) {
//       res.render("shop", {
//         loggedIn,
//         category: categoryData,
//         products: productData,
//         page: page,
//         totalNumberOfPages,
//       });
//     }
//   } catch (error) {
//     handleServerError(res, error, "Error loading shop list");
//   }
// };

//==============================deleting Single image=====================================================//
const deleteSingleImage = async (req, res) => {
    try {
        const { productId, filename } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.json({ success: false, message: "Product Not Found" });
        }

        const imageIndex = product.image.findIndex(
            (img) => img.filename === filename
        );

        if (imageIndex === -1) {
            return res.json({ success: false, message: "Image Not Found in the Product" });
        }

        product.image.splice(imageIndex, 1);
        await product.save();

        const filePath = `public/assetsNew/uploads/${filename}`;
        fs.unlink(filePath, (error) => {
            if (error) {
                return res.json({ success: false, message: "Error In deleting" });
            }
            return res.json({ success: true, message: "Image has Successfully Deleted" });
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
//==============================show product details============================================//

const loadProductDetail = async(req,res)=>{
    try {
        const user_id = req.query.id;
        const productData = await Product.findById({ _id : user_id })
        const loggedIn = req.session.isAuth ? true : false
        
        res.render("product-detail",{
            loggedIn,
            title:"product Details",
            currentPage:"Shop",
            products:productData,
        })
        
    } catch (error) {
        console.log(error.message);
    }
}




// product offer
const addProductOffer=async(req,res)=>{
    try {
        const productId=req.body.productId
        const offerPercentage=req.body.offer
        const productData=await Product.findById(productId)

        if (productData) {
            productData.productOffer = Math.floor(
              productData.regularPrice * (offerPercentage / 100)
            );
      
            // to Calculate the sale price without decimals
            productData.salePrice = productData.salePrice - productData.productOffer;
      
            await productData.save();
      
           
            res.status(200).json({
              success: true,
              salePrice: productData.salePrice,
              message: "Offer updated successfully",
            });
          } else {
            
            res.status(400).json({ success: false, message: "Product not found" });
          }
        } catch (error) {
          console.error(error.message);
         
          res.status(500).json({ success: false, message: "Internal Server Error" });
        }
      };
    
    //   remove product
    const removeProductOffer = async (req, res) => {
        try {
          const productId = req.body.productId;
          const productData = await Product.findById(productId);
          let updated;
      
          if (productData) {
            // Calculate the sale price without decimals
            productData.salePrice =
              Number(productData.productOffer) + Number(productData.salePrice);
            productData.productOffer = 0;
            updated = await productData.save();
          }
      
          if (updated) {
            res.status(200).json({
              success: true,
              salePrice: productData.salePrice,
              message: "Offer removed successfully",
            });
          } else {
            res
              .status(400)
              .json({ success: false, message: "Can't update the offer." });
          }
      
          
        } catch (error) {
          res.status(500).json("Internal server error");
        }
      };
module.exports = {
    ShowProduct,
    addNewProduct,
    createNewProduct,
    deleteProduct,
    deleteSingleImage,
    editProduct,
    UpdateCreateEditProduct,
    loadShop,
    loadProductDetail,
    
    removeProductOffer,
    addProductOffer,
   
    // filer,
}