var fs = require('fs')
var protobuf = require('protobufjs')

// Load definitions
let root = protobuf.loadSync(__dirname + '/remotecontrolmessages.proto')

// Cache all types
let types = ['MsgType', 'EngineState', 'RepeatMode', 'ShuffleMode', 'ReasonDisconnect', 'DownloadItem']
let proto = {}
for (let type of types) {
    proto[type] = root.lookup("pb.remote." + type).values
    proto[type + 'Name'] = root.lookup("pb.remote." + type).valuesById
}
proto.Message = root.lookup('pb.remote.Message')

module.exports = proto