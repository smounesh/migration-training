const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'mysql', 
  user: 'user', 
  password: 'password', 
  database: 'test_db' 
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    // Store the error message to send to the frontend
    app.locals.dbError = err.message; // Store error in app locals
    return;
  }
  console.log('Connected to MySQL database');
});

// Serve a simple HTML page
app.get('/', (req, res) => {
  if (app.locals.dbError) {
    // If there's a database connection error, send it to the frontend
    return res.status(500).send(`
      <h1>Database Connection Status</h1>
      <p>Error connecting to MySQL database: ${app.locals.dbError}</p>
    `);
  }
  
  res.send('<h1>Database Connection Status</h1><p>Connected to MySQL database successfully!</p>');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});