const SocketListener = require("../SocketListener.js");
const redis = require("../redis/index.js");

module.exports = new SocketListener({
  name: "disconnect",
  async execute(socket) {
    if (!socket.data.id) return;

    await redis.json.del(
      `MS:ChannelSubscriptions:${socket.data.id}`,
      "$"
    );
  }
})