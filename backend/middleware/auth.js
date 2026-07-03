const jwt = require('jsonwebtoken');

/**
 * protect – verifies JWT and attaches user to req.user
 */
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorised – no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorised – token invalid or expired' });
  }
};

/**
 * authorise – restrict access to specific roles
 * Usage: authorise('admin'), authorise('admin', 'alumni')
 */
const authorise = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied – requires role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

module.exports = { protect, authorise };
