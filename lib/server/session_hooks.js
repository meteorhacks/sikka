var sessionProto = MeteorX.Session.prototype;
var Fiber = Npm.require('fibers');

var originalProcessMessage = sessionProto.processMessage;
sessionProto.processMessage = function processMessage(msg) {
  var self = this;
  var ip = Firewall._getIp(self.socket.headers, self.socket.remoteAddress);
  if(msg.msg === "method" && msg.method === "setFirewallHumanToken") {
    var token = msg.params[0];
    if(token) {
      this._firewallHumanToken = token;
    }

    return;
  }

  var sessionId = this.id;
  var blocked = Firewall._updateStats(ip, sessionId, this._firewallHumanToken);
  if(blocked) {
    console.info("Firewall: Closing current connection", sessionId);
    Fiber(function() {
      // ask to reload the page or cordova app
      self.send({
        msg: "added",
        collection: "firewall-commands",
        id: "reload",
        fields: {}
      });
      self.close();
    }).run();
    return;
  }

  originalProcessMessage.call(self, msg);
}