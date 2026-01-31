const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Ensure axios is installed in your project

// Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// -----------------------------------------------------------
// TASK 10: Get the list of books available in the shop
// -----------------------------------------------------------
public_users.get('/', function (req, res) {
  // Simulating async retrieval using a Promise
  new Promise((resolve, reject) => {
      resolve(books);
  })
  .then((data) => {
      res.send(JSON.stringify(data, null, 4));
  });
});

// Alternative: Axios Implementation (Task 10)
const getAllBooks = async () => {
    try {
        const response = await axios.get("http://localhost:5000/");
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}


// -----------------------------------------------------------
// TASK 11: Get book details based on ISBN
// -----------------------------------------------------------
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
          resolve(book);
      } else {
          reject("Book not found");
      }
  })
  .then((data) => res.send(data))
  .catch((err) => res.status(404).json({message: err}));
});

// Alternative: Axios Implementation (Task 11)
const getBookByISBN = async (isbn) => {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}


// -----------------------------------------------------------
// TASK 12: Get book details based on Author
// -----------------------------------------------------------
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  
  new Promise((resolve, reject) => {
      let booksbyauthor = [];
      const isbns = Object.keys(books);
      isbns.forEach((isbn) => {
        if (books[isbn].author === author) {
          booksbyauthor.push({
             isbn: isbn,
             title: books[isbn].title,
             reviews: books[isbn].reviews
          });
        }
      });
      resolve(booksbyauthor);
  })
  .then((data) => res.send({booksbyauthor: data}));
});

// Alternative: Axios Implementation (Task 12)
const getBookByAuthor = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}


// -----------------------------------------------------------
// TASK 13: Get all books based on Title
// -----------------------------------------------------------
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  
  new Promise((resolve, reject) => {
      let booksbytitle = [];
      const isbns = Object.keys(books);
      isbns.forEach((isbn) => {
        if (books[isbn].title === title) {
          booksbytitle.push({
             isbn: isbn,
             author: books[isbn].author,
             reviews: books[isbn].reviews
          });
        }
      });
      resolve(booksbytitle);
  })
  .then((data) => res.send({booksbytitle: data}));
});

// Alternative: Axios Implementation (Task 13)
const getBookByTitle = async (title) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}


// -----------------------------------------------------------
// Get book review
// -----------------------------------------------------------
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
      res.send(books[isbn].reviews);
  } else {
      res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
