// spotifySetup.js
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

async function authenticateSpotifyApi() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body.access_token);
        console.log('Spotify API authentication successful');
    } catch (error) {
        console.error('Error authenticating with Spotify API:', error);
        throw error;
    }
}

module.exports = { spotifyApi, authenticateSpotifyApi };
