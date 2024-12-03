require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const reservoirRoutes = require('./routes/reservoirRoutes');
const authRoutes = require('./routes/authRoutes')
const officeRoutes = require('./routes/officeRoutes')
const notifRoutes = require('./routes/notifRoutes')
const app = express();
const cors = require('cors');

app.use(cors({
  origin: '*',  // Allow all origins (use specific domain in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());
const MONGO_URI = process.env.MONGO_URI; // Retrieve MongoDB URI from environment variables


// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/reservoirs', reservoirRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/office', officeRoutes);
app.use('/api/notifications', notifRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
