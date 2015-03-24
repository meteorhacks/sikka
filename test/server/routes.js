var request = Npm.require('request');
var Cookies = Npm.require('cookies');

Tinytest.add("routes - middlewares - when a valid human", function(test) {
  var humanToken = Random.id();
  var req = buildRequest(null, humanToken);

  var next = sinon.stub();
  var newFirewall = {
    _isValidHuman: sinon.stub()
  };

  WithNew(Firewall, newFirewall, function() {
    newFirewall._isValidHuman.onCall(0).returns(true);
    Firewall.routes._validationMiddleware(req, null, next);
    test.equal(next.callCount, 1);
    test.equal(newFirewall._isValidHuman.args[0], [humanToken]);
  });
});

Tinytest.add("routes - middlewares - /verify-captcha page", function(test) {
  var req = buildRequest();
  req.url = "/verify-captcha?some=args";

  var next = sinon.stub();
  Firewall.routes._validationMiddleware(req, null, next);
  test.equal(next.callCount, 1);
});

Tinytest.add("routes - middlewares - when only for humans (but not a human)", function(test) {
  var newConfig = {
    onlyForHumans: true
  };

  var newFirewallRoutes = {
    _sendCaptchPage: sinon.stub()
  };

  var req = buildRequest();
  req.url = "/";

  WithNew(Config, newConfig, function() {
    WithNew(Firewall.routes, newFirewallRoutes, function() {
      var dummyValue = Random.id();
      newFirewallRoutes._sendCaptchPage.onCall(0).returns(dummyValue);
      var result = Firewall.routes._validationMiddleware(req, null, null);

      test.equal(result, dummyValue);
      test.equal(newFirewallRoutes._sendCaptchPage.callCount, 1);
    });
  });
});

Tinytest.add("routes - middlewares - when ip is not blocked", function(test) {
  var ip = Random.id();
  var req = buildRequest(ip);
  req.url = "/";

  var next = sinon.stub();
  var newFirewall = {
    _isBlocked: sinon.stub()
  };

  var next = sinon.stub();

  WithNew(Firewall, newFirewall, function() {
    newFirewall._isBlocked.onCall(0).returns(false);
    Firewall.routes._validationMiddleware(req, null, next);
    test.equal(next.callCount, 1);
    test.equal(newFirewall._isBlocked.args[0], [ip]);
  });
});

Tinytest.add("routes - middlewares - when ip not blocked", function(test) {
  var ip = Random.id();
  var req = buildRequest(ip);
  req.url = "/";

  var newFirewall = {
    _isBlocked: sinon.stub()
  };
  var newFirewallRoutes = {
    _sendCaptchPage: sinon.stub()
  };

  WithNew(Firewall.routes, newFirewallRoutes, function() {
    WithNew(Firewall, newFirewall, function() {
      newFirewall._isBlocked.onCall(0).returns(true);
      Firewall.routes._validationMiddleware(req, null);
      test.equal(newFirewall._isBlocked.args[0], [ip]);
      test.equal(newFirewallRoutes._sendCaptchPage.callCount, 1);
    });
  });
});

Tinytest.add("routes - captcha page - render it", function(test) {
  var req = {url: Random.id()};
  var res = {
    writeHead: sinon.stub(),
    end: sinon.stub()
  };

  Firewall.routes._sendCaptchPage(req, res);
  test.equal(!!res.end.args[0][0].match(res.end), true);
  test.equal(res.writeHead.args[0], [200, {'Content-Type': 'html'}]);
});

Tinytest.add("routes - process captcha - when request failed", function(test) {
  var captchaResponse = Random.id();
  var url = "/verify-captcha?g-recaptcha-response=" + captchaResponse;
  var req = {url: url};
  var res = {
    writeHead: sinon.stub(),
    end: sinon.stub()
  };

  var newRequest = {
    post: sinon.stub()
  };

  WithNew(request, newRequest, function() {
    newRequest.post.onCall(0).callsArgWith(2, new Error());
    Firewall.routes._processCaptcha(req, res);

    test.equal(res.writeHead.args[0][0], 500);
    test.equal(res.end.callCount, 1);
    test.equal(newRequest.post.args[0][1].formData.response, captchaResponse);
  });
});

Tinytest.add("routes - process captcha - when verification completed", function(test) {
  var captchaResponse = Random.id();
  var redirectUrl = Random.id();
  var url = "/verify-captcha?" +
    "g-recaptcha-response=" + captchaResponse + "&" +
    "redirect-url=" + redirectUrl;

  var req = {url: url};
  var res = {
    writeHead: sinon.stub(),
    end: sinon.stub()
  };

  var newRequest = {
    post: sinon.stub()
  };

  var newFirewallRoutes = {
    _setFirewallHumanToken: sinon.stub()
  };

  WithNew(Firewall.routes, newFirewallRoutes, function() {
    WithNew(request, newRequest, function() {
      var captchaVerification = {success: true};
      newRequest.post.onCall(0).callsArgWith(2, null, {}, JSON.stringify(captchaVerification));
      Firewall.routes._processCaptcha(req, res);

      test.equal(res.writeHead.args[0], [301, {'Location': redirectUrl}]);
      test.equal(res.end.callCount, 1);
      test.equal(newFirewallRoutes._setFirewallHumanToken.callCount, 1);
    });
  });
});

Tinytest.add("routes - process captcha - when verification failed", function(test) {
  var captchaResponse = Random.id();
  var redirectUrl = Random.id();
  var url = "/verify-captcha?" +
    "g-recaptcha-response=" + captchaResponse + "&" +
    "redirect-url=" + redirectUrl;

  var req = {url: url};
  var res = {
    writeHead: sinon.stub(),
    end: sinon.stub()
  };

  var newRequest = {
    post: sinon.stub()
  };

  WithNew(request, newRequest, function() {
    var captchaVerification = {success: false};
    newRequest.post.onCall(0).callsArgWith(2, null, {}, JSON.stringify(captchaVerification));
    Firewall.routes._processCaptcha(req, res);

    test.equal(res.writeHead.args[0], [401]);
    test.equal(res.end.callCount, 1);
  });
});

Tinytest.add("routes - _setFirewallHumanToken", function(test) {
  var req = {};
  var res = {};

  var newFirewall = {
    _addHumanFor: sinon.stub()
  };

  var newCookiesProto = {
    set: sinon.stub()
  };

  WithNew(Cookies.prototype, newCookiesProto, function() {
    WithNew(Firewall, newFirewall, function() {
      Firewall.routes._setFirewallHumanToken(req, res);

      var token = newFirewall._addHumanFor.args[0][0];
      test.equal(newCookiesProto.set.callCount, 1);
      test.equal(newCookiesProto.set.args[0], [
        "firewall-human-token",
        token,
        {httpOnly: false}
      ]);
    });
  });
});

function buildRequest(ip, humanToken) {
  ip = ip || Random.id();
  humanToken = humanToken || Random.id();

  var req = {
    headers: {
      'cookie': 'firewall-human-token=' + humanToken
    },
    socket: {
      remoteAddress: ip
    }
  };

  return req;
}