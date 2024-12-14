const express = require('express');
const Reservoir = require('../models/Reservoir');
const authenticate = require('../middleware/authMiddleware');  // Import the authentication middleware
const router = express.Router();
const Notification = require('../models/Notification');  // Import the Notification model
const mongoose = require('mongoose'); // Add this import at the top of your file



// Get all reservoirs (public route, no authentication required)
router.get('/all', async (req, res) => {
  try {
    const reservoirs = await Reservoir.find().sort({ timestamp: -1 });
    res.json(reservoirs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/listall', async (req, res) => {
  try {
    const reser = await Reservoir.find().select('_id name alertL dangerL lowL');
    res.status(200).json(reser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific reservoir (public route, no authentication required)
// Define the GET route to get reservoir details by ID
router.get('/:id', async (req, res) => {
  try {
    const reservoirId = req.params.id;

    // Check if the ID is a valid mongoose ObjectId
    if (!mongoose.Types.ObjectId.isValid(reservoirId)) {
      return res.status(400).json({ message: 'Invalid reservoir ID' });
    }

    const reservoir = await Reservoir.findById(reservoirId);

    if (!reservoir) {
      return res.status(404).json({ message: 'Reservoir not found' });
    }

    // Prepare the response data with the reservoir name and water levels
    const responseData = {
      reservoirName: reservoir.name,
      waterLevels: reservoir.waterLevels
    };

    // Return the data
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/', async (req, res) => {
  try {
    const { name, taluka, level, timestamp, rain, username } = req.body;

    const reservoir = await Reservoir.findOne({ name, taluka });
    if (!reservoir) {
      return res.status(404).json({ error: 'Reservoir not found' });
    }

    // Get the previous water level (if it exists)
    const previousLevel = reservoir.waterLevels.length > 0 
      ? reservoir.waterLevels[reservoir.waterLevels.length - 1].level 
      : null;

      const previousTimestamp = reservoir.waterLevels.length > 0 
      ? reservoir.waterLevels[reservoir.waterLevels.length - 1].timestamp 
      : null;

    console.log('Previous Level:', previousLevel, 'New Level:', level);

    // Add the new water level to the waterLevels array
    reservoir.waterLevels.push({ level, timestamp, rain, username });

    reservoir.waterLevels.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (previousTimestamp && new Date(timestamp) >= new Date(previousTimestamp)) {

    // Check if the new level exceeds dangerL and the previous level did not
   
    // Check for alert level
    if (previousLevel !== null && previousLevel <= reservoir.alertL && level > reservoir.alertL) {
      const message = `Warning: Water level in ${reservoir.name} has exceeded the alert level (${reservoir.alertL}m). Current level: ${level}m.`;

      const notification = new Notification({
        reservoir: reservoir._id,
        message,
        color: "Yellow"
      });

      try {
        await notification.save();
        console.log('Notification sent:', message);
      } catch (saveError) {
        console.log('Error saving notification:', saveError.message);
        return res.status(500).json({ error: 'Failed to save notification' });
      }
    }

    if (previousLevel !== null && previousLevel <= reservoir.dangerL && level > reservoir.dangerL) {
      const message = `Warning: Water level in ${reservoir.name} has exceeded the danger level (${reservoir.dangerL}m). Current level: ${level}m.`;
      
      const notification = new Notification({
        reservoir: reservoir._id,
        message,
        color: "Red"
      });

      try {
        await notification.save();
        console.log('Notification sent:', message);
      } catch (saveError) {
        console.log('Error saving notification:', saveError.message);
        return res.status(500).json({ error: 'Failed to save notification' });
      }
    }


    // Check for low level
    if (previousLevel !== null && previousLevel >= reservoir.lowL && level < reservoir.lowL) {
      const message = `Warning: Water level in ${reservoir.name} has fallen below the low level (${reservoir.lowL}m). Current level: ${level}m.`;

      const notification = new Notification({
        reservoir: reservoir._id,
        message,
        color: "Blue"
      });

      try {
        await notification.save();
        console.log('Notification sent:', message);
      } catch (saveError) {
        console.log('Error saving notification:', saveError.message);
        return res.status(500).json({ error: 'Failed to save notification' });
      }
    }

    if (previousLevel !== null && ((previousLevel > reservoir.alertL || previousLevel < reservoir.lowL) && level >= reservoir.lowL && level <= reservoir.alertL)) {
      const message = `All clear: Water level in ${reservoir.name} is now between normal levels (${reservoir.lowL}m - ${reservoir.alertL}m). Current level: ${level}m.`;

      const notification = new Notification({
        reservoir: reservoir._id,
        message,
        color: "Green"
      });

      try {
        await notification.save();
        console.log('Notification sent:', message);
      } catch (saveError) {
        console.log('Error saving notification:', saveError.message);
        return res.status(500).json({ error: 'Failed to save notification' });
      }
    }
  }
    // Save the updated reservoir object
    await reservoir.save();
    res.json(reservoir);
  } catch (err) {
    console.log('Error in the PUT request:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Delete a reservoir (requires authentication)
router.delete('/:id', async (req, res) => {
  try {
    // Find the reservoir by ID
    const reservoir = await Reservoir.findById(req.params.id);
    if (!reservoir) return res.status(404).json({ error: "Reservoir not found" });


    // Delete the reservoir
    await Reservoir.findByIdAndDelete(req.params.id);


    res.json({ message: "Reservoir deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:reservoirId/waterlevel/:entryId', async (req, res) => {
  const { reservoirId, entryId } = req.params;

  try {
    // Update the reservoir document
    const updatedReservoir = await Reservoir.findByIdAndUpdate(
      reservoirId,
      { $pull: { waterLevels: { _id: entryId } } },
      { new: true } // Return the updated document
    );

    if (!updatedReservoir) {
      return res.status(404).json({ message: 'Reservoir not found' });
    }

    res.status(200).json({ message: 'Water level entry deleted', reservoir: updatedReservoir });
  } catch (error) {
    console.error('Error deleting water level entry:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
