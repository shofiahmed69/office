require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db/pool');
const usersMeRouter = require('./routes/usersMe');
const profilesRouter = require('./routes/profiles');
const preferencesRouter = require('./routes/preferences');
const tagsRouter = require('./routes/tags');
const profileTagsRouter = require('./routes/profileTags');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json());

// Health check (and DB connectivity)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

// API routes: /api/users/me (current user – requires Bearer token or X-User-Id)
app.use('/api/users/me', usersMeRouter);
// Legacy profile routes (optional)
app.use('/profiles', profilesRouter);
app.use('/profiles/:profileId/preferences', preferencesRouter);
app.use('/profiles/:profileId/tags', profileTagsRouter);
app.use('/tags', tagsRouter);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Profile API running at http://localhost:${PORT}`);
});
