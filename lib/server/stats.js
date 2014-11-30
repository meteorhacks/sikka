var TRACKING_TYPES = ['connection', 'ip', 'client'];
var INTERVALS = ['hour', 'minute'];
var stats = function(){
  this._timerMinute = 0;
}
stats.prototype.initTracking = function(){
  FireWall.stats = {};
  TRACKING_TYPES.forEach(function (type) {
    FireWall.stats[type] = {};
    INTERVALS.forEach(function (interval) {
      FireWall.stats[type][interval] = {};
    });
  });
  this.initCleaner();
}


stats.prototype.initCleaner = function() {
  var self = this;
  this.timerHandle = setInterval(function(){
    if(self.timerMinute < 60){
      self.resetCounter('minute');
      self.timerMinute++;
    } else if(self.timerMinute == 60){
      self.resetCounter('hour');
    }
    console.log('----- counter resetting ----');
  }, 60000);
};

stats.prototype.resetCounter = function(interval) {
  TRACKING_TYPES.forEach(function (type) {
    if(FireWall.stats[type]){
      FireWall.stats[type][interval] = {};
      console.log(FireWall.stats, interval, type)
    }
  });
};

stats.prototype.track = function(session, message) {
  if(!session) return;
  this.incrementValue('connection', 'minute', 'globalDdp', 'total', session.id);
  this.incrementValue('connection', 'hour', 'globalDdp', 'total', session.id);

  if(message.msg == "sub"){
    this.incrementValue('connection', 'minute', 'sub', message.name, session.id);
    this.incrementValue('connection', 'hour', 'sub', message.name, session.id);
  }
  if(message.msg == "method"){
    this.incrementValue('connection', 'minute', 'method', message.method, session.id);
    this.incrementValue('connection', 'hour', 'method', message.method, session.id);
  }
  var ip = getIpfromSession(session);
  if(ip){
    if(message.msg == "sub"){
      this.incrementValue('ip', 'minute', 'sub', message.name, session.id);
      this.incrementValue('ip', 'hour', 'sub', message.name, session.id);
    }
    if(message.msg == "method"){
      this.incrementValue('ip', 'minute', 'method', message.method, session.id);
      this.incrementValue('ip', 'hour', 'method', message.method, session.id);
    }
  }

};

stats.prototype.incrementValue = function(connectionType, interval, trackerType, trackerName, userIdentifier){
  FireWall.stats[connectionType][interval][trackerType] = FireWall.stats[connectionType][interval][trackerType] || {};
  FireWall.stats[connectionType][interval][trackerType][trackerName] = FireWall.stats[connectionType][interval][trackerType][trackerName] || {};
  FireWall.stats[connectionType][interval][trackerType][trackerName][userIdentifier] = FireWall.stats[connectionType][interval][trackerType][trackerName][userIdentifier] || 0;
  FireWall.stats[connectionType][interval][trackerType][trackerName][userIdentifier]++;
}


Stats = new stats();


function getIpfromSession(session){
  if(!session || !session.socket) return ;
  return session.socket.headers['x-forwarded-for'] || session.socket.remoteAddress;
}