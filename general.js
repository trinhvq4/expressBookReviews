const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); 

// Register a new user
public_users.post("/register", (req,res) => {
  const { username, password } = req.body; // Using destructuring for cleaner code

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  if (isValid(username)) { 
    return res.status(409).json({message: "Username already exists!"});
  }
  
  users.push({"username":username,"password":password});
  return res.status(201).json({message: "User successfully registered. Now you can login"});
});

// -----------------------------------------------------------
// TASK 10: Get the list of books available in the shop
// -----------------------------------------------------------
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
      if (books) {
          resolve(books);
      } else {
          reject("Database error: Books not found");
      }
  })
  .then((data) => {
      res.status(200).send(JSON.stringify(data, null, 4));
  })
  .catch((err) => {
      res.status(500).json({message: err});
  });
});

// Task 10 Axios Alternative
const getAllBooks = async () => {
    try {
        const response = await axios.get("http://localhost:5000/");
        return response.data;
    } catch (error) {
        console.error("Error fetching books:", error.message);
        return null;
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
          reject(`Book with ISBN ${isbn} not found`);
      }
  })
  .then((data) => res.status(200).send(data))
  .catch((err) => res.status(404).json({message: err}));
});

// Task 11 Axios Alternative
const getBookByISBN = async (isbn) => {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return response.data;
    } catch (error) {
        if(error.response && error.response.status === 404) {
             console.error("Book not found");
        } else {
             console.error("Error fetching book:", error.message);
        }
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
      
      if (booksbyauthor.length > 0) {
          resolve(booksbyauthor);
      } else {
          reject(`No books found for author: ${author}`);
      }
  })
  .then((data) => res.status(200).send({booksbyauthor: data}))
  .catch((err) => res.status(404).json({message: err}));
});


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
      
      if (booksbytitle.length > 0) {
          resolve(booksbytitle);
      } else {
          reject(`No books found with title: ${title}`);
      }
  })
  .then((data) => res.status(200).send({booksbytitle: data}))
  .catch((err) => res.status(404).json({message: err}));
});


// -----------------------------------------------------------
// Get book review
// -----------------------------------------------------------
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
      res.status(200).send(books[isbn].reviews);
  } else {
      res.status(404).json({message: `Reviews not found: Book with ISBN ${isbn} does not exist`});
  }
});

module.exports.general = public_users;
