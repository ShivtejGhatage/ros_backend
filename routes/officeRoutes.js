const express = require('express');
const Corporation = require('../models/Corporation');
const router = express.Router();
const Subdam = require('../models/SubDam');

router.post('/corporations', async (req, res) => {
  try {
    const { name } = req.body;
    const existingCorporation = await Corporation.findOne({ name });
    if (existingCorporation) {
      return res.status(400).json({ error: 'A corporation with this name already exists.' });
    }

    const corporation = new Corporation({ name });
    await corporation.save();
    res.status(201).json(corporation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const CEOffice = require('../models/CEOffice');

router.post('/ceoffices', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const ceOffice = new CEOffice({ name, corporation: parentId });

    // Add to the corporation's ceOffices array
    await ceOffice.save();
    const corporation = await Corporation.findById(parentId);
    corporation.ceOffices.push(ceOffice._id);
    await corporation.save();

    res.status(201).json(ceOffice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const CircleOffice = require('../models/CircleOffice');

router.post('/circleoffices', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const circleOffice = new CircleOffice({ name, ceOffice: parentId });

    // Add to the CE Office's circleOffices arraya
    await circleOffice.save();
    const ceOffice = await CEOffice.findById(parentId);
    ceOffice.circleOffices.push(circleOffice._id);
    await ceOffice.save();

    res.status(201).json(circleOffice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const DivisionOffice = require('../models/DivisionOffice');

router.post('/divisionoffices', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const divisionOffice = new DivisionOffice({ name, circleOffice: parentId });

    // Add to the Circle Office's divisionOffices array
    await divisionOffice.save();
    const circleOffice = await CircleOffice.findById(parentId);
    circleOffice.divisionOffices.push(divisionOffice._id);
    await circleOffice.save();

    res.status(201).json(divisionOffice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const SubdivisionOffice = require('../models/SubDivisionOffice');

router.post('/subdivisionoffices', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const subdivisionOffice = new SubdivisionOffice({ name, divisionOffice: parentId });

    // Add to the Division Office's subdivisionOffices array
    await subdivisionOffice.save();
    const divisionOffice = await DivisionOffice.findById(parentId);
    divisionOffice.subdivisionOffices.push(subdivisionOffice._id);
    await divisionOffice.save();

    res.status(201).json(subdivisionOffice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const SectionOffice = require('../models/SectionOffice');

router.post('/sectionoffices', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const sectionOffice = new SectionOffice({ name, subdivisionOffice: parentId });

    // Add to the Subdivision Office's sectionOffices array
    await sectionOffice.save();
    const subdivisionOffice = await SubdivisionOffice.findById(parentId);
    subdivisionOffice.sectionOffices.push(sectionOffice._id);
    await subdivisionOffice.save();

    res.status(201).json(sectionOffice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const Dam = require('../models/Dam');

router.post('/dams', async (req, res) => {
  try {
    const { name, parentId, damwater, capacity, capacityTMC } = req.body;
    const dam = new Dam({ name, sectionOffice: parentId, damwater, capacity, capacityTMC });

    // Add to the Section Office's dams array
    await dam.save();
    const sectionOffice = await SectionOffice.findById(parentId);
    sectionOffice.dams.push(dam._id);
    await sectionOffice.save();

    res.status(201).json(dam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/subdams', async (req, res) => {
    try {
      const { name, parentId } = req.body;
      const subdam = new Subdam({ name, dam: parentId });
  
      // Add to the Subdivision Office's sectionOffices array
      await subdam.save();
      const dam = await Dam.findById(parentId);
      if (!dam) {
        return res.status(404).json({ error: "Dam not found" });
      }
      dam.subdam.push(subdam._id);
      await dam.save();
  
      res.status(201).json(subdam);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  const Reservoir = require('../models/Reservoir');
  const ReservoirList = require('../models/Reservoirlist');

  router.post('/reservoirs', async (req, res) => {
    try {
      const { name, parentId, alertL, dangerL, lowL } = req.body;
      const reservoir = new Reservoir({ name, subdam: parentId, alertL, dangerL, lowL });
      const reservoirlist = new ReservoirList({ name, subdam: parentId, alertL, dangerL, lowL });
      // Add to the Section Office's dams array
      await reservoir.save();
      await reservoirlist.save();
      const subdam = await Subdam.findById(parentId);
      subdam.reservoir.push(reservoir._id);
      await subdam.save();
  
      res.status(201).json(reservoir);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//   router.post('/reservoir', async (req, res) => {
//     try {
//       const { name, parentId } = req.body;
//       const reser = new Reser({ name, subdam: parentId });
  
//       // Add to the Subdivision Office's sectionOffices array
//       await reser.save();
//       const subdam = await Subdam.findById(parentId);
//       subdam.reser.push(reser._id);
//       await subdam.save();
  
//       res.status(201).json(reser);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

router.get('/hierarchy', async (req, res) => {
  try {
    const corporations = await Corporation.find()
      .populate({
        path: 'ceOffices',
        populate: {
          path: 'circleOffices',
          populate: {
            path: 'divisionOffices',
            populate: {
              path: 'subdivisionOffices',
              populate: {
                path: 'sectionOffices',
                populate: {
                  path: 'dams',
                },
              },
            },
          },
        },
      });

    res.status(200).json(corporations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/corporations', async (req, res) => {
    try {
      const corporations = await Corporation.find();
      res.status(200).json(corporations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/ceoffices', async (req, res) => {
    try {
      const ceOffices = await CEOffice.find();
      res.status(200).json(ceOffices);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/circleoffices', async (req, res) => {
    try {
      const circleOffices = await CircleOffice.find();
      res.status(200).json(circleOffices);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/divisionoffices', async (req, res) => {
    try {
      const divisionOffices = await DivisionOffice.find();
      res.status(200).json(divisionOffices);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/subdivisionoffices', async (req, res) => {
    try {
      const subdivisionOffices = await SubdivisionOffice.find();
      res.status(200).json(subdivisionOffices);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/sectionoffices', async (req, res) => {
    try {
      const sectionOffices = await SectionOffice.find();
      res.status(200).json(sectionOffices);
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


  // Update data for a specific dam
  router.put('/dams', async (req, res) => {
    const { id, timestamp, level, rain, totalPaaniSatha, visarg_V, visarg_S, username } = req.body;
  
    try {
      if (!id) {
        return res.status(400).json({ message: 'Dam ID is required' });
      }
  
      // Create the new data entry
      const newEntry = {
        timestamp, // Automatically set the current timestamp
        level,
        rain,
        totalPaaniSatha,
        visarg_V,
        visarg_S,
        username,
      };
  
      // Find the dam and update its data
      const dam = await Dam.findById(id);
      if (!dam) {
        return res.status(404).json({ message: 'Dam not found' });
      }
  
      // Add the new entry to the data array
      dam.data.push(newEntry);
  
      // Sort the data array by timestamp
      dam.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
      // Save the updated dam document
      await dam.save();
  
      res.status(200).json({ message: 'Data updated successfully', data: dam.data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  

  
  router.get('/subdams', async (req, res) => {
    try {
      const subdam = await Subdam.find();
      res.status(200).json(subdam);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



module.exports = router;


