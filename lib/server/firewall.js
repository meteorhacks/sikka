FireWall = {

  adadad: "aadad"
};

var sessionProto = MeteorX.Session.prototype;

var originalProcessMessage = sessionProto.processMessage;

sessionProto.processMessage = function (msg){
  console.log(JSON.stringify(msg));

  trackDdp();

  if(msg.msg == "method"){
    trackMethod(msg);
  } else if(msg.msg == "sub"){

  }

  return originalProcessMessage.call(this, msg);
}

function trackMethod(msg){
  var methodName = msg.method;
}

function trackDdp(msg){

}