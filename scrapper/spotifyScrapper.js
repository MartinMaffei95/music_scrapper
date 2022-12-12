const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');
const fs = require('fs');
const path = require('path');

const autoScroll = async (page, queryMain) => {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let main = document.querySelector(
        '.os-viewport-native-scrollbars-invisible'
      );
      let totalHeight = 0;
      let distance = 900;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        main.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
};

const spotifyUrl = (url) => {
  let lastFiveChar = url.slice(-5);

  if (lastFiveChar === '&nd=1') return url;
  else {
    let newUrl = url + '&nd=1';
    return newUrl;
  }
};
const spotifyScrapper = async (playlistUrl) => {
  const header =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent(header);
  await page.setViewport({ width: 1360, height: 768 });

  /*
     @return Array
  */
  const cookies = await page.cookies();
  await page.setCookie(...cookies);

  await page.goto(spotifyUrl(playlistUrl), {
    waitUntil: 'networkidle0',
  });

  //   //all songs
  await page.waitForSelector('.h4HgbO_Uu1JYg5UGANeQ ');
  let songs = await page.$$('.h4HgbO_Uu1JYg5UGANeQ ');

  const [span] = await page.$x("//span[contains(., 'canciones')]");
  const getNumber = await page.evaluate((s) => s.innerText, span);
  const songsLength = Number(getNumber.split(' ')[0]);

  await autoScroll(page);
  let playlist = {
    playlist_id: '',
    playlist_name: '',
    number_of_songs: 0,
    playlist_songs: [],
  };
  let playlist_songs = [];

  //first find playlist name
  const titleNode = await page.$('h1.fhrvNw');
  const title = await page.evaluate((t) => t.innerText, titleNode);

  const normalizedTitle = title.toLowerCase().split(' ').join('_');
  playlist.playlist_id = normalizedTitle;
  playlist.playlist_name = title;
  playlist.number_of_songs = songsLength;

  let lastScrapedItem = 0;

  //now find on every song
  const scrapSongs = async () => {
    console.log('--> Canciones:', `${lastScrapedItem}/${songsLength}`);
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const number = await song.$('.NZAU7CsuZsMeMQB8zYUu');
      const getNumber = await page.evaluate((s) => s.innerText, number);
      const songName = await song.$('a div.kHHFyx');
      const songName_name = await page.evaluate((s) => s.innerText, songName);
      const songArtists = await song.$$('span.dvSMET a');
      let songArtist_names = [];
      for (artist of songArtists) {
        await songArtist_names.push(
          await artist.evaluate((s) => s.innerText, songArtists)
        );
      }

      const songObj = {
        name: songName_name,
        artist: songArtist_names,
        album: '',
        indexOnList: getNumber,
        href: '',
      };
      if (
        !playlist_songs.find((song) => song.indexOnList === songObj.indexOnList)
      )
        playlist_songs.push(songObj);
      lastScrapedItem = getNumber;
    }
    await autoScroll(page);

    let lastScrap = await page.$$('.h4HgbO_Uu1JYg5UGANeQ');

    if (lastScrapedItem < songsLength) {
      songs = await page.$$('.h4HgbO_Uu1JYg5UGANeQ');
      await scrapSongs();
    }
  };

  await scrapSongs();

  playlist.playlist_songs = playlist_songs;
  fs.writeFileSync(
    path.join(__dirname, 'playlists', `${playlist.playlist_id}.json`),
    JSON.stringify(playlist, null, 2)
  );

  browser.close();
  return playlist;
};

module.exports = { spotifyScrapper };
