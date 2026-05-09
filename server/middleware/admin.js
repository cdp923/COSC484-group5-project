const admin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Access denied, admins only" });
  }
  next();
};

module.exports = admin;
