const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});


// Assuming you have a form with id 'registrationForm'
// function submitreg() {
//     console.log("hello");
//     if (validate()) {
//         const form = document.getElementById('registrationForm');
//         const formData = new FormData(form);

//         console.log(formData);

//         fetch("/login", {
//             method: "POST",
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded', // Adjust the content type based on your server requirements
//             },
//             body: JSON.stringify(Object.fromEntries(formData.entries()))
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             // Handle the successful response data
//             console.log(data);
//         })
//         .catch(error => {
//             // Handle errors
//             console.error('Error:', error);
//         });
//     }
// }


// function validate() {

//     console.log("inside validate");

//     // Input feilds
//     const name = document.getElementById('username')
//     const email = document.getElementById('email')
//     const password = document.getElementById('password')
//     const mobile = document.getElementById('mobilenumber')
 
//     // Error feilds
//     const nameError = document.getElementById('nameError')
//     const emailError = document.getElementById('emailError')
//     const passwordError = document.getElementById('passwordError')
//     const mobileError = document.getElementById('mobileError');
 
//     // Regex   
//     const nameRegex = /^[A-Z]/;
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail+\.[a-zA-Z]{3}$/;
//     const passwordRegex = /^(?=.[a-z])(?=.[A-Z])(?=.*\d).{8,}$/;
//     const mobileRegex = /^[0-9]{10}$/;
 
 
//     //name feild
//     if (name.value.trim() === '') {
//        nameError.innerHTML = 'Field is required'
//        setTimeout(() => {
//           nameError.innerHTML = ''
//        }, 5000)
//        return false;
//     }
//     if(!nameRegex.test(name.value)){
//        nameError.innerHTML = 'First letter should be capital'
//        setTimeout(()=>{
//           nameError.innerHTML = ''
//        },5000)
//        return false;
//     }
 
//     // email feild   
//     if (email.value.trim() === '') {
//        emailError.innerHTML = 'Field is required'
//        setTimeout(() => {
//           emailError.innerHTML = ''
//        }, 5000)
//        return false;
//     }
//     if (!emailRegex.test(email.value)) {
//        emailError.innerHTML = "Please enter a valid email"
//        setTimeout(() => {
//           emailError.innerHTML = ''
//        }, 5000);
//        return false;
//     }
 
//     // password feild
//     if (password.value.trim() === '') {
//        passwordError.innerHTML = 'Field is required'
//        setTimeout(() => {
//           passwordError.innerHTML = ''
//        }, 5000)
//        return false;
//     }
//     if (!passwordRegex.test(password.value)) {
//        passwordError.innerHTML = "Please enter a tight password"
//        setTimeout(() => {
//           passwordError.innerHTML = ''
//        }, 5000);
//        return false;
//     }
 
//     //mobile feild
//     if (mobile.value.trim() === '') {
//        mobileError.innerHTML = 'Field is required'
//        setTimeout(() => {
//           mobileError.innerHTML = ''
//        }, 5000)
//        return false;
//     }
 
//     if(!mobileRegex.test(mobile.value)){
//        mobileError.innerHTML = 'Please enter a valid number'
//        setTimeout(()=>{
//           mobileError.innerHTML = ''
//        },5000)
//        return false;
//     }
//     return true;
//  }