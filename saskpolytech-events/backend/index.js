const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Event, User } = require('./models');  // Ensure User is imported!
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Server running'));

// Middleware: Authenticate JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  };
  
  // Middleware to check if user is an Admin
  const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admins only' });
    }
    next();
  };
  

  // Middleware to check user role
const checkRole = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
      next();
    };
  };
  

// Create new event (Only students and admins can create)
app.post('/events', authenticateToken, checkRole(['student', 'admin']), async (req, res) => {
  const { title, date, venue } = req.body;
  try {
    const event = await Event.create({
      title,
      date,
      venue,
      status: 'Pending',
      createdBy: req.user.email
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all events (Accessible to all)
app.get('/events', async (req, res) => {
  const events = await Event.findAll();
  res.json(events);
});

// Update event (Only event creators and admins can edit)
app.put('/events/:id', authenticateToken, checkRole(['admin', 'student']), async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  if (req.user.role !== 'admin' && req.user.email !== event.createdBy) {
    return res.status(403).json({ error: 'Unauthorized to edit this event' });
  }

  await event.update(req.body);
  res.json(event);
});

// Approve or Reject an Event (Admin Only)
app.put('/events/:id/approve', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.body; // "Approved" or "Rejected"
    
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
  
    const event = await Event.findByPk(req.params.id);
    if (event) {
      await event.update({ status });
      res.json({ message: `Event ${status}` });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  });
  

// Delete event (Only creators or admins can delete)
app.delete('/events/:id', authenticateToken, checkRole(['admin', 'student']), async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  if (req.user.role !== 'admin' && req.user.email !== event.createdBy) {
    return res.status(403).json({ error: 'Unauthorized to delete this event' });
  }

  await event.destroy();
  res.json({ message: 'Event deleted' });
});

// User Signup
app.post('/signup', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, role });
  
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: 'Server error' });
    }
  });
  

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Incorrect password' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

  res.json({ token, role: user.role });
});

// Start server
app.listen(5000, () => console.log('Server running on port 5000'));
