const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors'); // Import the cors package

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Sleep function to simulate a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for localhost:80
app.use(cors({
    origin: '*'
}));

// Create a connection to the MySQL database
const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Function to connect to the MySQL database after a delay
async function connectAfterDelay() {
    await sleep(5000); // Wait for 5 seconds
    const connection = mysql.createConnection(connectionConfig);
    connection.connect((err) => {
        if (err) {
            app.locals.dbError = err.message;
            console.error('Error connecting to MySQL database:', err);
            // process.exit(1);
        }
        console.log('Connected to MySQL database');
        // Start the server only after successful database connection
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`Server is running on http://0.0.0.0:${PORT}`);
      });
    });
}

// Start the connection process after a delay
connectAfterDelay();

// API endpoint to check database connection status
app.get('/api/status', (req, res) => {
  if (app.locals.dbError) {
    return res.status(500).json({ error: app.locals.dbError });
  }
  res.json({ message: 'Connected to MySQL database successfully!' });
});