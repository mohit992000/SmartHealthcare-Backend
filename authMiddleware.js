const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Get token from header

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });

    req.user = user; // Attach user data to request
    next();
  });
}

// Middleware for role-based access control
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access Denied. You do not have permission." });
    }
    next();
  };
}

module.exports = { verifyToken, authorizeRoles };
