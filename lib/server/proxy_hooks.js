var captchaPageTemplate = Assets.getText('lib/server/captcha_page.html');
var genCaptchaPage = _.template(captchaPageTemplate);
var urlParse = Npm.require("url").parse;
var request = Npm.require("request");
var Cookies = Npm.require("cookies");

OverShadowServerEvent("upgrade", function(req, socket, head) {
  var ip = Firewall._getIp(req.headers, socket.remoteAddress);
  var cookies = new Cookies(req);
  var humanToken = cookies.get('firewall-human-token');

  if(Firewall._isValidHuman(humanToken)) {
    return false;
  }

  if(Firewall._isBlocked(ip)) {
    var originalOn = socket.on;
    // block listening to data
    socket.on = function(event) {
      if(event !== "data") {
        originalOn.apply(socket, arguments);
      }
    };
    return true;
  }
});

OverShadowServerEvent("request", function(req, res) {
  var ip = Firewall._getIp(req.headers, req.socket.remoteAddress);
  var cookies = new Cookies(req, res);
  var humanToken = cookies.get('firewall-human-token');

  if(Firewall._isValidHuman(humanToken)) {
    return false;
  }

  if(Firewall._isBlocked(ip)) {
    if(req.url.match(/sockjs/)) {
      return true;
    } else if(req.url.match(/^\/captcha-verify/)) {
      processCaptcha(req, res);
      return true;
    } else {
      res.writeHead(200, {'Content-Type': 'html'});
      var tmplValues = {
        captchaSiteKey: Config.captcha.siteKey,
        redirectUrl: req.url
      };
      var captchPage = genCaptchaPage(tmplValues);
      res.end(captchPage);
      return true;
    }
  } else {
    return false;
  }
});

function OverShadowServerEvent(event, handler) {
  var httpServer = Package.webapp.WebApp.httpServer;
  var oldHttpServerListeners = httpServer.listeners(event).slice(0);
  httpServer.removeAllListeners(event);

  var newListener = function(request /*, moreArguments */) {
    // Store arguments for use within the closure below
    var args = arguments;
    if(handler.apply(httpServer, args) !== true) {
      _.each(oldHttpServerListeners, function(oldListener) {
        oldListener.apply(httpServer, args);
      });
    };
  };
  httpServer.addListener(event, newListener);
}

function processCaptcha(req, res) {
  var parsedUrl = urlParse(req.url, true);
  var captchResponse = parsedUrl.query['g-recaptcha-response'];
  var redirectUrl = parsedUrl.query['redirect-url'];

  request.post("https://www.google.com/recaptcha/api/siteverify", {
    formData: {
      secret: Config.captcha.secret,
      response: captchResponse
    }
  }, withResponse);

  function withResponse(err, r, body) {
    if(err) {
      console.error("Firewall: Captcha verification error: ", err.message);
      res.writeHead(500);
      return res.end("Captcha verification errored!");
    }

    var response = JSON.parse(body);

    if(response.success) {
      setFirewallHumanToken(req, res);
      res.writeHead(301, {
        "Location": redirectUrl
      });
      res.end();
    } else {
      console.error("Firewall: Captch verification failed!", response);
      res.writeHead(401);
      res.end("Captch verification failed!");
    }
  }
}

function setFirewallHumanToken(req, res) {
  var cookies = new Cookies(req, res);
  var token = Random.id();
  // We need to make the load balancing sticky for this
  Firewall._addHumanFor(token, Config.times.humanLivesUpto);
  cookies.set("firewall-human-token", token, {httpOnly: false});
}