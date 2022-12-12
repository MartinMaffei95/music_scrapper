// First recibe url from palylist in spotify
// Create a new .js with that playlist
// Use the 'playlistname'.js in ytScrapper and that return rul of palylist in Youtube music

const { spotifyScrapper } = require('./spotifyScrapper');
const fs = require('fs');
const { ytMusicScrapper } = require('./ytScrapper');

const initializeScrapping = async (spotify_playlistUrl) => {
  const playlist = await spotifyScrapper(spotify_playlistUrl);
  await ytMusicScrapper(playlist);
};

module.exports = { initializeScrapping };
