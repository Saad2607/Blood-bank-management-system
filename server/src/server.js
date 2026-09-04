const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables (check server/.env then cwd)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

// Connect to MongoDB Atlas
connectDB();

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(
    `Pulse Point Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      .yellow.bold
  );
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`.red);
});

module.exports = server;
