
//UA-36900024-1

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-36900024-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();



// chrome.extension.onMessage.addListener(msgHandler);

// var msgHandler = function(e){
// 	switch(e.msg){
// 		case 'old_state':
// 			debugger;
// 			skierloc = e.value.skierloc;
// 			map = e.value.map;
// 			break;
// 	}
// }

var map_size_cap = 300;
var left_right_dist_delta = 10;
var score_penalty_crash = 100;
var paused = false;

var canvasm = document.getElementById("canvasm");
var ctxm = canvasm.getContext("2d");

var canvass = document.getElementById("canvass");
var ctxs = canvass.getContext("2d");

var sprites = document.createElement('image');
sprites.src='sprites.png';
var curr_skier_sprite = "ski_down";
var skierloc = new Point(10,10);
var map = Array();
var crash = false;
var not_going_down = false;
var score;
var score_font_color = "black";

var faster = false;

window.addEventListener("load", init); 

var toggleshowcontrols = function(){
	$("#controlsview").toggleClass("shown");
}

$('a').live('click', function(e) {
  var href = e.currentTarget.href;
  var classname = e.currentTarget.className;
  chrome.tabs.getSelected(null,function(tab) {
  	if(href[href.length-1]=="#"){
  		switch(classname){
  			case 'js-controls':
  				_gaq.push(['_trackEvent', 'click', 'controls']);
  				toggleshowcontrols();
  				break;
  		}
  		return;
  	} else {
  		chrome.tabs.update(tab.id, {url: href});
  	}
  });
});
 
function init(){
	//we're ready for the loop
	skierloc = new Point(canvass.width/2, canvass.height/2);
	score = 0;
	mainloop();
}

var mapcapped = function(){
	if(map.length<=map_size_cap)
		return false;
	else
		return true;
}

var oncrash = function(){
	if(!crash)
		return;
	crash=false;
	console.log('crashed')
	curr_skier_sprite="crash1";
	drawskier(ctxs, skierloc);
}

var mainloop = function(){
	var mainlooptimer = setTimeout(mainloop, faster?18:28);
	$("#score .num").html("score:"+score);
	$("#score .num").css("color", score_font_color);

	if(paused)
		return;

	if(crash)
		return;

	score += not_going_down ? 0:1;
	// if(not_going_down)
	// 	score_font_color="red";
	// else
	//	score_font_color="green";
	
	addobjecttomap();
	clearmap();
	drawobjectsfrommap();
	drawskier(ctxs, skierloc);
}

var clearmap = function(){
	ctxm.clearRect(0,0,canvasm.width, canvasm.height);
}

var _map_object = function(){
	this.type = "small_tree";
	this.loc = new Point(10,10); 
	this.hit = false;
}

var map_objects = ["small_tree", "big_rock", "small_rock", "burnt_tree", "big_tree"];

var rand = function(max){
	return Math.floor(Math.random()*max);
}

var addobjecttomap = function(){
	if(not_going_down)
		return;

	var mo = new _map_object();
	var ranpick = rand(12*map_objects.length-1);
	if(ranpick > map_objects.length-1)
		return;
	mo.type = map_objects[ranpick];
	mo.loc = new Point(rand(canvasm.width), canvasm.height);
	map.push(mo);
}

var drawobjectsfrommap = function(){
	for(var i=0; i<map.length; i++){
		if(map[i].hit==false && checkcollision(map[i].type, map[i].loc)){
			map[i].hit = true;
			curr_skier_sprite = "crash2";
			crash = true;
			score -= score_penalty_crash;
			not_going_down = true;
			setTimeout(oncrash, 700);
		}

		drawobject(ctxm, map[i].type, map[i].loc);
		// if(curr_skier_sprite == 'ski_left')
		// 	map[i].loc.x +=5;
		// else if(curr_skier_sprite == 'ski_right')
		// 	map[i].loc.x -=5;
		if(curr_skier_sprite == 'ski_down')
			map[i].loc.y -=6;
		else if(curr_skier_sprite == 'ski_left_down'){
			map[i].loc.y -=3;
			map[i].loc.x +=5;	
		}
		else if(curr_skier_sprite == 'ski_right_down'){
			map[i].loc.y -=3;
			map[i].loc.x -=5;	
		}
		else if(curr_skier_sprite == 'ski_down_left'){
			map[i].loc.y -=5;
			map[i].loc.x +=3;	
		}
		else if(curr_skier_sprite == 'ski_down_right'){
			map[i].loc.y -=5;
			map[i].loc.x -=3;	
		}  
	}
}
//USE PT IN RECT
var checkcollision = function(type, loc){
	var objectpos = getSpriteRectFromName(type);
	var skierpos = getSpriteRectFromName(curr_skier_sprite);
	var objrect = new Rect(loc.x+5, loc.y+10, objectpos.w-20, objectpos.h-10);
	var skierrect = new Rect(skierloc.x+5, skierloc.y+10, skierpos.w-10, skierpos.h-20);
	if(rectscollide(objrect, skierrect))
		return true;
	else
		return false;

}


