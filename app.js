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

// const getDataSong = (string) => {
//   // example string :
//   //this =>     "Canción • Bad Bunny • Un Verano Sin Ti • 4:04"
//   //or this =>  "Canción • Arse, Midel y KHEA • B.U.H.O • 4:59"

//   let props = string.split(' • ');
//   let spliced = props[1].split();
//   console.log(props);
// };

// const artistOfSong = ['Emilia'];
// const artistOfResult = ['Trueno', 'Wos', 'Duki', 'Dillom', 'Bzrp'];

// const isTheArtst = (artistOfSong, artistOfResult) => {
//   for (let i = 0; i < artistOfSong.length; i++) {
//     const artist = artistOfSong[i];
//     if (artistOfResult.includes(artist)) {
//       return true;
//     }
//   }
//   return false;
// };
// const isTheArtst = (artistOfSong, artistOfResult) => {
//   const regex = /[-]/g;

//   let lowerArtists = artistOfResult?.map((element) => {
//     return element
//       ?.toLowerCase()
//       .normalize('NFD')
//       .replace(/[\u0300-\u036f]/g, '');
//   });

//   for (let i = 0; i < artistOfSong.length; i++) {
//     let artist = artistOfSong[i]
//       .toLowerCase()
//       .normalize('NFD')
//       .replace(/[\u0300-\u036f]/g, '');
//     if (lowerArtists.includes(artist)) {
//       return true;
//     } else if (lowerArtists.includes(artist.replace(regex, ' '))) {
//       return true;
//     }
//   }
//   return false;
// };

// console.log(
//   isTheArtst(['La Mosca Tse-Tse'], ['La Mosca Tse Tse', 'Karaokemedia'])
// );
// console.log(isTheArtst(['La Mosca Tse-Tse'], ['La Mosca Tse Tse']));
