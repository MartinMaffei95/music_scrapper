const puppeteer = require('puppeteer');
const fs = require('fs');
const { loginWithGoogle } = require('./YTLogin');
const testArr = require('../scrapper/playlists/canta_en_el_auto');
const { Console } = require('console');

const isTheSong = (songToFind, searchResult) => {
  const regex = /[-]/g;

  let normalizedResult = normalize(searchResult);
  // let normalizedSong = normalize(songToFind).replace(regex, ' ');
  let normalizedSong = normalize(songToFind);

  if (normalizedResult === normalizedSong) {
    return true;
  }

  if (normalize(normalizedResult, false) === normalize(normalizedSong, true))
    return true;
  if (
    normalize(normalizedResult, true, true) ===
    normalize(normalizedSong, true, true)
  )
    return true;

  return false;
};
const isTheArtst = (artistOfSong, artistOfResult) => {
  const regex = /[-]/g;

  let lowerArtists = artistOfResult?.map((element) => {
    return normalize(element);
  });

  for (let i = 0; i < artistOfSong.length; i++) {
    let artist = normalize(artistOfSong[i]);
    if (lowerArtists.includes(artist)) {
      return true;
    } else if (lowerArtists.includes(artist.replace(regex, ' '))) {
      return true;
    }
  }
  return false;
};

