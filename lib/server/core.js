Sikka._rebuildStats = function() {
  var stats = {
    perIp: {},
    perSession: {},
    perHuman: {}
  };

  return stats;
};

Sikka.stats = {};

Sikka._blackList = {};
Sikka._humanTokens = {};

Sikka._getIp = function _getIp(headers, remoteAddress) {
  var xForwardedFor = headers['x-forwarded-for'];
  if(xForwardedFor) {
    var firstIp = xForwardedFor.split(",")[0];
    return firstIp;
  } else {
    return remoteAddress;
  }
};

Sikka._updateStats = function _updateStats(ip, sessionId, humanToken) {
  Sikka._ensureStats('perIp', ip, 1000 * 5);
  Sikka._ensureStats('perSession', sessionId, 1000 * 5);
  Sikka._ensureStats('perHuman', humanToken, 1000 * 5);

  Sikka._incStat('perIp', ip);
  Sikka._incStat('perSession', sessionId);
  Sikka._incStat('perHuman', humanToken);

  var blocked = false;
  if(Sikka._rateExceeds("perIp", ip, Config.rateLimits.perIp)) {
    console.log("Sikka: IP Blocked.", ip);
    Sikka._blockIpFor(ip, Config.times.blockIpFor);
    blocked = true;
  }

  if(Sikka._isValidHuman(humanToken)) {
    var perHumanMaxRate = Config.rateLimits.perHuman;
    if(Sikka._rateExceeds("perHuman", humanToken, perHumanMaxRate)) {
      console.log("Sikka: Human Blocked", humanToken);
      Sikka._deleteHuman(humanToken);
      blocked = true;
    } else {
      blocked = false;
    }
  } else if(Config.onlyForHumans) {
    blocked = true;
  }

  return blocked;
};

Sikka._rateExceeds = function(type, key, maxValue) {
  var stats = Sikka._getStat(type, key);
  if(!stats) {
    return false;
  }

  var timeDiffSecs = (Date.now() - stats.startedAt) / 1000;
  if(timeDiffSecs < 1) {
    return false;
  }

  var rate = (stats.count) / timeDiffSecs;
  return rate > maxValue;
}

Sikka._blockIpFor = function(ip, millis) {
  millis = millis || 1000 * 60;
  if(Sikka._blackList[ip]) {
    clearTimeout(Sikka._blackList[ip]);
  }

  Sikka._blackList[ip] = setTimeout(function() {
    delete Sikka._blackList[ip];
  }, millis);
};

Sikka._isBlocked = function(ip) {
  return !!Sikka._blackList[ip];
};

Sikka._addHumanFor = function(token, millis) {
  if(Sikka._humanTokens[token]) {
    clearTimeout(Sikka._humanTokens[token]);
  }

  millis = millis || 1000 * 60 * 60;
  Sikka._humanTokens[token] = setTimeout(function() {
    delete Sikka._humanTokens[token];
  }, millis);
};

Sikka._deleteHuman = function(token) {
  if(Sikka._humanTokens[token]) {
    clearTimeout(Sikka._humanTokens[token]);
  }

  delete Sikka._humanTokens[token];
};

Sikka._isValidHuman = function(humanToken) {
  return !!Sikka._humanTokens[humanToken];
};

Sikka._ensureStats = function(type, key, resetMillis) {
  resetMillis = resetMillis || 1000 * 5;
  if(!Sikka.stats[type]) {
    Sikka.stats[type] = {};
  }

  if(!Sikka.stats[type][key]) {
    Sikka.stats[type][key] = {
      startedAt: Date.now(),
      count: 0
    };

    setTimeout(function() {
      delete Sikka.stats[type][key];
    }, resetMillis);
  }
};

Sikka._incStat = function(type, key, value) {
  value = value || 1;
  Sikka.stats[type][key].count += value;
};

Sikka._getStat = function(type, key) {
  if(Sikka.stats[type] && Sikka.stats[type][key]) {
    return Sikka.stats[type][key];
  } else {
    return null;
  }
};