const express = require('express');
const router = express.Router({ mergeParams: true });
const { pool } = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { rows } = await pool.query(
      'SELECT t.id, t.name, t.slug FROM tags t JOIN profile_tags pt ON t.id = pt.tag_id WHERE pt.profile_id = $1 ORDER BY t.name',
      [profileId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile tags' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { tagId, tagIds } = req.body;
    const ids = tagIds && Array.isArray(tagIds) ? tagIds : tagId != null ? [tagId] : [];
    if (ids.length === 0) return res.status(400).json({ error: 'Provide tagId or tagIds array' });
    const client = await pool.connect();
    try {
      for (const tid of ids) {
        await client.query(
          'INSERT INTO profile_tags (profile_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [profileId, tid]
        );
      }
      const { rows } = await client.query(
        'SELECT t.id, t.name, t.slug FROM tags t JOIN profile_tags pt ON t.id = pt.tag_id WHERE pt.profile_id = $1 ORDER BY t.name',
        [profileId]
      );
      res.status(201).json(rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add tags to profile' });
  }
});

router.delete('/:tagId', async (req, res) => {
  try {
    const { profileId, tagId } = req.params;
    const result = await pool.query(
      'DELETE FROM profile_tags WHERE profile_id = $1 AND tag_id = $2 RETURNING profile_id',
      [profileId, tagId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Profile tag link not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove tag from profile' });
  }
});

module.exports = router;
