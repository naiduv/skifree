
//UA-36900024-1

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-36900024-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var left_right_dist_delta = 5;
var score_penalty_crash = 100;

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

window.addEventListener("load", init); 

$('a').live('click', function(e) {
  var href = e.currentTarget.href;
  chrome.tabs.getSelected(null,function(tab) {
    chrome.tabs.update(tab.id, {url: href});
  });
});
 
function init(){
	//we're ready for the loop
	skierloc = new Point(canvass.width/2, canvass.height/2);
	score = 0;
	setInterval(mainloop, 28);
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
	$("#score .num").html("score:"+score);
	$("#score .num").css("color", score_font_color);

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

var map_objects = ["small_tree", "big_rock"];

var rand = function(max){
	return Math.floor(Math.random()*max);
}

var addobjecttomap = function(){
	if(not_going_down)
		return;

	var mo = new _map_object();
	var ranpick = rand(20);
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
			map[i].loc.y -=5;
		else if(curr_skier_sprite == 'ski_left_down'){
			map[i].loc.y -=5;
			map[i].loc.x +=5;	
		}		
		else if(curr_skier_sprite == 'ski_right_down'){
			map[i].loc.y -=5;
			map[i].loc.x -=5;	
		} 
	}
}
//USE PT IN RECT
var checkcollision = function(type, loc){
	var objectpos = getSpriteCoordsFromName(type);
	var skierpos = getSpriteCoordsFromName(curr_skier_sprite);
	var objrect = new Rect(loc.x+5, loc.y+10, objectpos[2]-20, objectpos[3]-10);
	var skierrect = new Rect(skierloc.x+5, skierloc.y+10, skierpos[2]-10, skierpos[3]-20);
	if(rectscollide(objrect, skierrect))
		return true;
	else
		return false;

}


var spritecoord = [
	{"name": "ski_left", "pos": [0,0,30,36]},
	{"name": "ski_right", "pos": [30,0,30,36]},
	{"name": "ski_left_down", "pos": [60,0,30,36]},
	{"name": "ski_right_down", "pos": [90,0,30,36]},
	{"name": "ski_down", "pos": [120,0,30,36]},
	{"name": "crash1", "pos":[155,0,30,36]},
	{"name": "crash2", "pos":[190,0,40,36]},
	{"name": "small_tree", "pos":[49, 93, 35, 40]},
	{"name": "big_rock", "pos":[120,114,30,16]},
]

var drawskier = function(ctx, loc){
	var pos = getSpriteCoordsFromName(curr_skier_sprite);
	ctx.clearRect(skierloc.x-10, skierloc.y-10, 50, 56);
	ctx.drawImage(sprites, pos[0], pos[1], pos[2], pos[3], loc.x, loc.y, pos[2], pos[3]);
}

var drawobject = function(ctx, obj, loc){
	var pos = getSpriteCoordsFromName(obj);
	ctx.drawImage(sprites, pos[0], pos[1], pos[2], pos[3], loc.x, loc.y, pos[2], pos[3]);
}

document.onkeyup = function(e){
	console.log(e.keyCode);
	switch(e.keyCode){
		case 37: onLeft();//drawskier(ctx, spritecoord[0].pos, new Point(10,10));
		break;
		case 38: onUp();
		break;
		case 39: onRight();//drawskier(ctx, spritecoord[1].pos, new Point(10,10));
		break;
		case 40: onDown();
		break;
	}
}

var logic_sprites = ['ski_left','ski_left_down','ski_down','ski_right_down','ski_right'];

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
		if(!crash)
			skierloc.x -= left_right_dist_delta;
		not_going_down = true;
	} else {
		not_going_down = false;
	}
}

var onRight = function(){
	//if(crash) crash = false;

	curr_skier_sprite = getNextLogicalSprite(curr_skier_sprite, 1);
	//skierloc.x += left_right_dist_delta;

	if(curr_skier_sprite == "ski_right"){
		if(!crash)
			skierloc.x += left_right_dist_delta;
		not_going_down = true;
	} else {
		not_going_down = false;
	}
}

var getSpriteCoordsFromName = function(name){
	for(var i=0; i<spritecoord.length; i++){
		if(spritecoord[i].name == name){
			return spritecoord[i].pos;
		}
	}
}