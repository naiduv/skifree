
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

var slow_speed = 22;
var fast_speed = 12;

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

var curr_skier_sprite = "ski_right";
var skierloc = new Point(10,10);
var map = Array();
var crash = false;
var not_going_down = true;
var score;
var score_font_color = "black";
var finished_map = false;
var faster = false;

window.addEventListener("load", init); 

var toggleshowcontrols = function(){
	$("#controlsview").toggleClass("show");
}

var toggleshowcredits = function(){
	$("#creditsimg").toggleClass("show");
}

$('a').live('click', function(e) {
  var href = e.currentTarget.href;
  var classname = e.currentTarget.className;
  chrome.tabs.getSelected(null,function(tab) {
  	if(href[href.length-1]=="#"){
  		switch(classname){
  			case 'menu-controls':
  				_gaq.push(['_trackEvent', 'click', 'controls']);
  				toggleshowcontrols();
  				break;
  			case 'menu-submitscore':
  				debugger;
  		// 		$.ajax({
    // 				url: 'https://skifree.firebaseio.com/test.json',
    // 				type: 'PUT',
    // 				data: '{"xasxasxsax":"test"}',
    // 				success: function(res) {
    // 					debugger;
    // 					console.log("this is the res = "+res);
    // 				}
				// });
    // 			$.ajax({
    // 				url: 'https://skifree.firebaseio.com/test.json',
    // 				type: 'GET',
    // 				success: function(res) {
    // 					debugger;
    // 					console.log("this is the res = "+res);
    // 				}
				// });
  		// 		break;
  			case 'menu-credits':
  				toggleshowcredits();
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
	_gaq.push(['_trackEvent', 'game', 'started']);
	skierloc = new Point(canvass.width/2, canvass.height/2-60);
	score = 0;
	addFirstObjects();
	mainloop();
}

// var highscores;
// var gethighscores = function(){
// 	$.ajax({
//     	url: 'https://skifree.firebaseio.com/highscores.json',
//     	type: 'GET',
//     	success: function(res) {
//     		highscores = res;
//     		console.log(highscores);
//     	}
// 	});
// }

// var puthighscore() = function(){
// 	$.ajax({
//     	url: 'https://skifree.firebaseio.com/highscores.json',
//     	type: 'PUT',
//     	success: function(res) {
//     	}
// }

var sx1=-345;
var sx2=-45;

var fsx1=30;
var fsx2=330;

var stx1=405;
var stx2=705;

var starty = 430;
var finishy = 12030;

var firstobjs = [{hard: false, loc: new Point(30, 190), type: "sign_slalom"},
				{hard: false, loc: new Point(180, 190), type: "sign_freestyle"},
				{hard: false, loc: new Point(330, 190), type: "sign_treeslalom"},
				
				//slalom
				{hard: false, loc: new Point(sx1, starty), type: "sign_start_left"},
				{hard: false, loc: new Point(sx2, starty), type: "sign_start_right"},
				{hard: false, loc: new Point(sx1, finishy), type: "sign_finish_left"},
				{hard: false, loc: new Point(sx2, finishy), type: "sign_finish_right"},

				//freestyle
				{hard: false, loc: new Point(fsx1, starty), type: "sign_start_left"},
				{hard: false, loc: new Point(fsx2, starty), type: "sign_start_right"},
				{hard: false, loc: new Point(fsx1, finishy), type: "sign_finish_left"},
				{hard: false, loc: new Point(fsx2, finishy), type: "sign_finish_right"},

				//treeslalom
				{hard: false, loc: new Point(stx1, starty), type: "sign_start_left"},
				{hard: false, loc: new Point(stx2, starty), type: "sign_start_right"},
				{hard: false, loc: new Point(stx1, finishy), type: "sign_finish_left"},
				{hard: false, loc: new Point(stx2, finishy), type: "sign_finish_right"},

				]

var addFirstObjects = function()
{
	for(var i=0; i<firstobjs.length; i++){
		var mo = new map_object();
		mo.hard = firstobjs[i].hard;
		mo.loc = firstobjs[i].loc;
		mo.type = firstobjs[i].type;
		map.push(mo);
	}
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
	//console.log('crashed')
	curr_skier_sprite="crash1";
	drawskier(ctxs, skierloc);
	if(jumping){
		jumping = false;
		endjump();
	}
}

var mainlooptimer;
var mainloop = function(){
	clearTimeout(mainlooptimer);
	mainlooptimer = setTimeout(mainloop, faster?fast_speed:slow_speed);
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
	logscore();
	//checkfinish();
}

var logscore = function(){
	if(score>0 && score % 300 == 0){
		_gaq.push(['_trackEvent', 'game', 'score', score]);
	}
}

var checkfinish = function(){
	if(map[0].loc.y>(-1*finishy-500)){
		return;
	}

	//resetmap();
}

var resetmap = function(){
	for(var i=0; i<map.length; i++){
		map[i].loc.y += finishy+1000; 
	}
	
}

var clearmap = function(){
	ctxm.clearRect(0,0,canvasm.width, canvasm.height);
}

var map_object = function(){
	this.type = "small_tree";
	this.loc = new Point(10,10); 
	this.hit = false;
	this.hard = true;
	this.automove = false;
	this.movevector = new Point(0,0);
	this.height = 0;
}

// var new_map_object = function(type, loc, hard, auto, vector){
// 	var mo = new map_object();
// 	mo.type = type;
// 	mo.loc = loc;
// 	mo.hard = hard;
// 	mo.automove = auto;
// 	mo.movevector = vector;
// 	return mo;
// }

var map_objects = [{o:"small_tree", h:10, hard:1 },
		   {o:"big_rock", h:0, hard:1},
		   {o:"small_rock", h:0, hard:1},
		   {o:"burnt_tree", h:10, hard:1},
		   {o:"big_tree", h:20, hard:1},
		   {o:"rainbow", h:0, hard:0}];

var addobjecttomap = function(){
	if(not_going_down)
		return;

	var mo = new map_object();
	var ranpick = myurand(3*map_objects.length-1);
	if(ranpick > map_objects.length-1)
		return;
	mo.type = map_objects[ranpick].o;
	mo.height = map_objects[ranpick].h;
        mo.hard = map_objects[ranpick].hard ? true:false;
	mo.loc = new Point(myrand(canvasm.width*2), canvasm.height);
	map.push(mo);
}

var drawobjectsfrommap = function(){
	for(var i=0; i<map.length; i++){
	    if (map[i].hit == false && checkcollision(map[i].type, map[i].loc, map[i].height)) {
	        if (map[i].hard) {
	            map[i].hit = true;
	            curr_skier_sprite = "crash2";
	            crash = true;
	            score -= score_penalty_crash;
	            not_going_down = true;
	            setTimeout(oncrash, 700);
	        } else {
	            if (map[i].type == "rainbow") {
	                map[i].hit = true;
	                startJump(100, 10);
	            }
	        }
	    }

		// if(curr_skier_sprite == 'ski_left')
		// 	map[i].loc.x +=5;
		// else if(curr_skier_sprite == 'ski_right')
		// 	map[i].loc.x -=5;
		if(curr_skier_sprite == 'ski_down')
			map[i].loc.y -=6;
		else if(curr_skier_sprite == "ski_jump_1")
			map[i].loc.y -=8;
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

		if(map[i].loc.y<-250 && map[i].loc.y>=canvass.height+200)
			continue;

		//only draw if y<-250 && y>canvas.height+200
		drawobject(ctxm, map[i].type, map[i].loc);
	}
}
//USE PT IN RECT
var checkcollision = function (type, loc, height) {
    var objectrect = getSpriteRectFromName(type);
	var skierrect = getSpriteRectFromName(curr_skier_sprite);
	var objcollrect = new Rect(loc.x+10, loc.y+objectrect.h-10, objectrect.w-10, 5);
	var skiercollrect = new Rect(skierloc.x+5, skierloc.y+10, skierrect.w-10, skierrect.h-20);
	// ctxm.fillStyle = "rgba(0, 0, 200, 0.5)";
	// ctxm.fillRect(objcollrect.x, objcollrect.y, objcollrect.w, objcollrect.h);
	// ctxm.fillRect(skiercollrect.x, skiercollrect.y, skiercollrect.w, skiercollrect.h);
	if(rectscollide(objcollrect, skiercollrect) && skier_elev<=height)
		 	return true;
		// if(skier_elev<=height)
		// 	return true;
		// else{
		// 	//startJump(24);
		// 	debugger;
		// 	//skier_elev = height+1;
		// 	//jumping = false;
		// 	jumpstep +=10;
		// 	jumpsize +=10;
		// 	return false;
		// }
	else 
		return false;
}


var spriterects = [
    {"name": "ski_left", 		"rect": new Rect(0,0,30,36),		},
    {"name": "ski_right", 		"rect": new Rect(30,0,30,36),		},
    {"name": "ski_down_left", 		"rect": new Rect(60,0,30,36),		},
    {"name": "ski_down_right", 		"rect": new Rect(90,0,30,36),		},
    {"name": "ski_down", 		"rect": new Rect(120,0,30,36),		},
    {"name": "ski_right_down", 		"rect": new Rectxy(232,0,260,34),	},
    {"name": "ski_left_down", 		"rect": new Rectxy(262,0,287,34),	},
    {"name": "ski_jump_1",		"rect": new Rectxy(288,0,324,34),	},
    {"name": "crash1", 			"rect": new Rect(155,0,30,36),		},
    {"name": "crash2", 			"rect": new Rect(190,0,40,36),		},
    {"name": "small_tree", 		"rect": new Rect(49, 93, 35, 40),	},
    {"name": "big_rock", 		"rect": new Rect(120,114,30,16),	},
    {"name": "small_rock", 		"rect": new Rectxy(236,115,256,130),},
    {"name": "burnt_tree", 		"rect": new Rectxy(89,99,113,127),	},
    {"name": "big_tree", 		"rect": new Rectxy(6,61,38,127),	},
    {"name": "rainbow",                 "rect": new Rectxy(318,288,353,299),},                            
    {"name": "sign_slalom",	        "rect": new Rectxy(4,183,46,221),	},
    {"name": "sign_freestyle",		"rect": new Rectxy(54,185,97,222),	},
    {"name": "sign_treeslalom",		"rect": new Rectxy(100,185,147,223),},
    {"name": "sign_start_left",		"rect": new Rectxy(155,189,202,222),},
    {"name": "sign_start_right",	"rect": new Rectxy(202,189,249,222),},
    {"name": "sign_finish_left",	"rect": new Rectxy(333,189,385,222),},
    {"name": "sign_finish_right",	"rect": new Rectxy(385,189,440,222),},
]

var drawskier = function(ctx, loc){
	var rect = getSpriteRectFromName(curr_skier_sprite);
	ctx.clearRect(0,0,canvass.width, canvass.height);
	ctx.drawImage(sprites, rect.x, rect.y, rect.w, rect.h, loc.x, loc.y, rect.w, rect.h);
}

var drawobject = function(ctx, obj, loc){
	var rect = getSpriteRectFromName(obj);
	ctx.drawImage(sprites, rect.x, rect.y, rect.w, rect.h, loc.x, loc.y, rect.w, rect.h);
}

document.onkeyup = function(e){
	//console.log(e.keyCode);
	switch(e.keyCode){
		case 32: onSpace();
		break;
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


var jumping = false;
var onSpace = function(){
	console.log('onspace');
	startJump(10, 10);
	//jump
}

var multiplyJump = function(){

}

var jumpMoveUpIntervalId;
var jumpMoveDownIntervalId;
var skier_elev = 0;
var jumpsize; 
var jumpstep;
var jumpMoveUpCount = 0

var startJump = function(size, step){
	if(jumping)
		return;
	jumping = true;
	jumpsize = size;
	jumpstep = step;
	clearInterval(jumpMoveUpIntervalId);
	clearInterval(jumpMoveDownIntervalId);
	jumpMoveUpCount = 0;

	curr_skier_sprite = "ski_jump_1";
	jumpMoveUp();
	jumpMoveUpIntervalId = setInterval(jumpMoveUp, jumpstep);
	//setTimeout(endJump, jumpstep*(jumpsize+1));
}

var jumpMoveUp = function()
{
	console.log('jumpmoveup');
	jumpMoveUpCount++;
	skierloc.y -=1;
	skier_elev +=1; 
	if(jumpMoveUpCount==jumpsize){
		//skier_elev = 0;
		jumpMoveDownCount = jumpMoveUpCount;
		jumpMoveDownIntervalId = setInterval(jumpMoveDown, jumpstep);
		clearInterval(jumpMoveUpIntervalId);
	}
}

var jumpMoveDown = function()
{
	console.log('jumpmovedown');
	jumpMoveDownCount--;
	skierloc.y +=1;
	skier_elev -=1;
	if(jumpMoveDownCount<=0){
		clearInterval(jumpMoveDownIntervalId);
		endJump();
	}
}

var endJump = function()
{
	skierloc = new Point(canvass.width/2, canvass.height/2-60);
	skier_elev = 0;
	console.log('endjump');
	//skierloc.y += 6;
	jumping = false;
	onDown();
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
		if(!crash){
			for(var i=0; i<map.length; i++)
				map[i].loc.x += left_right_dist_delta;
		}
	} else {
		not_going_down = false;
	}
}

var onRight = function(){
	//if(crash) crash = false;

	curr_skier_sprite = getNextLogicalSprite(curr_skier_sprite, 1);
	
	//right motion
	if(curr_skier_sprite == "ski_right"){
		not_going_down = true;
		if(!crash){
			for(var i=0; i<map.length; i++)
				map[i].loc.x -=left_right_dist_delta;
		}
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

	console.log('getSpriteRectFromName failed for name' + name);
}


