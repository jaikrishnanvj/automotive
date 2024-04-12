// remove deleted items without reload
function removeDeletedItemFromUI(categoryId) {
  const deletedItem = document.getElementById(`category-${categoryId}`);

  if (deletedItem) {
    deletedItem.remove();
  }
}

// function to delete a category
function confirmDelete(categoryId) {
  const confirmationModal = new bootstrap.Modal(
    document.getElementById("confirmationModal"),
    {
      backdrop: "static",
      keyboard: false,
    }
  );

  confirmationModal.show();

  const deleteButton = document.getElementById("deleteButton");

  deleteButton.addEventListener("click", function (event) {
    event.preventDefault();

    // Perform AJAX request
    $.ajax({
      url: `/admin/category/delete-category?id=${categoryId}`,
      type: "DELETE",
      success: function (data) {
        if (data.success) {
          removeDeletedItemFromUI(categoryId);
          confirmationModal.hide();
          toastr.success(data.message, "Delete category");
        }
      },
      error: function () {
        toastr.error("Error deleting category", "Delete category");
      },
    });
  });
}

// function to add new category
function addNewCategory() {
  const formData = $("#myForm").serialize();
  const categoryNameInput = $('input[name="categoryName"]');
  const categoryName = categoryNameInput.val().trim().toLowerCase();

  // Check if a category with the same name already exists in the UI
  const existingCategory = Array.from(
    document.querySelectorAll("#categoryTable tr")
  ).find(
    (row) => row.cells[0].textContent.trim().toLowerCase() === categoryName
  );

  if (existingCategory) {
    categoryNameInput.val("");

    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Category already exists!",
    });
  } else {
    // Continue with the AJAX request
    $.ajax({
      url: "/admin/category/add-new-category",
      type: "POST",
      data: formData,
      success: function (data) {
       
        if (data.success) {
          // Update the UI with the new category
          addNewCategoryToUI(data.newCategory);

          toastr.success(data.message, "Add category");
          categoryNameInput.val("");
         
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.message,
          });
        }
      },
      error: function () {
        toastr.error("Error adding category", "Add category");
      },
    });
  }
}
function editCategory() {
  const categoryId = document.getElementById("updateCategoryBtn").getAttribute("data-category-id");
  const categoryName = document.querySelector('input[name="categoryName"]').value;
  const selectedList = document.querySelector('input[name="list-unlist"]:checked').value;

  let categoryError = document.getElementById("categoryError");
  categoryError.innerText = "";

  if (categoryName.trim() === "") {
      categoryError.innerText = "Fill this empty field.";
      return;
  }

  const data = {
      categoryName,
      categoryId,
      "list-unlist": selectedList,
  };

  fetch("/admin/category/add-updated-category?categoryId=" + categoryId, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else if (response.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Category already exists!",
        });
      }
    })
    .then((data) => {
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Category updated successfully.",
        }).then(() => {
          window.location.href = "/admin/products/category-management";
        });
      }
    })
    .catch((error) => {
      console.error("Error in editCategory:", error.message);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An error occurred while updating the category.",
      });
    });
}

// Function to update the UI with the new category
function addNewCategoryToUI(newCategory) {

  console.log(newCategory,newCategory.createdOn.toLocaleString());
  
  const newCategoryName = newCategory.categoryName.trim().toLowerCase();

  const newRow = document.createElement("tr");
  newRow.id = `category-${newCategory._id}`;

  const categoryNameColumn = document.createElement("td");
  categoryNameColumn.textContent = newCategory.categoryName;

  const dateCreatedColumn = document.createElement("td");
  dateCreatedColumn.textContent = newCategory.createdOn.toLocaleString();

  const listedColumn = document.createElement("td");
  listedColumn.textContent = newCategory.listed ? "Listed" : "Unlisted";

  const editColumn = document.createElement("td");
  const editLink = document.createElement("a");
  editLink.href = `/admin/category/edit-category?id=${newCategory._id}`;
  editLink.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit';
  editColumn.appendChild(editLink);

  const deleteColumn = document.createElement("td");
  const deleteLink = document.createElement("a");
  deleteLink.href = "#";
  deleteLink.onclick = function () {
    confirmDelete(newCategory._id);
  };
  deleteLink.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
  deleteColumn.appendChild(deleteLink);

  // Append columns to the row
  newRow.appendChild(categoryNameColumn);
  newRow.appendChild(dateCreatedColumn);
  newRow.appendChild(listedColumn);
  newRow.appendChild(editColumn);
  newRow.appendChild(deleteColumn);

  // Append the new row at the end of the table
  const tableBody = document.querySelector("#categoryTable");
  tableBody.appendChild(newRow);
}

