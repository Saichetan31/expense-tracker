// app.js
import express from 'express';
import pkg from 'pg';
import methodOverride from 'method-override';
import bodyParser from 'body-parser';
import expenseRoutes from './routes/expenseRoutes.js';
const {Pool}=pkg;
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';

// Create an Express application
const app = express();
const port = 3000;
// Load environment variables from .env file
dotenv.config();



// PostgreSQL pool configuration using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})
// Middleware
app.use(express.static('public')); // Serve static files (e.g., CSS)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Support for PUT and DELETE methods in forms

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Use expense routes
app.use('/expenses', expenseRoutes(pool));

// Home route
app.get('/', (req, res) => {
  res.redirect('/expenses');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
