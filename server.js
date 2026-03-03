const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // For improving security
const morgan = require('morgan'); // For logging HTTP requests received by the server
require('dotenv').config();       // Configures a .env file 

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const sequelize = require('./models');

const app = express();
const PORT = process.env.port;  // change port from .env file

// Middleware
app.use(helmet());  // sets HTTP response headers
app.use(cors());  // sets CORS response headers
app.use(express.json()); // to parse json
app.use(morgan('dev'));  //logs HTTP requests in dev friendly way

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' })); // for clients to check if server is working or not

async function startServer() {
  try {
    await sequelize.authenticate();  //Check database connection
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start:', error);
  }
}

startServer();
