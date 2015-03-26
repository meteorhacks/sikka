Tinytest.add("config - getConfig - with env vars", function(test) {
  var value = "100";
  var newEnv = {ABC_KEY: value};

  WithNew(process.env, newEnv, function() {
    var result = Sikka._getConfig('ABC_KEY');
    test.equal(result, value);
  });
});

Tinytest.add("config - getConfig - with Meteor.settings", function(test) {
  var value = "100";
  var newSettings = {abc: {a: value}};

  WithNew(Meteor.settings, newSettings, function() {
    var result = Sikka._getConfig('NOT_EXISTING', 'abc.a');
    test.equal(result, value);
  });
});

Tinytest.add("config - getConfig - with default value", function(test) {
  var value = "100";
  var result = Sikka._getConfig('NOT_EXISTING', 'not.existing', value);
  test.equal(result, value);
});