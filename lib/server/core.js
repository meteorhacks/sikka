Firewall = {};

Firewall._rebuildStats = function() {
  var stats = {
    perIp: {},
    perSession: {},
    perHuman: {}
  };

  return stats;
};

Firewall.stats = {};

Firewall._blackList = {};
Firewall._humanTokens = {};

Firewall._getIp = function _getIp(headers, remoteAddress) {
  var ip = headers['x-forwarded-for'] || remoteAddress;
  return ip;
};

Firewall._updateStats = function _updateStats(ip, sessionId, humanToken) {
  Firewall._ensureStats('perIp', ip, 1000 * 5);
  Firewall._ensureStats('perSession', sessionId, 1000 * 5);
  Firewall._ensureStats('perHuman', humanToken, 1000 * 5);

  Firewall._incStat('perIp', ip);
  Firewall._incStat('perSession', sessionId);
  Firewall._incStat('perHuman', humanToken);

  var blocked = false;
  if(Firewall._rateExceeds("perIp", ip, Config.rateLimits.perIp)) {
    console.log("Firewall: IP Blocked.", ip);
    Firewall._blockIpFor(ip, Config.times.blockIpFor);
    blocked = true;
  }

  if(Firewall._isValidHuman(humanToken)) {
    var perHumanMaxRate = Config.rateLimits.perHuman;
    if(Firewall._rateExceeds("perHuman", humanToken, perHumanMaxRate)) {
      console.log("Firewall: Human Blocked", humanToken);
      Firewall._deleteHuman(humanToken);
      blocked = true;
    } else {
      console.log("Firewall: I'm a human", humanToken);
      blocked = false;
    }
  }

  return blocked;
};

Firewall._rateExceeds = function(type, key, maxValue) {
  var stats = Firewall._getStat(type, key);
  if(!stats) {
    return false;
  }

  var timeDiffSecs = (Date.now() - stats.startedAt) / 1000;
  if(timeDiffSecs < 1) {
    return false;
  }


  var rate = (stats.count) / timeDiffSecs;
  // console.log("***RATE", type, key, rate, maxValue);
  return rate > maxValue;
}

Firewall._blockIpFor = function(ip, millis) {
  millis = millis || 1000 * 60;
  if(Firewall._blackList[ip]) {
    clearTimeout(Firewall._blackList[ip]);
  }

  Firewall._blackList[ip] = setTimeout(function() {
    delete Firewall._blackList[ip];
  }, millis);
};

Firewall._isBlocked = function(ip) {
  return !!Firewall._blackList[ip];
};

Firewall._addHumanFor = function(token, millis) {
  if(Firewall._humanTokens[token]) {
    clearTimeout(Firewall._humanTokens[token]);
  }

  millis = millis || 1000 * 60 * 60;
  Firewall._humanTokens[token] = setTimeout(function() {
    delete Firewall._humanTokens[token];
  }, millis);
};

Firewall._deleteHuman = function(token) {
  if(Firewall._humanTokens[token]) {
    clearTimeout(Firewall._humanTokens[token]);
  }

  delete Firewall._humanTokens[token];
};

Firewall._isValidHuman = function(humanToken) {
  return !!Firewall._humanTokens[humanToken];
};

Firewall._ensureStats = function(type, key, resetMillis) {
  resetMillis = resetMillis || 1000 * 5;
  if(!Firewall.stats[type]) {
    Firewall.stats[type] = {};
  }

  if(!Firewall.stats[type][key]) {
    Firewall.stats[type][key] = {
      startedAt: Date.now(),
      count: 0
    };

    setTimeout(function() {
      delete Firewall.stats[type][key];
    }, resetMillis);
  }
};

Firewall._incStat = function(type, key, value) {
  value = value || 1;
  Firewall.stats[type][key].count += value;
};

Firewall._getStat = function(type, key) {
  if(Firewall.stats[type] && Firewall.stats[type][key]) {
    return Firewall.stats[type][key];
  } else {
    return null;
  }
};