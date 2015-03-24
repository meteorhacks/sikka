var captchaPageTemplate = Assets.getText('lib/server/captcha_page.html');
var genCaptchaPage = _.template(captchaPageTemplate);
var urlParse = Npm.require("url").parse;
var request = Npm.require("request");
var Cookies = Npm.require("cookies");

Firewall.routes = {};
Firewall.routes._validationMiddleware =
function _validationMiddleware(req, res, next) {
  // check for cookies
  var ip = Firewall._getIp(req.headers, req.socket.remoteAddress);
  var cookies = new Cookies(req, res);
  var humanToken = cookies.get('firewall-human-token');

  if(Firewall._isValidHuman(humanToken)) {
    return next();
  }

  if(req.url.match(/\/verify-captcha/)) {
    return next();
  }

  // Now this request is not coming from a human
  // And check if this app is only for humans
  if(Config.onlyForHumans) {
    return Firewall.routes._sendCaptchPage(req, res);
  }

  if(!Firewall._isBlocked(ip)) {
    return next();
  }

  Firewall.routes._sendCaptchPage(req, res);
};

Firewall.routes._verifyCaptchaMiddleware =
function _verifyCaptchaMiddleware(params, req, res) {
  Firewall.routes._processCaptcha(req, res);
};

Firewall.routes._sendCaptchPage = function _sendCaptchPage(req, res) {
  res.writeHead(200, {'Content-Type': 'html'});
  var tmplValues = {
    captchaSiteKey: Config.captcha.siteKey,
    redirectUrl: req.url
  };
  var captchPage = genCaptchaPage(tmplValues);
  res.end(captchPage);
  return true;
};

Firewall.routes._processCaptcha = function _processCaptcha(req, res) {
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
      Firewall.routes._setFirewallHumanToken(req, res);
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
};

Firewall.routes._setFirewallHumanToken = function setFirewallHumanToken(req, res) {
  var cookies = new Cookies(req, res);
  var token = Random.id();
  // We need to make the load balancing sticky for this
  Firewall._addHumanFor(token, Config.times.humanLivesUpto);
  cookies.set("firewall-human-token", token, {httpOnly: false});
};

// Main Logic
Picker.middleware(Firewall.routes._validationMiddleware);
Picker.route('/verify-captcha', Firewall.routes._verifyCaptchaMiddleware);