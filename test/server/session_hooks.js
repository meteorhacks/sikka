var sessionProto = MeteorX.Session.prototype;
Tinytest.add("session hooks - identifying a human", function(test) {
  var context = {
    send: sinon.stub(),
    socket: {
      headers: {},
      remoteAddress: Random.id()
    }
  };
  var humanToken = Random.id();
  var msg = {
    msg: "method",
    method: "setFirewallHumanToken",
    params: [humanToken]
  };

  sessionProto.processMessage.call(context, msg);
  test.equal(context._firewallHumanToken, humanToken);
  test.equal(context.send.callCount, 2);
});

Tinytest.add("session hooks - update stats", function(test) {
  var ip = Random.id();
  var sessionId = Random.id();
  var humanToken = Random.id();

  var context = {
    send: sinon.stub(),
    socket: {
      headers: {},
      remoteAddress: ip
    },
    id: sessionId,
    _firewallHumanToken: humanToken
  };

  var msg = {
    msg: "method",
    method: "not-existing",
    params: [10]
  };

  var newFirewall = {
    _updateStats: sinon.stub()
  };

  WithNew(Firewall, newFirewall, function() {
    sessionProto.processMessage.call(context, msg);
    test.equal(newFirewall._updateStats.callCount, 1);
    test.equal(newFirewall._updateStats.args[0], [ip, sessionId, humanToken]);
  });
});

Tinytest.add("session hooks - update stats and blocked", function(test) {
  var context = {
    send: sinon.stub(),
    socket: {
      headers: {},
      removeAllListeners: sinon.stub()
    }
  };

  var msg = {
    msg: "method",
    method: "not-existing",
    params: [10]
  };

  var newFirewall = {
    _updateStats: sinon.stub()
  };

  WithNew(Firewall, newFirewall, function() {
    newFirewall._updateStats.onCall(0).returns(true);
    sessionProto.processMessage.call(context, msg);
    test.equal(context.send.callCount, 1);
    test.equal(context.socket.removeAllListeners.callCount, 1);
  });
});