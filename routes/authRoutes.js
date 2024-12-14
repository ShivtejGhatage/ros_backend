const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
require('dotenv').config();


// Register User (Signup)
router.post('/register', async (req, res) => {
  const { username, name, password, designation, phoneNumber } = req.body;
  try {
    const user = new User({ username, name, password, designation, phoneNumber });
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

    res.json({
      username: user.username,
      name: user.name,
      designation: user.designation,
      phoneNumber: user.phoneNumber
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit User Information (except for username)
router.put('/user/edit', async (req, res) => {
  const { username, password, designation, phoneNumber } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (password) user.password = password;  
    if (designation) user.designation = designation; 
    if (phoneNumber) user.phoneNumber = phoneNumber; 

    await user.save();  

    res.json({ message: 'User information updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



module.exports = router;
