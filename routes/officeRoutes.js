const express = require('express');
const router = express.Router();
const Taluka = require('../models/Taluka');
const Reservoir = require('../models/Reservoir');

router.post('/dams', async (req, res) => {
  try {
    const { name, parentId, damwater, capacity, capacityTMC } = req.body;
    const dam = new Dam({ name, taluka: parentId, damwater, capacity, capacityTMC });

    await dam.save();
    const taluka = await Taluka.findById(parentId);
    taluka.dams.push(dam._id);
    await taluka.save();

    res.status(201).json(dam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/talukas', async (req, res) => {
    try {
      const { name } = req.body;
      const taluka = new Taluka({ name, dam: parentId });
  
      await taluka.save();
  
      res.status(201).json(taluka);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



  router.post('/reservoirs', async (req, res) => {
    try {
      const { name, parentId, alertL, dangerL, lowL } = req.body;
      const reservoir = new Reservoir({ name, taluka: parentId, alertL, dangerL, lowL });
      await reservoir.save();
      const taluka = await Taluka.findById(parentId);
      taluka.reservoir.push(reservoir._id);
      await taluka.save();
  
      res.status(201).json(reservoir);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  
 
  router.get('/dams', async (req, res) => {
    try {
      const dams = await Dam.find();
      res.status(200).json(dams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/dams/:id', async (req, res) => {
    try {
      const damId = req.params.id; // Extract the dam ID from the request parameters
      const dam = await Dam.findById(damId); // Query the database by ID
  
      if (!dam) {
        return res.status(404).json({ error: 'Dam not found' }); // Handle case where dam is not found
      }
  
      res.status(200).json(dam); // Return the found dam
    } catch (error) {
      res.status(500).json({ error: error.message }); // Handle server errors
    }
  });

  // Update data for a specific dam
  router.put('/dams', async (req, res) => {
    const { id, timestamp, level, rain, totalPaaniSatha, visarg_V, visarg_S, username } = req.body;
  
    try {
      if (!id) {
        return res.status(400).json({ message: 'Dam ID is required' });
      }
  
      const newEntry = {
        timestamp, 
        level,
        rain,
        totalPaaniSatha,
        visarg_V,
        visarg_S,
        username,
      };
  
      const dam = await Dam.findById(id);
      if (!dam) {
        return res.status(404).json({ message: 'Dam not found' });
      }
  
      dam.data.push(newEntry);
  
      dam.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
      await dam.save();
  
      res.status(200).json({ message: 'Data updated successfully', data: dam.data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  router.delete('/dams/:damId/data/:entryId', async (req, res) => {
    const { damId, entryId } = req.params;
  
    try {
      // Update the dam document
      const updatedDam = await Dam.findByIdAndUpdate(
        damId,
        { $pull: { data: { _id: entryId } } },
        { new: true } // Return the updated document
      );
  
      if (!updatedDam) {
        return res.status(404).json({ message: 'Dam not found' });
      }
  
      res.status(200).json({ message: 'Data entry deleted successfully', dam: updatedDam });
    } catch (error) {
      console.error('Error deleting data entry:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  });

  router.delete('dams/:id', async (req, res) => {
    try {
      // Find the reservoir by ID
      const dam = await Dam.findById(req.params.id);
      if (!dam) return res.status(404).json({ error: "Reservoir not found" });
  
  
      await Dam.findByIdAndDelete(req.params.id);
  
  
      res.json({ message: "Dam deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  
  router.get('/taluka', async (req, res) => {
    try {
      const taluka = await Taluka.find();
      res.status(200).json(taluka);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/damlist', async (req, res) => {
    try {
      const dams = await Dam.find().select('_id name');
      res.status(200).json(dams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });





module.exports = router;


