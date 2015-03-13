Meteor.connection.onReconnect = function() {
  setToken();
};

// if(Meteor.status().connected) {
//   setToken();
// }

function setToken() {
  var firewallHumanToken = Cookie.get('firewall-human-token');
  console.log("call", firewallHumanToken);
  Meteor.call('setFirewallHumanToken', firewallHumanToken);
}