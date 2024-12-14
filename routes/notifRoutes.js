const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Reservoir = require('../models/Reservoir');

// Endpoint to create a notification
router.get('/', async (req, res) => {
    try {
      // Retrieve all notifications, populating reservoir details if needed
      const notifications = await Notification.find()
        .sort({ timestamp: -1 }); // Sort by newest first
  
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching notifications: ' + error.message });
    }
  });

module.exports = router;
