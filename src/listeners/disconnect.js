const SocketListener = require("../SocketListener.js");
const echoSocket = require("../echoSocket.js");
const redis = require("../redis/index.js");
const ftSearch = require("../utils/ftSearch.js");

module.exports = new SocketListener({
  name: "disconnect",
  async execute(socket) {
    if (!socket.data.id) return;

    
  }
})