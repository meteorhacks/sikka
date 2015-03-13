Config = {};
Config.captcha = {
  siteKey: getEnv("FIREWALL_CAPTCHA_SITE_KEY", "6LewOwMTAAAAACMBjAR2W7zqwHsd7bTcJWQRGhue"),
  secret: getEnv("FIREWALL_CAPTCHA_SECRET", "6LewOwMTAAAAAJrM_0GJnZSbKzU0AuynzykvTfAx")
};

Config.rateLimits = {
  perIp: getEnv("FIREWALL_PER_IP_MAX_RPS", 50),
  perHuman: getEnv("FIREWALL_PER_HUMAN_MAX_RPS", 20),
  perSession: getEnv("FIREWALL_PER_HUMAN_MAX_RPS", 20),
};

Config.times = {
  blockIpFor: getEnv("FIREWALL_BLOCK_IP_FOR_MILLIS", 1000 * 60 * 2),
  humanLivesUpto: getEnv("FIREWALL_HUMAN_LIVES_UPTO_MILLIS", 1000 * 60 * 60)
};

function getEnv(key, defaultValue) {
  return process.env[key] || defaultValue;
}