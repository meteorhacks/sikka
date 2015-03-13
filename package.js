Package.describe({
  summary: 'Rate limiting for meteor',
  name: "meteorhacks:firewall"
});

Npm.depends({
  "request": "2.53.0",
  "cookies": "0.5.0"
});

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR@0.9.0");
  api.use([
    'underscore',
    'meteorhacks:meteorx@1.3.1',
    'chuangbo:cookie@1.1.0'
  ]);

  api.add_files([
    'lib/server/core.js',
    'lib/server/logic.js'
  ], 'server');

  api.add_files([
    'lib/client/token.js'
  ], 'client');

  api.add_files([
    'lib/server/captcha_page.html'
  ], 'server', {isAsset: true});

  api.export('FireWall', 'server')
});