const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
module.exports.users = users;

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    // Check if both fields are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if username exists and password matches
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    // User authenticated → create JWT
    const token = jwt.sign(
        { username: user.username },      // payload
        "fingerprint_customer",           // secret key (should be in env variable in production)
        { expiresIn: "1h" }               // token expiry
    );

    return res.status(200).json({ message: "Login successful", token: token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; 
    const username = req.user.username; 

    // Check if book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Initialize reviews object if not present
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or update review
    book.reviews[username] = review;

    return res.status(200).json({
        message: `Review added/updated for ISBN ${isbn}`,
        reviews: book.reviews
    });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username; // obtained from JWT middleware

    // Check if the book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if reviews exist for the book
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "You have no review to delete for this book" });
    }

    // Delete the user's review
    delete book.reviews[username];

    return res.status(200).json({
        message: `Review deleted for ISBN ${isbn}`,
        reviews: book.reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
