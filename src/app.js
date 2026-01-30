require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin');

const app = express();

const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

module.exports = app;
