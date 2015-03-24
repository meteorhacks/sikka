WithNew = function WithNew(original, newMethods, fn) {
  var originalMethods = _.clone(original);
  var newKeys = _.difference(_.keys(newMethods), _.keys(original));
  _.extend(original, newMethods);
  fn();

  _.extend(original, originalMethods);
  newKeys.forEach(function(key) {
    delete original[key];
  });
}