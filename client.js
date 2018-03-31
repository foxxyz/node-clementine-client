const { MsgType, MsgTypeName, ReasonDisconnectName, EngineStateName } = require('./proto')
const Connection = require('./connection')
const EventEmitter = require('events')


class Client extends EventEmitter {
    constructor({host, port=5500, authCode}) {
        super()
        this.conn = new Connection({ host, port })
        this.authCode = authCode
        this.conn.on('connect', this.connected.bind(this))
        this.conn.on('message', this.receive.bind(this))
    }
    connected() {
        var req = {
            sendPlaylistSongs: true,
            downloader: false
        }
        if (typeof this.authCode == 'number') {
            req.authCode = this.authCode
        }
        this.write({
            type: 'CONNECT',
            requestConnect: req
        })
        this.emit('connect')
    }
    changeSong(playlistId, songIndex) {
        this.write({
            type: 'CHANGE_SONG',
            requestChangeSong: {
                playlistId,
                songIndex
            }
        })
    }
    disconnect() {
        this.write({type: 'DISCONNECT'})
    }
    end() {
        this.disconnect()
    }
    getLibrary() {
        this.write({type: 'GET_LIBRARY'})
    }
    insertURLs(playlistId, urls, options) {
        options = options || {}
        this.write({
            type: 'INSERT_URLS',
            requestInsertUrls: {
                playlistId,
                urls,
                position: options.position || -1,
                playNow: options.playNow || false,
                enqueue: options.enqueue || false
            }
        })
    }
    next() {
        this.write({type: 'NEXT'})
    }
    play() {
        this.write({type: 'PLAY'})
    }
    playpause() {
        this.write({type: 'PLAYPAUSE'})
    }
    previous() {
        this.write({type: 'PREVIOUS'})
    }
    receive(msg) {
        switch (msg.type) {
            case MsgType.DISCONNECT:
                this.emit('disconnect', ReasonDisconnectName[msg.responseDisconnect.reasonDisconnect.toString()])
                break
            case MsgType.SET_VOLUME:
                this.volume = msg.requestSetVolume.volume
                this.emit('volume', this.volume)
                break
            case MsgType.PLAY:
            case MsgType.PLAYPAUSE:
            case MsgType.PAUSE:
            case MsgType.STOP:
            case MsgType.NEXT:
            case MsgType.PREVIOUS:
                this.emit(MsgTypeName[msg.type.toString()].toLowerCase())
                break
            case MsgType.REPEAT:
                this.repeat = msg.repeat.repeatMode
                this.emit('repeat', this.repeat)
                break
            case MsgType.SHUFFLE:
                this.shuffle = msg.shuffle.shuffleMode
                this.emit('shuffle', this.shuffle)
                break
            case MsgType.INFO:
                this.version = msg.responseClementineInfo.version
                this.emit('info', this.version)
                this.state = EngineStateName[msg.responseClementineInfo.state]
                if (this.state == 'Playing') this.emit('play')
                break
            case MsgType.CURRENT_METAINFO:
                this.song = msg.responseCurrentMetadata.songMetadata
                this.emit('song', this.song)
                break
            case MsgType.PLAYLISTS:
                this.playlistsList = msg.responsePlaylists.playlist
                this.emit('playlists', this.playlistsList)
                break
            case MsgType.PLAYLIST_SONGS:
                this.playlist = msg.responsePlaylistSongs.requestedPlaylist
                this.songs = msg.responsePlaylistSongs.songs
                break
            case MsgType.KEEP_ALIVE:
                this.emit('alive')
                break
            case MsgType.UPDATE_TRACK_POSITION:
                this.position = msg.responseUpdateTrackPosition.position
                this.emit('position', this.position)
                break
            case MsgType.ACTIVE_PLAYLIST_CHANGED:
                this.playlist_id = msg.responseActiveChanged.id
                break
            case MsgType.FIRST_DATA_SENT_COMPLETE:
                this.emit('ready')
                break
            case MsgType.LIBRARY_CHUNK:
                var res = msg.responseLibraryChunk

                // First chunk received, create a new array
                if (!this.libraryChunks) {
                    this.libraryChunks = []
                    for (var i = 0; i < res.chunkCount; i++) {
                        this.libraryChunks.push(null)
                    }
                }

                // Chunk received, add it to the array
                this.libraryChunks[res.chunkNumber - 1] = res.data.toBuffer()

                if (!~this.libraryChunks.indexOf(null)) { // All chunks were received
                    var db = Buffer.concat(this.libraryChunks)
                    this.libraryChunks = null
                    this.library.open(db, function () {
                        this.emit('library', this.library)
                    })
                }
                break
            default:
                console.warn('Unhandled message type', msg.type, msg)
                this.emit(MsgTypeName[msg.type.toString()].toLowerCase(), msg)
        }
    }
    setTrackPosition(position) {
        this.write({
            type: 'SET_TRACK_POSITION',
            requestSetTrackPosition: { position }
        })
    }
    setVolume(volume) {
        this.write({type: 'SET_VOLUME', requestSetVolume: { volume }})
    }
    shuffle() {
        this.write({type: 'SHUFFLE_PLAYLIST'})
    }
    stop() {
        this.write({type: 'STOP'})
    }
    write() {
        this.conn.write(...arguments)
    }
}

module.exports = Client