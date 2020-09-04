const { Duplex } = require('stream')
const net = require('net')

const { Message } = require('./proto')

// Basic class to set up a protobuf TCP connection
class Connection extends Duplex {
    constructor({ host, port }) {
        super()
        this.socket = net.connect({ host, port })
        this.buf = Buffer.alloc(0)
        this.len = null
        this.socket.on('connect', this.emit.bind(this, 'connect'))
        this.socket.on('data', this.receive.bind(this))
        this.socket.on('end', this.emit.bind(this, 'end'))
        this.socket.on('error', err => {
            console.error('Socket error', err)
            this.emit('error', err)
        })
    }
    receive(data) {
        if (this.buf.length > 0) {
            this.buf = Buffer.concat([this.buf, data])
        } else {
            this.buf = data
        }
        if (this.len === null) {
            this.len = this.buf.readUInt32BE(0)
            this.buf = this.buf.slice(4)
        }
        var msg
        while (this.len && this.buf.length >= this.len) {
            try {
                msg = Message.decode(this.buf.slice(0, this.len))
            } catch (e) {
                console.warn('Could not decode message', e)
                return
            }
            if (!msg) console.warn('Message is empty')
            else this.emit('message', msg)
            this.buf = this.buf.slice(this.len)

            if (this.buf.length > 0) {
                this.len = this.buf.readUInt32BE(0)
                this.buf = this.buf.slice(4)
            } else {
                this.len = null
            }
        }
    }
    write(msgData) {
        const msg = Message.fromObject(msgData)
        const bufferData = Message.encode(msg).finish()
        const bufferHeader = Buffer.alloc(4)
        bufferHeader.writeUInt32BE(bufferData.length, 0)
        const buf = Buffer.concat([bufferHeader, bufferData])
        this.socket.write(buf)
    }
    end() {
        this.socket.end()
    }
}

module.exports = Connection