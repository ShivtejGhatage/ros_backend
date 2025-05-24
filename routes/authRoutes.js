const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
require('dotenv').config();


// Register User (Signup)
router.post('/register', async (req, res) => {
  const { username, password,name,email, designation, phoneNumber } = req.body;
  try {
    const user = new User({ username, password, name, email, designation, phoneNumber });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login User (Authenticate and Generate JWT)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, designation: user.designation }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Information by Username
router.get('/user', async (req, res) => {
  const { username } = req.query; // Username passed in the query string

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Send user data excluding sensitive information (like password)
    res.json({
      userid: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      designation: user.designation,
      phoneNumber: user.phoneNumber,
      seenNotifications: user.seenNotifications
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit User Information (except for username)
router.put('/user/edit', async (req, res) => {
  const { username, password, name, email, designation, phoneNumber } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Only update non-username fields
    if (password) user.password = password;  // Update password if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (designation) user.designation = designation;  // Update designation if provided
    if (phoneNumber) user.phoneNumber = phoneNumber;  // Update phoneNumber if provided

    await user.save();  // Save the updated user information

    res.json({ message: 'User information updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/users/:userId/seenNotifications', async (req, res) => {
  const { userId } = req.params;
  const { seenNotifications } = req.body;
      console.log('Updating user', userId, 'with seenNotifications:', seenNotifications);

  if (!Array.isArray(seenNotifications)) {
    return res.status(400).json({ message: 'seenNotifications must be an array of notification IDs' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { seenNotifications }, // directly replace the array
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Updating user', userId, 'with seenNotifications:', seenNotifications);

    res.json({ message: 'Seen notifications updated', seenNotifications: user.seenNotifications });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
