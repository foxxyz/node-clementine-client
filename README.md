Clementine Client
=================

A Node.js library for interfacing with the [Clementine Music Player](https://www.clementine-player.org/).

This is as ES6 fork of emersion's [clementine-remote package](https://www.npmjs.com/package/clementine-remote) that *only* implements a bare-bones client (I.E. no library, server or browser support).

Requirements
------------

### Node.js 7+

 * OSX: `brew install node` using [Homebrew](http://brew.sh/)
 * Linux: `apt install nodejs` ([see Ubuntu/Debian specific instructions](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)) or `pacman -S nodejs` (Arch Linux)
 * Windows: [Install](https://nodejs.org/en/download/)

Installation
------------

 * `npm install clementine-client`

Example
-------

```js
// Dependencies
const ClementineClient = require('clementine-client')

// Create client
let client = new ClementineClient({host: '127.0.0.1', port: '5500', authCode: 2738})

// Bind events
client.on('connect', () => console.log('Connected!'))
client.on('error', (err) => console.error(err))
client.on('play', () => console.log('Playing')))

// Set volume to 50%
client.setVolume(50)

// Start playing
client.play()

```


:memo: Documentation
--------------------

### Class: Client

#### Event: 'alive'

The `alive` event is emitted while the client is successfully connected to Clementine.

#### Event: 'connect'

The `connect` event is emitted when the client successfully connects to Clementine.

#### Event: 'disconnect'

The `disconnect` event is emitted when Clementine disconnects.

#### Event: 'library'

 * `<LibraryInfo>`

The `library` event is emitted when a library is received from Clementine. The callback is passed a object with the current library.

#### Event: 'position'

 * `<Position>`

The `position` event is emitted while a track plays in Clementine. The callback is passed a number indicating the current position.

#### Event: 'play'

The `play` event is emitted when Clementine starts playing.

#### Event: 'repeat'

 * `<RepeatMode>`

The `repeat` event is emitted when the repeat mode is changed in Clementine. The callback is passed a string with the current RepeatMode.

#### Event: 'shuffle'

 * `<ShuffleMode>`

The `shuffle` event is emitted when the shuffle mode is changed in Clementine. The callback is passed a string with the current ShuffleMode.

#### Event: 'song'

 * `<SongInfo>`

The `song` event is emitted when the song changes in Clementine. The callback is passed a object with the current song info.

#### Event: 'volume'

 * `<Volume>`

The `volume` event is emitted when the volume changes in Clementine. The callback is passed a volume percentage argument (int).

#### client.changeSong(playlistId, songIndex)

 * `playlistId`
 * `songIndex`

Change the song in Clementine.

#### client.getLibrary()

Request the current library returned (will be returned via the `library` event)

#### client.insert(playlistId, urls, options)

 * `playlistId`
 * `urls`
 * `options`

Insert songs into the playlist.

#### client.next()

Play the next song.

#### client.play()

Play the currently selected song.

#### client.playpause()

Play or pause the currently selected song.

#### client.previous()

Play the previous song.

#### client.setTrackPosition(pos)

 * `pos`

Set the current track position.

#### client.setVolume(volume)

 * `volume`: Percentage

Set the current volume.

#### client.shuffle()

Shuffle the current playlist.

#### client.stop()

Stop playback.

:scroll: License
----------------

[MIT](https://github.com/foxxyz/node-clementine-client/blob/master/LICENSE) © [foxxyz](https://github.com/foxxyz)