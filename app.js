require('dotenv').config();
const prompt = require('prompt');
const { initializeScrapping } = require('./scrapper');

// Start the prompt
prompt.start();
prompt.get(
  [{ description: 'Enter the playlist URL of spotify', name: 'palylist_url' }],
  function (err, result) {
    //
    // Log the results.
    //
    console.log('Command-line input received:');
    console.log('>>> URL of spotify: ' + result.palylist_url);
    console.log('+++ Analizando tu lista de spotify');
    initializeScrapping(result.palylist_url);
  }
);
