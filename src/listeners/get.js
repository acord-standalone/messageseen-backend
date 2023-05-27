const SocketListener = require("../SocketListener.js");
const redis = require("../redis/index.js");
const ftSearch = require("../utils/ftSearch.js");
const echoSocket = require("../echoSocket.js");

module.exports = new SocketListener({
  name: "get",
  async execute(socket, data, other) {
    if (!Array.isArray(data)) throw "Invalid shape!";
    if (typeof data[0] !== "string") throw "Invalid shape!";

    let messages = await ftSearch("MSMessages", `@messageId:{${data[0]}}`);
    let users = messages.documents.map(i => [i.userId, i.at]);

    return users;
  }
});