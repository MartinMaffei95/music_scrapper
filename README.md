# MusicScrapper

Permite pasar tus playlists de Spotify a YT-Music facilmente.

# Descripción

La app simula el comportamiento del usuario y automatiza la creacion de una playlist en YouTube-Music en base a otra de Spotify.
Por debajo utiliza [puppeteer](https://pptr.dev/) para hacer WebScrapping de la palylist.

Ingresa la url de tu lista de spotify
![Enter your Spotify url](https://github.com/MartinMaffei95/music_scrapper/blob/main/rmass/gifMS1.gif)
Esperamos a que el programa nos devuelva la url de YouTube Music!
![Get a link with your new url](https://github.com/MartinMaffei95/music_scrapper/blob/main/rmass/gifMS2.gif)

# Instalar

Copia o descarga el fichero desde github.

En la carpeta raiz usaremos [node](https://nodejs.org/es/download/) para instalar los paquetes de MusicScrapper.

```bash
npm i
```

# Como usar

Esta version no contiene GUI por lo tanto debemos ejecutarlo desde consola.

Crearemos el archivo .env con la siguiente configuracion:

```bash
G_USER = yourYTMusicUser@mail.com
G_PASS = yourYTMusicPass
```

> Estos datos son utilizados unicamente para el logeo en YT Music que permitira crear la lista.

Dentro de la carpeta raiz(MusiCrapper) ejecutaremos el comando

```bash
node app.js
```

> Esto nos retornara el siguiente prompt en el cual copiaremos la url de nuestra playlist.

```bash
prompt: Enter the playlist URL of spotify:
```

> Una vez oprimamos "Enter" comenzará a correr el programa.

Una vez se este ejecutando el programa simulará la actividad del usuario haciendo el siguiente circuito

### En SPOTIFY:

> Ingresa en la url de playlist

> Obtiene los datos necesarios para crear la nueva lista

> Una vez almacenada toda la data cambia de pestaña

### En YT-Music

> Chequea si estamos logeados(En base a cookies)

> En caso de que no estemos logeados simula el ingreso a la app en base a la informacion de '.env' y almacena la data en 'credentials.json')

> Comienza a buscar una por una las canciones de la playlist original y las va a agregando a la nueva (La app se ocupa de crearla también)

> Una vez finalizado todo el proceso nos retornara el Link de la lista creada para que la visitemos.

# Sobre el autor

Te invito a seguirme en [LinkedIn](https://www.linkedin.com/in/martinmaffei95/)
Y a ver mi [Portafolio](https://portafolio-mu-three.vercel.app/)

# Licencia

[MIT](https://choosealicense.com/licenses/mit/)
