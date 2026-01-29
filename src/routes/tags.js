const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /tags - list all tags
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, slug, created_at FROM tags ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// POST /tags - create tag
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const slug = slugify(name) || 'tag';
    const { rows } = await pool.query(
      'INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING id, name, slug, created_at',
      [name.trim(), slug]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// GET /tags/:id - get one tag
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT id, name, slug, created_at FROM tags WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Tag not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// PATCH /tags/:id - update tag
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const slug = slugify(name) || 'tag';
    const { rows } = await pool.query(
      'UPDATE tags SET name = $2, slug = $3 WHERE id = $1 RETURNING id, name, slug, created_at',
      [id, name.trim(), slug]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Tag not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') res.status(409).json({ error: 'Tag with this name/slug already exists' });
    else res.status(500).json({ error: 'Failed to update tag' });
  }
});

// DELETE /tags/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Tag not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// Profile-tags: add/remove tags on a profile
// POST /profiles/:profileId/tags - add tag(s) to profile
// DELETE /profiles/:profileId/tags/:tagId - remove tag from profile

module.exports = router;
