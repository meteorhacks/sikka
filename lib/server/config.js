Config = {};
Config.captcha = {
  siteKey: getConfig("FIREWALL_CAPTCHA_SITE_KEY", "firewall.captcha.siteKey", "6LdkcgMTAAAAAJosMQhYSfKeFldhn644i9w9c4Oi"),
  secret: getConfig("FIREWALL_CAPTCHA_SECRET", "firewall.captcha.secret", "6LdkcgMTAAAAADftIWaISsvQ7SqIeLqHM3PWu79Q")
};

Config.rateLimits = {
  perIp: getConfig("FIREWALL_PER_IP_MAX_RPS", "firewall.rateLimits.perIp", 50),
  perHuman: getConfig("FIREWALL_PER_HUMAN_MAX_RPS", "firewall.rateLimits.perHuman", 20),
  perSession: getConfig("FIREWALL_PER_HUMAN_MAX_RPS", "firewall.rateLimits.perSession", 20),
};

Config.times = {
  blockIpFor: getConfig("FIREWALL_BLOCK_IP_FOR_MILLIS", "firewall.times.blockIpFor", 1000 * 60 * 2),
  humanLivesUpto: getConfig("FIREWALL_HUMAN_LIVES_UPTO_MILLIS", "firewall.times.humanLivesUpto", 1000 * 60 * 60)
};

Config.onlyForHumans = getConfig('FIREWALL_ONLY_FOR_HUMANS', 'firewall.onlyForHumans', false);

console.log("Firewall: starting with these configurations:", JSON.stringify(Config));

function getConfig(key, meteorSettingsKey, defaultValue) {
  var envVar = process.env[key];
  if(envVar) {
    return envVar;
  }

  if(Meteor.settings) {
    var parts = meteorSettingsKey.split('.');
    var value = Meteor.settings;
    parts.forEach(function(key) {
      if(value) {
        value = value[key];
      }
    });

    if(value) {
      return value;
    }
  }

  return defaultValue;
}