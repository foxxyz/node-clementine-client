var protobuf = require('protobufjs')

// Load definitions
const root = protobuf.loadSync(__dirname + '/remotecontrolmessages.proto')

// Cache all types
const types = ['MsgType', 'EngineState', 'RepeatMode', 'ShuffleMode', 'ReasonDisconnect', 'DownloadItem']
const proto = {}
for (const type of types) {
    proto[type] = root.lookup('pb.remote.' + type).values
    proto[type + 'Name'] = root.lookup('pb.remote.' + type).valuesById
}
proto.Message = root.lookup('pb.remote.Message')

module.exports = proto