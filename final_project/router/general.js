const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios'); // add at the top with other requires
const public_users = express.Router();


// Get book list using Axios with Promise callbacks
public_users.get('/axios-books', (req, res) => {
    axios.get('http://localhost:5000/')  // call the local '/' endpoint
        .then(response => {
            res.status(200).send(response.data); // send the book list
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching books", error: error.message });
        });
});


// Get book list using Axios with async/await
public_users.get('/axios-books-async', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/'); // call local endpoint
        res.status(200).send(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});


public_users.post("/register", (req, res) => {
    const { username, password } = req.body; // get username and password from request body

    // Check if both fields are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: "Username already exists. Please choose another one." });
    }

    // Register new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn; // get ISBN from URL
    const book = books[isbn];     // look up book in the database

    if (book) {
        return res.status(200).send(JSON.stringify(book, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
    const author = decodeURIComponent(req.params.author); // get author from URL
    const bookKeys = Object.keys(books); // get all ISBN keys
    const result = [];

    // Iterate through books and find matches
    for (let key of bookKeys) {
        if (books[key].author === author) {
            result.push(books[key]);
        }
    }

    if (result.length > 0) {
        return res.status(200).send(JSON.stringify(result, null, 4));
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = decodeURIComponent(req.params.title); // decode spaces
    const bookKeys = Object.keys(books); // get all ISBN keys
    const result = [];

    // Iterate through books and find matches
    for (let key of bookKeys) {
        if (books[key].title === title) {
            result.push(books[key]);
        }
    }

    if (result.length > 0) {
        return res.status(200).send(JSON.stringify(result, null, 4));
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn; // get ISBN from URL
    const book = books[isbn];     // look up book in database

    if (book) {
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
