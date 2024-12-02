const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');  // Get token from header
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    // Verify the token using the secret key from the environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user data to request object (e.g., user ID, designation)
    next();  // Proceed to the next middleware/route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
