Package.describe({
  "summary": 'Sikka - A Firewall for Meteor Apps',
  "name": "meteorhacks:sikka",
  "version": "1.0.0",
  "git": "https://github.com/meteorhacks/sikka.git",
});

Npm.depends({
  "request": "2.53.0",
  "cookies": "0.5.0"
});

Package.onUse(function (api, where) {
  configure(api);
  api.export('Sikka', 'server')
});

Package.onTest(function (api, where) {
  configure(api);
  api.use('tinytest');
  api.use('practicalmeteor:sinon');

  api.addFiles([
    'test/server/utils.js',
    'test/server/config.js',
    'test/server/core.js',
    'test/server/session_hooks.js',
    'test/server/routes.js'
  ], 'server');
});

function configure(api) {
  api.versionsFrom("METEOR@0.9.2");
  api.use([
    'mongo',
    'underscore',
    'meteorhacks:meteorx@1.3.1',
    'meteorhacks:picker@1.0.2',
    'chuangbo:cookie@1.1.0'
  ]);

  api.addFiles([
    'lib/server/init.js',
    'lib/server/config.js',
    'lib/server/core.js',
    'lib/server/session_hooks.js',
    'lib/server/routes.js'
  ], 'server');

  api.addFiles([
    'lib/client/core.js'
  ], 'client');

  api.addFiles([
    'lib/server/captcha_page.html'
  ], 'server', {isAsset: true});
}