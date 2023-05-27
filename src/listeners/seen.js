const SocketListener = require("../SocketListener.js");
const redis = require("../redis/index.js");
const ftSearch = require("../utils/ftSearch.js");
const echoSocket = require("../echoSocket.js");

// FT.CREATE MSMessages ON JSON PREFIX 1 MS:Messages: SCHEMA $.channelId AS channelId TAG $.messageId AS messageId TAG $.userId AS userId TAG
// FT.CREATE MSChannelSubscriptions ON JSON PREFIX 1 MS:ChannelSubscriptions: SCHEMA $.channelId AS channelId TAG

module.exports = new SocketListener({
  name: "seen",
  async execute(socket, data, other) {
    if (!Array.isArray(data)) throw "Invalid shape!";
    if (typeof data[0] !== "string" && typeof data[1] !== "string") throw "Invalid shape!";

    let [channelId, messageId] = data;


    {
      let oldMsg = await redis.json.get(
        `MS:Messages:${channelId}:${socket.data.id}`,
        "$"
      );
      if (oldMsg?.channelId) {
        let subs = await ftSearch("MSChannelSubscriptions", `@channelId:{${oldMsg.channelId}}`);
        let userIds = subs.documents.map(i => i.userId);

        echoSocket.emit(
          "MS:Update",
          { type: "unseen", userIds, seenBy: socket.data.id, channelId, messageId }
        );
      }
    }


    await redis.json.set(
      `MS:Messages:${channelId}:${socket.data.id}`,
      "$",
      { channelId, messageId, userId: socket.data.id, at: Date.now() }
    );
    redis.expire(`MS:Messages:${channelId}:${socket.data.id}`, 60 * 60 * 24);

    await redis.json.set(
      `MS:ChannelSubscriptions:${socket.data.id}`,
      "$",
      { channelId, userId: socket.data.id }
    );
    redis.expire(`MS:ChannelSubscriptions:${socket.data.id}`, 60 * 60 * 6);

    {
      let subs = await ftSearch("MSChannelSubscriptions", `@channelId:{${channelId}}`);
      let userIds = subs.documents.map(i => i.userId);

      echoSocket.emit(
        "MS:Update",
        { type: "seen", userIds, seenBy: socket.data.id, channelId, messageId }
      );
    }
    return;
  }
});