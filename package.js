Package.describe({
  summary: 'Rate limiting for meteor',
  name: "meteorhacks:firewall"
});

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR@0.9.0");
  api.use(['meteorhacks:meteorx@1.3.1', 'underscore']);
  api.add_files([
    'lib/server/core.js',
    'lib/server/logic.js'
  ], 'server');

  api.export('FireWall', 'server')
});