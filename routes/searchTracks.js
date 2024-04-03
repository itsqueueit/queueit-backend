// routes/searchTracks.js
const express = require('express');
const router = express.Router();
const { spotifyApi } = require('../middleware/spotify/spotifySetup');

// Search tracks
router.get('/', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const data = await spotifyApi.searchTracks(query, { limit: 10 });
        res.json(data.body.tracks.items);
    } catch (error) {
        console.error('Error searching tracks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
