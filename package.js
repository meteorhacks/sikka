Package.describe({
  summary: 'Rate limiting for meteor'
});

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR@0.9.0");
  api.use(['meteorhacks:meteorx@1.2.0', 'underscore']);
  api.add_files(['lib/server/config.js', 'lib/server/stats.js', 'lib/server/firewall.js'], 'server');
  api.export('FireWall', 'server')
});