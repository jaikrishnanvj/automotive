const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nocache = require('nocache');
const session = require('express-session');
const connectdb = require('./config/db');
require("dotenv").config();

const app = express();
app.use(nocache());

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));


// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', './views/user');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key', // Change thi
    resave: false,
    saveUninitialized: true
}));


// Import userRouter
const userRoute = require('./routes/userRouter');
const adminRoute = require('./routes/adminRouter');

connectdb();

// Use userRouter for routes starting with '/'
app.use('/admin', adminRoute);
app.use('/', userRoute);

// Apply headers to all routes
app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');//Pragma: no-cache, is a request header that forces caches to request or revalidate
    // the document from the origin server even when a fresh copy is available in the cache. 
    next();
});

// Define a route for the root path '/'
// app.get('/', (req, res) => {
//     res.send('Welcome to the homepage');
// });

const hostname = 'localhost'; // Change this to your actual hostname if applicable
const port = 5000; // Change this to the port your server is listening on

app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}/`);
});