var spriterects = [
	{"name": "ski_left", 		"rect": new Rect(0,0,30,36)},
	{"name": "ski_right", 		"rect": new Rect(30,0,30,36)},
	{"name": "ski_down_left", 	"rect": new Rect(60,0,30,36)},
	{"name": "ski_down_right", 	"rect": new Rect(90,0,30,36)},
	{"name": "ski_down", 		"rect": new Rect(120,0,30,36)},
	{"name": "ski_right_down", 	"rect": new Rectxy(232,0,260,34)},
	{"name": "ski_left_down", 	"rect": new Rectxy(262,0,287,34)},
	{"name": "crash1", 			"rect": new Rect(155,0,30,36)},
	{"name": "crash2", 			"rect": new Rect(190,0,40,36)},
	{"name": "small_tree", 		"rect": new Rect(49, 93, 35, 40)},
	{"name": "big_rock", 		"rect": new Rect(120,114,30,16)},
	{"name": "small_rock", 		"rect": new Rectxy(236,115,256,130)},
	{"name": "burnt_tree", 		"rect": new Rectxy(89,99,113,127)},
	{"name": "big_tree", 		"rect": new Rectxy(6,61,38,127)},
	]

var drawskier = function(ctx, loc){
	var rect = getSpriteRectFromName(curr_skier_sprite);
	ctx.clearRect(skierloc.x-10, skierloc.y-10, 50, 56);
	ctx.drawImage(sprites, rect.x, rect.y, rect.w, rect.h, loc.x, loc.y, rect.w, rect.h);
}

var drawobject = function(ctx, obj, loc){
	var rect = getSpriteRectFromName(obj);
	ctx.drawImage(sprites, rect.x, rect.y, rect.w, rect.h, loc.x, loc.y, rect.w, rect.h);
}

document.onkeyup = function(e){
	console.log(e.keyCode);
	switch(e.keyCode){
		case 37: onLeft();//drawskier(ctx, spriterects[0].rect, new Point(10,10));
		break;
		case 38: onUp();
		break;
		case 39: onRight();//drawskier(ctx, spriterects[1].rect, new Point(10,10));
		break;
		case 40: onDown();
		break;
		case 70: onFButton();
		break;
		case 80: onPButton();
		break;
		default: console.log(e.keyCode);
	}
}

var logic_sprites = ['ski_left','ski_left_down','ski_down_left','ski_down','ski_down_right','ski_right_down','ski_right'];

var getNextLogicalSprite = function(curr, next){
	var dir_index = -1;
	for(var i=0; i<logic_sprites.length; i++){
		if(curr == logic_sprites[i]){
			dir_index = i;
			break;
		}
	}

	if(dir_index==-1){
		if(curr=="crash1" || curr=="crash2"){
			if(next == 1)
				return "ski_right";
			else
				return "ski_left";
		}

	}

	if(dir_index == 0 && next==-1 || dir_index == logic_sprites.length-1 && next==1)
		return curr;
	else
		return logic_sprites[dir_index+next];

}

var onFButton = function(){
	faster = !faster;
	_gaq.push(['_trackEvent', 'input', 'controls', 'faster', faster?1:0]);
}

var onPButton = function(){
	paused = !paused;
	_gaq.push(['_trackEvent', 'input', 'controls', 'paused', paused?1:0]);
	//chrome.extension.sendMessage('skierloc:'+skierloc, console.log('sentloc'));
}

var onUp = function(){
}

var onDown = function(){
	if(crash) 
		return;
	curr_skier_sprite = "ski_down";
	not_going_down = false;
}

var onLeft = function(){
	//if(crash) crash = false;

	curr_skier_sprite = getNextLogicalSprite(curr_skier_sprite, -1);
	
	if(curr_skier_sprite == "ski_left"){
		// if(!crash)
		// 	skierloc.x -= left_right_dist_delta;
		not_going_down = true;
		for(var i=0; i<map.length; i++)
			map[i].loc.x += left_right_dist_delta;
	} else {
		not_going_down = false;
	}
}

var onRight = function(){
	//if(crash) crash = false;

	curr_skier_sprite = getNextLogicalSprite(curr_skier_sprite, 1);
	//skierloc.x += left_right_dist_delta;

	if(curr_skier_sprite == "ski_right"){
		// if(!crash)
		// 	skierloc.x += left_right_dist_delta;
		not_going_down = true;
		for(var i=0; i<map.length; i++)
			map[i].loc.x -=left_right_dist_delta;
	} else {
		not_going_down = false;
	}
}

var getSpriteRectFromName = function(name){
	for(var i=0; i<spriterects.length; i++){
		if(spriterects[i].name == name){
			return spriterects[i].rect;
		}
	}
}