// block and unblock user admin side
function blockOrUnBlockUser(userId) {
  console.log('ddd');
  $.ajax({
    type: "PUT",
    url: `/admin/users/${userId}/block`,
    success: function (response) {
      const buttonText = response.is_blocked ? "Unblock" : "Block";
      // Update text of the link inside the corresponding td
      $(`#${userId} a`).text(buttonText);

      response.is_blocked
        ? toastr.error("User is blocked", "Blocked user")
        : toastr.success("User is unblocked", "Unblocked user");
    },
    error: function (error) {
      console.error(error);
    },
  });
}


// delete products
function confirmDeleteProduct(productId) {
  const confirmationModal = new bootstrap.Modal(
    document.getElementById("confirmationModal"),
    {
      backdrop: "static",
      keyboard: false,
    }
  );

  confirmationModal.show();

  const deleteButton = document.getElementById("productDeleteButton");

  deleteButton.addEventListener("click", function (event) {
    event.preventDefault();

    $.ajax({
      url: `/admin/products/delete-product?id=${productId}`,
      type: "DELETE",
      success: function (data) {
        if (data.success) {
          removeDeletedItemFromUI(productId);
          confirmationModal.hide();
          toastr.success(data.message, "Delete product");
        }
      },
      error: function () {
        toastr.error("Error deleting product", "Delete product");
      },
    });
  });

  // Function to remove the deleted item from the UI
  function removeDeletedItemFromUI(productId) {
    const deletedItem = document.getElementById(productId);

    if (deletedItem) {
      deletedItem.remove();
    }
  }
}


function submitLoginForm() {
  var formData = {
    email: $("input[name='email']").val(),
    password: $("input[name='password']").val(),
  };

  $.ajax({
    method: "post",
    url: "/login",
    data: formData,
    success: function (response) {
      if (response.success) {
        window.location.href = response.redirectUrl;
      } else {
        $("#message").text(response.message);
      }
    },
    error: function () {
      $("#message").text("Error during Login");
    },
  });
}
function submitRegisterForm() {
  event.preventDefault();
  var formData = {
    name: $("input[name='name']").val(),
    email: $("input[name='email']").val(),
    mobile: $("input[name='mobile']").val(),
    password: $("input[name='password']").val(),
    conformPassword: $("input[name='confirmPassword']").val(),
  };
  // Check if any of the required fields are empty
  if (!formData.name || !formData.email || !formData.mobile || !formData.password ) {
    $("#message").text("Please fill in all the required fields.");
    return; // Stop further processing if validation fails
  }
  if ( formData.password !== formData.conformPassword) {
    $("#message").text("Not Matching Please check the password. ");
    return; // Stop further processing if validation fails
  }

  // Check if password and confirm password match
  
  

  $.ajax({
    method: "post",
    url: "/register",
    data: formData,
    success: function (response) {
      if (response.success) {
        window.location.href = response.redirectUrl;
      } else {
        $("#message").text(response.message);
      }
    },
    error: function () {
      $("#message").text("Error during Login");
    },
  });
}

function OTPsubmitForm() {
  var formData = {
    otp: $("input[name='otp']").val(), 
  };

  $.ajax({
    method: "post",
    url: "/OTP-verification",
    data: formData,
    success: function (response) {
      if (response.success) {
        window.location.href = "/register"; 
      } else {
        $("#message").text(response.message);
      }
    },
    error: function () {
      $("#message").text("Error during Login");
    },
  });
}
function passwordOTPForm() {
  var formData = {
    otp: $("input[name='otp']").val(), 
  };

  $.ajax({
    method: "post",
    url: "/OTP-verification",
    data: formData,
    success: function (response) {
      if (response.success) {
        window.location.href = "/register"; 
      } else {
        $("#message").text(response.message);
      }
    },
    error: function () {
      $("#message").text("Error during Login");
    },
  });
}
function validateQuantity() {
  // Get the quantity input value
  var quantity = document.getElementById("prod_stock").value;

  // Convert the quantity to a number
  var quantityValue = parseInt(quantity);

  // Check if the quantity is negative
  if (quantityValue < 0) {
      // Display an error message
      document.getElementById("sotckError").innerText = "Quantity cannot be negative";
  } else {
      // Clear the error message if the quantity is non-negative
      document.getElementById("sotckError").innerText = "";
  }
}

