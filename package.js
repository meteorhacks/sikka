Package.describe({
  summary: 'Rate limiting for meteor'
});

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR@0.9.0");
  api.use('meteorhacks:meteorx@1.2.0');
  api.add_files(['lib/server/firewall.js', 'lib/server/config.js'], 'server');
  api.export('FireWall', 'server')
});