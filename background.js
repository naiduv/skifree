chrome.extension.onMessage.addListener(msgHandler);

var starttime = new Date().getTime();
var new_top_score = 0;

var skierloc = new Point(0,0);
var map = [];

var msgHandler = function(e){
	if(!e || !e.msg)
		return;
	switch(e.msg){
		case 'new_top_score':
			new_top_score = e.value;
			lasttime = new Date().getTime();
			break;
		case 'current_state':
			val = e.value;
			break;
		case 'get_old_state'
			//send_old_state();
			break;
	}
}