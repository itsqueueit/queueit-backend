// routes/featuredPlaylists.js
const express = require('express');
const router = express.Router();
const { spotifyApi } = require('../middleware/spotify/spotifySetup');

// Fetch featured playlists
router.get('/', async (req, res) => {
    try {
        const data = await spotifyApi.getFeaturedPlaylists({ limit: 10, offset: 0 });
        res.json(data.body.playlists);
    } catch (error) {
        console.error('Error fetching featured playlists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
