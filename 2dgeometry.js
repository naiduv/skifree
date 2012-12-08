Point = function(x,y){
	this.x = x;
	this.y = y;
}

Point.prototype = {
};

distance = function(p1,p2){
	xd = p1.x - p2.x;
	yd = p1.y - p2.y;
	return Math.sqrt(xd*xd + yd*yd);
}

Rect = function(x,y,w,h){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

Rectxy = function(x1,y1,x2,y2){
	return new Rect(x1,y1,x2-x1,y2-y1);
} 

Rect.prototype = {
	getcorners: function(){
		pts = [];
		pts.push(makepoint(this.x, this.y));
		pts.push(makepoint(this.x+this.w, this.y));
		pts.push(makepoint(this.x, this.y+this.h));
		pts.push(makepoint(this.x+this.w, this.y+this.h));
		return pts; 
	},

	clear: function(ctx){
		ctx.clearRect(this.x, this.y, this.w, this.h);
	},

	stroke: function(ctx, lw, color){
		ctx.lineWidth = lw;
     	ctx.strokeStyle = color;
		ctx.strokeRect(this.x,this.y, this.w, this.h);

	},
};

//checks if x is between a and b (a<x<b or b<x<a)
isbetween = function(x,a,b) {
	var small; var big;
	if(a<=b){
		small=a;
		big=b;
	} else {
		small=b;
		big=a;
	}
	if(x<=big)
		if(small<=x)
			return true;

	return false;
}

//checks if a point is inside a rect
ptinrect = function(pt, rect)
{
	if(isbetween(pt.x,rect.x,rect.x+rect.w) && isbetween(pt.y,rect.y,rect.y+rect.h))
		return true;
	return false;
}

rectscollide = function(rect1, rect2)
{	
	pts = rect1.getcorners();
	for (i in pts) {
		if (ptinrect(pts[i], rect2)) {
			return true;
		}
	}
	return false;
}

makepoint = function(x,y)
{
	return new Point(x,y);
}

makerect = function(x,y,w,h)
{
	return new Rect(x,y,w,h);
}