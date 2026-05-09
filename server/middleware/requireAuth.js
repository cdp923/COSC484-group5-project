const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || ""; // Authorization header
  const token = header.startsWith("Bearer ") ? header.slice(7) : null; // Bearer token

  if (!token) return res.status(401).json({ message: "JWT token missing" }); // If no token, return 401 making route unaccessible

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // verify token
    req.userId = payload.id; //saves user id to request object
    req.userRole = payload.role; //saves user role to request object
    next(); // continue to the route
  } catch (error) {
    return res.status(401).json({ message: "Invalid JWT token" });
  }
};
