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
  var firewallHumanToken = Cookie.get('sikka-human-token');
  Meteor.call('setSikkaHumanToken', firewallHumanToken);
}

// reloading the page
window.sikkaCommands = sikkaCommands = new Mongo.Collection('sikka-commands');
sikkaCommands.find({}).observe({
  added: function(command) {
    if(command._id === "reload") {
      location.reload();
    }
  }
});