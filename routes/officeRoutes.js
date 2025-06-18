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

    // Create the Subdam; only set the dam field if parentId is provided
    const subdam = new Subdam({
      name,
      ...(parentId && { dam: parentId })  // optional chaining for dam assignment
    });

    await subdam.save();

    // If parentId is provided, try to find a dam and add subdam to it
    if (parentId) {
      const dam = await Dam.findById(parentId);
      if (dam) {
        dam.subdam.push(subdam._id);
        await dam.save();
      }
    }

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
                  select: '_id name', // Fetch only ID and name of dams
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
  
  module.exports = router;


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
  
  router.delete('/dam/:damId/data/:entryId', async (req, res) => {
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

  
  router.get('/subdams', async (req, res) => {
    try {
      const subdam = await Subdam.find();
      res.status(200).json(subdam);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

    router.get('/reservoirs', async (req, res) => {
    try {
      const reservoirs = await Reservoir.find();
      res.status(200).json(reservoirs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete APIs

    router.delete('/corporations/:id', async (req, res) => {
    try {
      const corporation = await Corporation.findById(req.params.id);
      
      if (!corporation) {
        return res.status(404).json({ message: 'Corporation not found' });
      }

      if (corporation.ceOffices.length > 0) {
        return res.status(400).json({ message: 'Cannot delete Corporation with existing CEOffices' });
      }

      await Corporation.findByIdAndDelete(req.params.id);
      res.json({ message: 'Corporation deleted successfully' });

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  


  router.delete('/ceoffices/:id', async (req, res) => {
    try {
      const ceOffice = await CEOffice.findById(req.params.id);
      
      if (!ceOffice) {
        return res.status(404).json({ message: 'CEOffice not found' });
      }

      if (ceOffice.circleOffices.length > 0) {
        return res.status(400).json({ message: 'Cannot delete CEOffice with existing Circle Offices' });
      }

      await Corporation.findByIdAndUpdate(ceOffice.corporation, {
        $pull: { ceOffices: ceOffice._id }
      });
      await CEOffice.findByIdAndDelete(req.params.id);
      res.json({ message: 'CEOffice deleted successfully' });

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });


router.delete('/circleoffices/:id', async (req, res) => {
  try {
    const circleoffices = await CircleOffice.findById(req.params.id);
    
    if (!circleoffices) {
      return res.status(404).json({ message: 'CircleOffice not found' });
    }

    if (circleoffices.divisionOffices.length > 0) {
      return res.status(400).json({ message: 'Cannot delete CircleOffice with existing DivisionOffices' });
    }

    await CEOffice.findByIdAndUpdate(circleoffices.ceOffice, {
      $pull: { circleOffices: circleoffices._id }
    });

    await CircleOffice.findByIdAndDelete(req.params.id);
    res.json({ message: 'CircleOffice deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


 router.delete('/divisionoffices/:id', async (req, res) => {
  try {
    const divisionoffices = await DivisionOffice.findById(req.params.id);
    
    if (!divisionoffices) {
      return res.status(404).json({ message: 'DivisionOffice not found' });
    }

    if (divisionoffices.subdivisionOffices.length > 0) {
      return res.status(400).json({ message: 'Cannot delete DivisionOffice with existing subdivisionOffices' });
    }

    await CircleOffice.findByIdAndUpdate(divisionoffices.circleOffice, {
      $pull: { divisionOffices: divisionoffices._id }
    });

    await DivisionOffice.findByIdAndDelete(req.params.id);
    res.json({ message: 'DivisionOffice deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



router.delete('/subdivisionoffices/:id', async (req, res) => {
  try {
    const subdivisionoffice = await SubdivisionOffice.findById(req.params.id);

    if (!subdivisionoffice) {
      return res.status(404).json({ message: 'SubdivisionOffice not found' });
    }

    // Check if any SectionOffices are linked to this SubdivisionOffice
    const childSections = await SectionOffice.find({ subdivisionOffice: subdivisionoffice._id });
    if (childSections.length > 0) {
      return res.status(400).json({ message: 'Cannot delete: SubdivisionOffice has existing SectionOffices' });
    }

    // Remove reference from parent DivisionOffice
    if (subdivisionoffice.divisionOffice) {
      await DivisionOffice.findByIdAndUpdate(subdivisionoffice.divisionOffice, {
        $pull: { subdivisionOffices: subdivisionoffice._id }
      });
    }

    await SubdivisionOffice.findByIdAndDelete(req.params.id);
    res.json({ message: 'SubdivisionOffice deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});






router.delete('/sectionoffices/:id', async (req, res) => {
  try {
    const sectionoffices = await SectionOffice.findById(req.params.id);
    
    if (!sectionoffices) {
      return res.status(404).json({ message: 'SectionOffice not found' });
    }

    if (sectionoffices.dams.length > 0) {
      return res.status(400).json({ message: 'Cannot delete SectionOffice with existing dams' });
    }
    if (sectionoffices.reservoir.length > 0) {
      return res.status(400).json({ message: 'Cannot delete SectionOffice with existing reservoir' });
    }

    const ReservoirwSO = await Reservoir.findOne({ sectionOffice: req.params.id });
    if (ReservoirwSO) {
      return res.status(400).json({ message: 'Cannot delete SectionOffice with existing Reservoirs' });
    }

    await SubdivisionOffice.findByIdAndUpdate(sectionoffices.subDivision, {
      $pull: { sectionOffices: sectionoffices._id }
    });

    await SectionOffice.findByIdAndDelete(req.params.id);
    res.json({ message: 'SectionOffice deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



 router.delete('/dams/:id', async (req, res) => {
  try {
    const dams = await Dam.findById(req.params.id);
    
    if (!dams) {
      return res.status(404).json({ message: 'Dam not found' });
    }

    if (dams.subdam.length > 0) {
      return res.status(400).json({ message: 'Cannot delete Dam with existing subdam' });
    }

    await SectionOffice.findByIdAndUpdate(dams.sectionOffice, {
      $pull: { dams: dams._id }
    });

    await Dam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dam deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.delete('/subdams/:id', async (req, res) => {
  try {
    const subdam = await Subdam.findById(req.params.id);

    if (!subdam) {
      return res.status(404).json({ message: 'Subdam not found' });
    }

    if (subdam.reservoir.length > 0) {
      return res.status(400).json({ message: 'Cannot delete subdam with existing reservoirs' });
    }

    // If the subdam is linked to a dam, remove its reference from the dam
    if (subdam.dam) {
      await Dam.findByIdAndUpdate(subdam.dam, {
        $pull: { subdam: subdam._id }
      });
    }

    await Subdam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subdam deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.delete('/reservoirs/:id', async (req, res) => {
  try {
    // Find the reservoir by ID
    const reservoir = await Reservoir.findById(req.params.id);
    if (!reservoir) {
      return res.status(404).json({ error: "Reservoir not found" });
    }

    // Extract identifying fields
    const { name, sectionOffice, subdam } = reservoir;

    // Delete the reservoir
    await Subdam.findByIdAndUpdate(reservoir.subdam, {
        $pull: { reservoir: reservoir._id }
      });
    await Reservoir.findByIdAndDelete(req.params.id);

    // Delete matching entry in ReservoirList
    await ReservoirList.findOneAndDelete({ name, sectionOffice, subdam });

    res.json({ message: "Reservoir and corresponding ReservoirList entry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  // PUT /corporations/:id
router.put('/corporations/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await Corporation.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Corporation not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT /ceoffices/:id
router.put('/ceoffices/:id', async (req, res) => {
  try {
    const ceOffice = await CEOffice.findById(req.params.id);
    if (!ceOffice) return res.status(404).json({ message: 'CEOffice not found' });

    const updateFields = {};
    if (req.body.name !== undefined) updateFields.name = req.body.name;

    if (req.body.corporation && req.body.corporation !== String(ceOffice.corporation)) {
      await Corporation.findByIdAndUpdate(ceOffice.corporation, {
        $pull: { ceOffices: ceOffice._id }
      });
      await Corporation.findByIdAndUpdate(req.body.corporation, {
        $addToSet: { ceOffices: ceOffice._id }
      });
      updateFields.corporation = req.body.corporation;
    }

    const updated = await CEOffice.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// PUT /circleoffices/:id
router.put('/circleoffices/:id', async (req, res) => {
  try {
    const circleOffice = await CircleOffice.findById(req.params.id);
    if (!circleOffice) return res.status(404).json({ message: 'CircleOffice not found' });

    const updateFields = {};
    if (req.body.name !== undefined) updateFields.name = req.body.name;

    if (req.body.ceOffice && req.body.ceOffice !== String(circleOffice.ceOffice)) {
      await CEOffice.findByIdAndUpdate(circleOffice.ceOffice, {
        $pull: { circleOffices: circleOffice._id }
      });
      await CEOffice.findByIdAndUpdate(req.body.ceOffice, {
        $addToSet: { circleOffices: circleOffice._id }
      });
      updateFields.ceOffice = req.body.ceOffice;
    }

    const updated = await CircleOffice.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// PUT /divisionoffices/:id
router.put('/divisionoffices/:id', async (req, res) => {
  try {
    const divisionOffice = await DivisionOffice.findById(req.params.id);
    if (!divisionOffice) return res.status(404).json({ message: 'DivisionOffice not found' });

    const updateFields = {};
    if (req.body.name !== undefined) updateFields.name = req.body.name;

    if (req.body.circleOffice && req.body.circleOffice !== String(divisionOffice.circleOffice)) {
      await CircleOffice.findByIdAndUpdate(divisionOffice.circleOffice, {
        $pull: { divisionOffices: divisionOffice._id }
      });
      await CircleOffice.findByIdAndUpdate(req.body.circleOffice, {
        $addToSet: { divisionOffices: divisionOffice._id }
      });
      updateFields.circleOffice = req.body.circleOffice;
    }

    const updated = await DivisionOffice.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// PUT /subdivisions/:id
router.put('/subdivisionoffices/:id', async (req, res) => {
  try {
    const subDivision = await SubdivisionOffice.findById(req.params.id); // ✅ Correct model

    if (!subDivision) {
      return res.status(404).json({ message: 'SubdivisionOffice not found' });
    }

    const updateFields = {};

    if (req.body.name !== undefined) {
      updateFields.name = req.body.name;
    }

    // ✅ Check for divisionOffice change
    if (req.body.divisionOffice && req.body.divisionOffice !== String(subDivision.divisionOffice)) {
      // Remove from old DivisionOffice
      await DivisionOffice.findByIdAndUpdate(subDivision.divisionOffice, {
        $pull: { subdivisionOffices: subDivision._id } // ✅ Correct field
      });

      // Add to new DivisionOffice
      await DivisionOffice.findByIdAndUpdate(req.body.divisionOffice, {
        $addToSet: { subdivisionOffices: subDivision._id } // ✅ Correct field
      });

      updateFields.divisionOffice = req.body.divisionOffice;
    }

    const updated = await SubdivisionOffice.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// PUT /sectionoffices/:id
router.put('/sectionoffices/:id', async (req, res) => {
  try {
    const sectionOffice = await SectionOffice.findById(req.params.id);
    if (!sectionOffice) return res.status(404).json({ message: 'SectionOffice not found' });

    const updateFields = {};
    if (req.body.name !== undefined) updateFields.name = req.body.name;

    if (req.body.subdivisionOffice && req.body.subdivisionOffice !== String(sectionOffice.subdivisionOffice)) {
      await SubdivisionOffice.findByIdAndUpdate(sectionOffice.subdivisionOffice, {
        $pull: { sectionOffices: sectionOffice._id }
      });
      await SubdivisionOffice.findByIdAndUpdate(req.body.subDivision, {
        $addToSet: { sectionOffices: sectionOffice._id }
      });
      updateFields.subdivisionOffice = req.body.subdivisionOffice;
    }

    const updated = await SectionOffice.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// PUT /dams/:id
router.put('/damsInfo/:id', async (req, res) => {
  try {
    const dam = await Dam.findById(req.params.id);
    if (!dam) return res.status(404).json({ message: 'Dam not found' });

    const updateFields = {};

    // Optional updates
    if (req.body.name !== undefined) updateFields.name = req.body.name;
    if (req.body.damwater !== undefined) updateFields.damwater = req.body.damwater;
    if (req.body.capacity !== undefined) updateFields.capacity = req.body.capacity;
    if (req.body.capacityTMC !== undefined) updateFields.capacityTMC = req.body.capacityTMC;
    if (req.body.subdam !== undefined) updateFields.subdam = req.body.subdam;

    // Handle parent change: sectionOffice
    if (req.body.sectionOffice && req.body.sectionOffice !== String(dam.sectionOffice)) {
      // Remove dam from old sectionOffice
      await SectionOffice.findByIdAndUpdate(dam.sectionOffice, {
        $pull: { dams: dam._id }
      });
      // Add dam to new sectionOffice
      await SectionOffice.findByIdAndUpdate(req.body.sectionOffice, {
        $addToSet: { dams: dam._id }
      });
      updateFields.sectionOffice = req.body.sectionOffice;
    }

    // Update the dam but do not touch `data`
    const updatedDam = await Dam.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.json(updatedDam);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



router.put('/subdams/:id', async (req, res) => {
  try {
    const subdam = await Subdam.findById(req.params.id);
    if (!subdam) return res.status(404).json({ message: 'Subdam not found' });

    const updateFields = {};
    if (req.body.name !== undefined) updateFields.name = req.body.name;

    if (req.body.dam && req.body.dam !== String(subdam.dam)) {
      await Dam.findByIdAndUpdate(subdam.dam, {
        $pull: { subdam: subdam._id }
      });
      await Dam.findByIdAndUpdate(req.body.dam, {
        $addToSet: { subdam: subdam._id }
      });
      updateFields.dam = req.body.dam;
    }

    const updated = await Subdam.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/reservoirsInfo/:id', async (req, res) => {
  try {
    const reservoir = await Reservoir.findById(req.params.id);
    if (!reservoir) return res.status(404).json({ message: 'Reservoir not found' });

    const updateFields = {};

    // Optional updates (but we skip waterLevels and situation)
    if (req.body.name !== undefined) updateFields.name = req.body.name;
    if (req.body.alertL !== undefined) updateFields.alertL = req.body.alertL;
    if (req.body.dangerL !== undefined) updateFields.dangerL = req.body.dangerL;
    if (req.body.lowL !== undefined) updateFields.lowL = req.body.lowL;

    // Handle sectionOffice parent switch
    if (req.body.sectionOffice && String(req.body.sectionOffice) !== String(reservoir.sectionOffice)) {
      await SectionOffice.findByIdAndUpdate(reservoir.sectionOffice, {
        $pull: { reservoirs: reservoir._id }
      });
      await SectionOffice.findByIdAndUpdate(req.body.sectionOffice, {
        $addToSet: { reservoirs: reservoir._id }
      });
      updateFields.sectionOffice = req.body.sectionOffice;
    }

    // Handle subdam parent switch
    if (req.body.subdam && String(req.body.subdam) !== String(reservoir.subdam)) {
      await Subdam.findByIdAndUpdate(reservoir.subdam, {
        $pull: { reservoir: reservoir._id }
      });
      await Subdam.findByIdAndUpdate(req.body.subdam, {
        $addToSet: { reservoir: reservoir._id }
      });
      updateFields.subdam = req.body.subdam;
    }

    // Apply update
    const updatedReservoir = await Reservoir.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    // Update corresponding ReservoirList
    const listUpdateFields = {
      name: updatedReservoir.name,
      sectionOffice: updatedReservoir.sectionOffice,
      subdam: updatedReservoir.subdam,
      alertL: updatedReservoir.alertL,
      dangerL: updatedReservoir.dangerL,
      lowL: updatedReservoir.lowL
    };

    await ReservoirList.findOneAndUpdate(
      { name: reservoir.name }, // match original name
      { $set: listUpdateFields },
      { new: true }
    );

    res.json({ message: 'Reservoir updated successfully', updatedReservoir });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});





module.exports = router;


