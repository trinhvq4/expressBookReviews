const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); 

/**
 * Register a new user
 * This endpoint accepts a username and password in the body.
 * It checks if the username already exists and if the inputs are valid.
 */
public_users.post("/register", (req,res) => {
  const { username, password } = req.body; // Using destructuring for cleaner code

  // Validate that both fields are present
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  // Check if the username is already taken
  if (isValid(username)) { 
    return res.status(409).json({message: "Username already exists!"});
  }
  
  // Register the user
  users.push({"username":username,"password":password});
  return res.status(201).json({message: "User successfully registered. Now you can login"});
});

// -----------------------------------------------------------
// TASK 10: Get the list of books available in the shop
// -----------------------------------------------------------

/**
 * Get all books
 * Uses a Promise to simulate an asynchronous operation to retrieve 
 * the book list from the database.
 */
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
      // Simulate database retrieval
      if (books) {
          resolve(books);
      } else {
          reject("Database error: Books not found");
      }
  })
  .then((data) => {
      // Return the books data as a JSON string with formatting
      res.status(200).send(JSON.stringify(data, null, 4));
  })
  .catch((err) => {
      // Handle any errors during retrieval
      res.status(500).json({message: err});
  });
});

/**
 * Task 10 Alternative: Get all books using Axios
 * This function demonstrates how to fetch data from an external source (or this API)
 * using async/await with Axios.
 */
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

/**
 * Get book by ISBN
 * Retrieves a specific book object based on the ISBN provided in the URL parameters.
 */
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

/**
 * Task 11 Alternative: Get book by ISBN using Axios
 */
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

/**
 * Get books by Author
 * Iterates through the books database to find all books matching the specified author.
 * Returns a list of books or a 404 error if none are found.
 */
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  
  new Promise((resolve, reject) => {
      let booksbyauthor = [];
      const isbns = Object.keys(books);
      
      // Iterate through all books to check the author
      isbns.forEach((isbn) => {
        if (books[isbn].author === author) {
          booksbyauthor.push({
             isbn: isbn,
             title: books[isbn].title,
             reviews: books[isbn].reviews
          });
        }
      });
      
      // Resolve if books are found, otherwise reject
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

/**
 * Get books by Title
 * Iterates through the books database to find all books matching the specified title.
 */
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  
  new Promise((resolve, reject) => {
      let booksbytitle = [];
      const isbns = Object.keys(books);
      
      // Iterate through all books to check the title
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

/**
 * Get book reviews
 * Returns the reviews object for the book with the specified ISBN.
 */
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
      res.status(200).send(books[isbn].reviews);
  } else {
      res.status(404).json({message: `Reviews not found: Book with ISBN ${isbn} does not exist`});
  }
});

module.exports.general = public_users;
