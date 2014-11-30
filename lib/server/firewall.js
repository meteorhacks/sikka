var sessionProto = MeteorX.Session.prototype;

var fireWall = function(config){
  this.config = DefaultConfig;
};

fireWall.prototype.config = function(config) {
  config = config || {};
  this.config = _.extend(DefaultConfig, config);
};

FireWall = new fireWall();
Stats.initTracking();

var originalProcessMessage = sessionProto.processMessage;
sessionProto.processMessage = function (msg){
  Stats.track(this, msg);
  // var blocked = this._applyRules();
  // if(Stats.checkWithRules(this, msg);
  return originalProcessMessage.call(this, msg);
}