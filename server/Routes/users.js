const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/users");
const auth = require("../middleware/requireAuth");
const admin = require("../middleware/admin");

// Get All
router.get("/", auth, admin, async (req, res) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }); // Exclude passwordHash from results
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash"); // Exclude passwordHash from result

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update current user
router.patch("/me", auth, async (req, res) => {
  try {
    const { password, ...fields } = req.body;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      fields.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: { ...fields, lastUpdated: new Date() } },
      { returnDocument: "after" },
    ).select("-passwordHash");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get One by ID (admin use)
router.get("/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { passwordHash: 0 }); // Exclude passwordHash from result

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update One by ID (admin use)
router.patch("/:id", auth, admin, async (req, res) => {
  try {
    const { password, ...fields } = req.body;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      fields.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { ...fields, lastUpdated: new Date() } },
      { returnDocument: "after" },
    ).select("-passwordHash");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete One
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
