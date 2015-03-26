var sessionProto = MeteorX.Session.prototype;
var Fiber = Npm.require('fibers');

var originalProcessMessage = sessionProto.processMessage;
sessionProto.processMessage = function processMessage(msg) {
  var self = this;
  var ip = Sikka._getIp(self.socket.headers, self.socket.remoteAddress);
  if(msg.msg === "method" && msg.method === "setSikkaHumanToken") {
    var token = msg.params[0];
    if(token) {
      this._sikkaHumanToken = token;
    }

    // complete the method
    self.send({msg: "updated", methods: [msg.id]});
    self.send({msg: "result", id: msg.id});
    return;
  }

  var sessionId = this.id;
  var blocked = Sikka._updateStats(ip, sessionId, this._sikkaHumanToken);
  if(blocked) {
    console.info("Sikka: Closing current connection", sessionId);
    Fiber(function() {
      // ask to reload the page or cordova app
      self.send({
        msg: "added",
        collection: "sikka-commands",
        id: "reload",
        fields: {}
      });

      // Don't close the socket.
      // Just ignore the load.
      // If we try to close the socket, it'll try to reconnect again.
      // That leads to a lot of requests and make the DOS attempt worst
      self.socket.removeAllListeners('data');
    }).run();
    return;
  }

  originalProcessMessage.call(self, msg);
}