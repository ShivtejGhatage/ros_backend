// accessRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

/* Helper */
const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ---------------------- GRANT RESERVOIR ---------------------- */
router.post('/grant/reservoir', async (req, res) => {
  const { userId, reservoirId } = req.body;
  if (!userId || !reservoirId) return res.status(400).json({ error: 'userId and reservoirId required' });
  if (!isObjectId(userId) || !isObjectId(reservoirId)) return res.status(400).json({ error: 'Invalid ObjectId' });

  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { allowedReservoirs: reservoirId } },
      { new: true, projection: { allowedReservoirs: 1 } }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ allowedReservoirs: updated.allowedReservoirs });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ---------------------- GRANT DAM ---------------------- */
router.post('/grant/dam', async (req, res) => {
  const { userId, damId } = req.body;
  if (!userId || !damId) return res.status(400).json({ error: 'userId and damId required' });
  if (!isObjectId(userId) || !isObjectId(damId)) return res.status(400).json({ error: 'Invalid ObjectId' });

  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { allowedDams: damId } },
      { new: true, projection: { allowedDams: 1 } }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ allowedDams: updated.allowedDams });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});




/* ---------------------- REVOKE RESERVOIR ---------------------- */
router.post('/revoke/reservoir', async (req, res) => {
  const { userId, reservoirId } = req.body;
  if (!userId || !reservoirId) return res.status(400).json({ error: 'userId and reservoirId required' });
  if (!isObjectId(userId) || !isObjectId(reservoirId)) return res.status(400).json({ error: 'Invalid ObjectId' });

  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      { $pull: { allowedReservoirs: reservoirId } },
      { new: true, projection: { allowedReservoirs: 1 } }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ allowedReservoirs: updated.allowedReservoirs });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ---------------------- REVOKE DAM ---------------------- */
router.post('/revoke/dam', async (req, res) => {
  const { userId, damId } = req.body;
  if (!userId || !damId) return res.status(400).json({ error: 'userId and damId required' });
  if (!isObjectId(userId) || !isObjectId(damId)) return res.status(400).json({ error: 'Invalid ObjectId' });

  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      { $pull: { allowedDams: damId } },
      { new: true, projection: { allowedDams: 1 } }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ allowedDams: updated.allowedDams });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
