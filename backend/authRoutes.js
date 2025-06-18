const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'backend/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

router.post('/register', upload.single('profile_picture'), async (req, res) => {
  const { email, password, institution, department, skills } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = new User({
      email,
      password: hashedPassword,
      institution,
      department,
      skills,
      profile_picture: req.file ? req.file.path : null
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

module.exports = router;