const normalize = (
  string,
  brackets = false,
  onlyBeforeMidDash = false,
  word = ''
) => {
  const cancelWord = new RegExp(word + '\b', 'g');
  const bracketsRegex = /\([^)]*\)/g;

  let normalizedString = string
    .toLowerCase()
    .normalize('NFD')
    .replace(/[-]/g, ' ')

    .replace(onlyBeforeMidDash ? /[^-]+$/g : '', '')
    .replace(/[']|[,]/g, '')
    .replace(brackets ? bracketsRegex : '', '')
    .replace(/((feat)|(ft\b))|[().-]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/remix\b/g, '')
    .replace(cancelWord, '')
    .replace(/[ \t]{2,}/g, ' ');

  return normalizedString;
};

const refinedFilter = (songTitle, artist, songResult, conditional = 'and') => {
  let regexSong = new RegExp(normalize(songTitle, true, true), 'g');
  let regexArtist = new RegExp(normalize(artist, true, true), 'g');
  console.log(songResult);
  console.log(
    '--- BUSCANDO: ',
    normalize(songTitle),
    ' DE ',
    normalize(artist),
    ' |=>>> ',
    normalize(songResult)
  );
  if (conditional === 'and') {
    if (
      regexSong.test(normalize(songResult)) &&
      regexArtist.test(normalize(songResult))
    ) {
      return true;
    }
  }

  if (conditional === 'or') {
    if (
      regexSong.test(normalize(songResult)) ||
      regexArtist.test(normalize(songResult))
    ) {
      console.log('entrtamo ak');
      return true;
    }
  }
  console.log('xxx NO CONCUERDA', songTitle, artist, songResult);
  return false;
};
const includesNameAndArtist = (
  songTitle,
  songArtist,
  songResult,
  conditional = 'and'
) => {
  for (let i = 0; i < songArtist.length; i++) {
    const artist = songArtist[i];
    return refinedFilter(songTitle, artist, songResult, conditional);
  }
  console.log('xxx NO CONCUERDA', songTitle, songArtist, songResult);
  return false;
};

const getSearchUri = (string) => {
  const chars = {
    ',': '%2C',
    ':': '%3A',
    '`': '%60',
    '%': '%25',
    "'": '%27',
    '?': '%3F',
    '@': '%40',
    '#': '%23',
    $: '%24',
    ' ': '+',
  };
  const replaced = string.replace(/[,:`%'?@#$ ]/g, (m) => chars[m]);
  return replaced;
};

const ytMusicScrapper = async (playlistToConvert) => {
  const findAndSave = async (playlistName, quantityOfSongs, playlistSong) => {
    console.log('***************************');
    console.log(
      `>>> Visitando url: https://music.youtube.com/search?q=${await getSearchUri(
        `${playlistSong?.name} ${playlistSong?.artist[0]}`
      )}`
    );
    await page.goto(
      `https://music.youtube.com/search?q=${await getSearchUri(
        `${playlistSong?.name} ${playlistSong?.artist[0]}`
      )}`,
      {
        waitUntil: 'networkidle0',
      }
    );
    console.log(
      `>>> ${playlistSong?.indexOnList}/${quantityOfSongs}`,
      'Cancion: ',
      playlistSong?.name,
      '| Artista: ',
      playlistSong?.artist[0]
    );
    try {
      await page.waitForSelector(
        'ytmusic-shelf-renderer.style-scope.ytmusic-section-list-renderer ytmusic-responsive-list-item-renderer tp-yt-iron-icon#icon'
      );
      //## open conext menu for add on list
      const treeP = await page.$(
        'ytmusic-shelf-renderer.style-scope.ytmusic-section-list-renderer ytmusic-responsive-list-item-renderer tp-yt-iron-icon#icon'
      );
      const sections = await page.$$(
        'ytmusic-shelf-renderer.style-scope.ytmusic-section-list-renderer'
      );
      let haveResult = false;

      for (section of sections) {
        if (haveResult === true) {
          break;
        }
        const section_name = await section.$('div.header h2.title');
        const section_name_text = await page.evaluate(
          (text) => text.innerText,
          section_name
        );

        //recolect data
        //here comes the data
        let title;
        let filter = '';
        let aTags = [];
        let artist = ''; // aTags items but the last
        let album = ''; // last item of aTags

        const scrapOneSection = async (section) => {
          const songs = await section.$$(
            'div#contents ytmusic-responsive-list-item-renderer'
          );
          //Scraping every song+

          for (songOfSection of songs) {
            if (haveResult === true) return (haveResult = true);
            const title_node = await songOfSection.$(
              'div.flex-columns div.title-column yt-formatted-string'
            );
            const title_text = await page.evaluate(
              (htmlnode) => htmlnode.getAttribute('title'),
              title_node
            );
            title = title_text;

            const dataSong_node = await songOfSection.$(
              'div.flex-columns div.secondary-flex-columns yt-formatted-string'
            );
            const dataSong_node_childrens = await dataSong_node.$$('*');

            for (node of dataSong_node_childrens) {
              const text = await page.evaluate(
                (htmlnode) => htmlnode.innerText,
                node
              );
              const tagName = await page.evaluate(
                (htmlnode) => htmlnode.tagName,
                node
              );
              if (
                tagName === 'SPAN' &&
                (text === 'Canción' || text === 'Sencillo' || text === 'Video')
              ) {
                filter = text;
              }
              if (tagName === 'A' && text !== ' • ') {
                aTags.push(text);
              }
            }

            switch (filter) {
              case 'Canción':
                if (haveResult === true) return;
                album = aTags.pop();
                artist = aTags;
                //if is a song and the artist is what we loogin for make click. else keep searching in other section
                if (
                  (isTheArtst(playlistSong?.artist, artist) &&
                    isTheSong(playlistSong?.name, title)) ||
                  includesNameAndArtist(
                    playlistSong?.name,
                    playlistSong?.artist,
                    title,
                    'or'
                  )
                ) {
                  try {
                    haveResult = true;
                    console.log('>>> RESULTADO ENCONTRADO:');
                    console.log(filter, ' | ', title);
                    await songOfSection.click({
                      button: 'right',
                    });
                  } catch (e) {
                    console.log('ERROR EN EL CLICK ===>', filter, e);
                  }
                }
                break;
              case 'Single' || 'Sencillo':
                album = aTags.pop();
                artist = aTags;
                console.log(filter, haveResult);

                if (haveResult === true) return;
                if (
                  (isTheArtst(playlistSong?.artist, artist) &&
                    isTheSong(playlistSong?.name, title)) ||
                  includesNameAndArtist(
                    playlistSong?.name,
                    playlistSong?.artist,
                    title,
                    'or'
                  )
                ) {
                  try {
                    haveResult = true;
                    console.log('>>> RESULTADO ENCONTRADO:');
                    console.log(filter, ' | ', title);
                    await songOfSection.click({
                      button: 'right',
                    });
                  } catch (e) {
                    console.log('ERROR EN EL CLICK ===>', filter);
                  }
                }
                break;
              case 'Video':
                artist = await aTags;

                if (haveResult === true) return;
                if (
                  (isTheArtst(playlistSong?.artist, artist) &&
                    isTheSong(playlistSong?.name, title)) ||
                  includesNameAndArtist(
                    playlistSong?.name,
                    playlistSong?.artist,
                    title
                  )
                ) {
                  try {
                    haveResult = true;
                    console.log('>>> RESULTADO ENCONTRADO:');
                    console.log(filter, ' | ', title);
                    await songOfSection.click({ button: 'right' });
                  } catch (e) {
                    console.log('ERROR EN EL CLICK ===>', filter);
                  }
                }
                break;

              default:
                break;
            }
            break;
          }
        };

        if (section_name_text === 'Mejor resultado') {
          if (haveResult === true) return;
          await scrapOneSection(section);
        } else if (section_name_text === 'Canciones') {
          if (haveResult === true) return;
          await scrapOneSection(section);
        } else if (section_name_text === 'Videos') {
          if (haveResult === true) return;
          await scrapOneSection(section);
        } else {
          console.log('xxx ERROR xxx ');
          console.log(
            'xxx No se encontró ningun resultado de: ',
            '| Cancion: ',
            playlistSong?.name,
            '| Artista: ',
            playlistSong?.artist
          );
          return;
        }
      }
    } catch (e) {
      console.log(
        'xxx Error: No se encontraron resultados de: ',
        playlistSong?.name,
        playlistSong?.artist
      );
      return;
    }

    // 1) check the sections ('Mejor resultado' & 'Canciones')
    // 2) if the title is the same & is a song make a click. else keep searching

    //scrapping section and return data of song

    try {
      // ## traverse a list and make click on "Add to list" button
      const listItems = await page.$$(
        'ytmusic-menu-navigation-item-renderer.style-scope.ytmusic-menu-popup-renderer'
      );

      for (item of listItems) {
        const link = await item.$('yt-formatted-string');
        const textLink = await page.evaluate((text) => text.innerText, link);

        if (textLink.includes('Agregar a lista de reproducción')) {
          try {
            console.log('+++ Agregando a lista de reproducción');
            await item.click();
            break;
          } catch (e) {
            console.error('··· Falló el click en link', e, link);
            browser.close();
          }
        }
      }
    } catch (e) {
      console.log('xxx ERROR xxx ');
      console.log(
        'xxx No se encontró ningun resultado de: ',
        '| Cancion: ',
        playlistSong?.name,
        '| Artista: ',
        playlistSong?.artist
      );
      return;
    }

    //  Now, first:
    //  if() list exist in created lists
    //  click on that list and add song.

    await page.waitForSelector('ytmusic-playlist-add-to-option-renderer');
    const playlists = await page.$$('ytmusic-playlist-add-to-option-renderer');
    const createPlaylistBtn = await page.$(
      'ytmusic-add-to-playlist-renderer.style-scope.ytmusic-popup-container div#actions.style-scope.ytmusic-add-to-playlist-renderer'
    );
    let isExistentList = false;

    for (list of playlists) {
      const playlist_name = await list.$('yt-formatted-string#title');
      const playlist_button = await list.$(
        'button.style-scope.ytmusic-playlist-add-to-option-renderer'
      );
      const playlist_name_text = await page.evaluate(
        (text) => text.innerText,
        playlist_name
      );
      if (playlist_name_text.includes(playlistName)) {
        isExistentList = true;
        try {
          await playlist_button.click();
          console.log('>>> Agregado a lista de reproducción');
          break;
        } catch (e) {
          console.log(
            'xxx Falló el click en playlist_name',
            e,
            playlist_button
          );
          console.log('ABORT');
          browser.close();
        }
      }
    }

    // => this only executes if the list no exist - in the first round -
    // create list(in the same acction the song is added)
    if (!isExistentList) {
      console.log('+++ Creando lista de reproducción');
      await createPlaylistBtn.click();
      await page.waitForSelector(
        '#actions.style-scope.ytmusic-add-to-playlist-renderer'
      );
      const pl_title = await page.$(
        '#actions.style-scope.ytmusic-add-to-playlist-renderer'
      );
      const createBtn = await page.$(
        '.style-scope.ytmusic-playlist-form.style-primary a.yt-simple-endpoint.style-scope.yt-button-renderer'
      );
      await page.type('input.style-scope.tp-yt-paper-input', playlistName);
      await createBtn.click();
      console.log('>>> Lista de reproducción creada');
    }
  };
  const header =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent(header);
  await page.setViewport({ width: 1360, height: 768 });

  /*
  /* Login
  */
  try {
    const credentialsJSON = await fs.readFileSync('./credentials.json');
    const credentials = JSON.parse(credentialsJSON);
    await page.setCookie(...credentials);
    const navigationPromise = page.waitForNavigation();
  } catch (e) {
    await page.goto(`https://music.youtube.com/`, {
      waitUntil: 'networkidle0',
    });
    const loginBtn = await page.$('a.sign-in-link.style-scope.ytmusic-nav-bar');

    if (loginBtn != null) {
      const loginBtn_href = await page.evaluate(
        (htmlnode) => htmlnode.getAttribute('href'),
        loginBtn
      );
      await loginWithGoogle(loginBtn_href);
      const credentialsJSON = await fs.readFileSync('./credentials.json');
      const credentials = JSON.parse(credentialsJSON);
      await page.setCookie(...credentials);
      const navigationPromise = page.waitForNavigation();
      await await page.reload();
    }
  }

  /*
     @return Array
  */

  for (let i = 0; i < playlistToConvert?.number_of_songs; i++) {
    const song = playlistToConvert?.playlist_songs[i];
    await findAndSave(
      playlistToConvert?.playlist_name,
      playlistToConvert?.number_of_songs,
      song
    );
  }

  //now find the url of playlist
  //https://music.youtube.com/library/playlists
  //finally return the list url

  await page.goto(`https://music.youtube.com/library/playlists`, {
    waitUntil: 'networkidle0',
  });
  const myPlaylists = await page.$$(
    'div#items ytmusic-two-row-item-renderer.style-scope.ytmusic-grid-renderer'
  );
  const getPlaylistURL = async (playlistsElem) => {
    for (playlist of playlistsElem) {
      const playlist_name = await playlist.$(
        'div.details div.title-group yt-formatted-string.title a.yt-simple-endpoint'
      ); //=> <a/>
      const playlist_name_text = await page.evaluate(
        (htmlnode) => htmlnode.innerText,
        playlist_name
      );
      const playlist_name_href = await page.evaluate(
        (htmlnode) => htmlnode.getAttribute('href'),
        playlist_name
      );

      if (playlist_name_text === playlistToConvert?.playlist_name) {
        return playlist_name_href;
      }
    }
  };

  const palylist_url = await getPlaylistURL(myPlaylists);
  if (palylist_url === undefined) {
    console.log('xxx ERRROR xxx');
    console.log('No se pudo obtener el link de la playlist');
    return browser.close();
  }
  console.log('FINALIZADA LA LISTA DE REPRODUCCION');
  console.log('PUEDES ACCEDER DESDE EL LINK: ');
  console.log(`https://music.youtube.com/${palylist_url}`);
  browser.close();
};

// let res = 'Kim Loaiza Ft. De La Ghetto, Darell y KEVVO - Apreton';
// let songTitle = 'Apreton';
// let songArtist = ['Kim Loaiza', 'Elvis de Yongol'];

// console.log(includesNameAndArtist(songTitle, songArtist, res));
// // console.log(includesNameAndArtist(songTitle,songArtist,res));

// ytMusicScrapper(testArr);

module.exports = { ytMusicScrapper, getSearchUri };
