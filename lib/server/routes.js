var captchaPageTemplate = Assets.getText('lib/server/captcha_page.html');
var genCaptchaPage = _.template(captchaPageTemplate);
var urlParse = Npm.require("url").parse;
var request = Npm.require("request");
var Cookies = Npm.require("cookies");

Sikka.routes = {};
Sikka.routes._validationMiddleware =
function _validationMiddleware(req, res, next) {
  // check for cookies
  var ip = Sikka._getIp(req.headers, req.socket.remoteAddress);
  var cookies = new Cookies(req, res);
  var humanToken = cookies.get('sikka-human-token');

  if(Sikka._isValidHuman(humanToken)) {
    return next();
  }

  if(req.url.match(/\/verify-captcha/)) {
    return next();
  }

  // Now this request is not coming from a human
  // And check if this app is only for humans
  if(Config.onlyForHumans) {
    return Sikka.routes._sendCaptchPage(req, res);
  }

  if(!Sikka._isBlocked(ip)) {
    return next();
  }

  Sikka.routes._sendCaptchPage(req, res);
};

Sikka.routes._verifyCaptchaMiddleware =
function _verifyCaptchaMiddleware(params, req, res) {
  Sikka.routes._processCaptcha(req, res);
};

Sikka.routes._sendCaptchPage = function _sendCaptchPage(req, res) {
  res.writeHead(200, {'Content-Type': 'html'});
  var tmplValues = {
    captchaSiteKey: Config.captcha.siteKey,
    redirectUrl: req.url
  };
  var captchPage = genCaptchaPage(tmplValues);
  res.end(captchPage);
  return true;
};

Sikka.routes._processCaptcha = function _processCaptcha(req, res) {
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
      console.error("Sikka: Captcha verification error: ", err.message);
      res.writeHead(500);
      return res.end("Captcha verification errored!");
    }

    var response = JSON.parse(body);

    if(response.success) {
      Sikka.routes._setSikkaHumanToken(req, res);
      res.writeHead(301, {
        "Location": redirectUrl
      });
      res.end();
    } else {
      console.error("Sikka: Captch verification failed!", response);
      res.writeHead(401);
      res.end("Captch verification failed!");
    }
  }
};

Sikka.routes._setSikkaHumanToken = function _setSikkaHumanToken(req, res) {
  var cookies = new Cookies(req, res);
  var token = Random.id();
  // We need to make the load balancing sticky for this
  Sikka._addHumanFor(token, Config.times.humanLivesUpto);
  cookies.set("sikka-human-token", token, {httpOnly: false});
};

// Main Logic
Picker.middleware(Sikka.routes._validationMiddleware);
Picker.route('/verify-captcha', Sikka.routes._verifyCaptchaMiddleware);