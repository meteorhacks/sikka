// setToken when re-connecting
var originalReconnect = Meteor.connection.onReconnect;
Meteor.connection.onReconnect = function() {
  setToken();
  if(originalReconnect) {
    originalReconnect();
  }
};

if(Meteor.status().connected) {
  setToken();
}

function setToken() {
  var firewallHumanToken = Cookie.get('firewall-human-token');
  console.log("call", firewallHumanToken);
  Meteor.call('setFirewallHumanToken', firewallHumanToken);
}

// reloading the page
window.firewallCommands = firewallCommands = new Mongo.Collection('firewall-commands');
firewallCommands.find({}).observe({
  added: function(command) {
    if(command._id === "reload") {
      location.href = location.href;
    }
  }
});