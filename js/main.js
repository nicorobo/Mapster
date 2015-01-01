var s = Snap('#map-container');
var load = Snap.load('neighborhood.svg', createMap);
function createMap(mapdata){
	g = mapdata.select('g');
	s.add(mapdata);

	var Mapster = function(map, snap){
		this.g = map;
		this.s = snap;
		this.matrix = new Snap.Matrix();
		this.scaleFactor=1;
		this.bounding = this.g.getBBox();
		this.width = this.bounding.width;
		this.height = this.bounding.height;
		this.center = this.markCenter();
		this.lastMouseX = 0;
		this.lastMouseY = 0;
	}
	Mapster.prototype = {
		scale: function(x, fx, fy){
			x = x || 1.5;
			fx = fx || 0;
			fy = fy || 0;
			this.scaleFactor *=x;
			if(x>1){
				this.lastMouseX = fx;
				this.lastMouseY = fy;
			}
			this.matrix.scale(x, x, fx, fy);
			this.pan(0, 0);
			this.apply();
		},
		pan: function(dx, dy, apply){
			var bounding = this.g.getBBox();
			var leftBound = 0;
			var rightBound = this.width-1
			var topBound = 0;
			var bottomBound = this.height-1
			var apply = apply || true;
			// console.log(bounding);
			if(bounding.y+dy>topBound) {
				this.lastMouseY-= topBound-bounding.y
				this.matrix.translate(0, topBound-bounding.y);
			}
			else if(bounding.y2+dy<bottomBound) {
				this.lastMouseY-= bottomBound-bounding.y2
				this.matrix.translate(0, bottomBound-bounding.y2);
			}
			else {
				this.lastMouseY-=dy
				this.matrix.translate(0, dy);
			}

			if(bounding.x+dx>leftBound) {
				this.lastMouseX-= leftBound-bounding.x;
				this.matrix.translate(leftBound-bounding.x, 0); 
			}
			else if(bounding.x2+dx<rightBound) {
				this.lastMouseX-= rightBound-bounding.x2;
				this.matrix.translate(rightBound-bounding.x2, dy);
			}
			else {
				this.lastMouseX-=dx
				this.matrix.translate(dx, 0);
			}
			// this.matrix.translate(dx, dy);
			if(apply) this.apply();
		},
		markCenter: function(){
			var bounding = this.g.getBBox();
			var center = this.g.circle(bounding.cx, bounding.cy, 5).attr({fill:'salmon'});
			var line1 = this.g.line(bounding.x, bounding.y, bounding.x, bounding.y2);
			var line2 = this.g.line(bounding.x2, bounding.y, bounding.x, bounding.y);
			var line3 = this.g.line(bounding.x, bounding.y2, bounding.x2, bounding.y2);
			var line4 = this.g.line(bounding.x2, bounding.y2, bounding.x2, bounding.y);
			var square = this.g.group(line1, line2, line3, line4).attr({stroke:'salmon'});
			return center;
		},
		drawGrid: function(num){
			var squareWidth = this.width/num;
			var numOfSquaresX = num;
			var numOfSquaresY = Math.ceil(this.height/squareWidth);
			// var squares = new Snap.Paper();
			var x=0;
			var y=0;
			for(var i=0; i<numOfSquaresX; i++){
				y=0;
				for(var j=0; j<numOfSquaresY; j++){
					this.g.rect(x, y, squareWidth, squareWidth).attr({class:"grid-square", id:"square"+j+'-'+i})
					y+=squareWidth;
				}
				x+=squareWidth;
			}

		},
		reset: function(){
			this.matrix = Snap.matrix(1, 0, 0, 1, 0, 0);
			this.apply();
		},
		apply: function(){
			this.g.transform(this.matrix.toTransformString());
		}
	}

	var map = new Mapster(g, s);
	map.drawGrid(30);
	var mouseX = 0;
	var mouseY = 0;
	map.g.drag(dragging, startDrag, endDrag);
	function dragging(dx, dy, x, y, event){
		$('#map-container').css('cursor', 'move');
		map.pan((event.movementX*1.5)/map.scaleFactor, (event.movementY*1.5)/map.scaleFactor);
	}
	function startDrag(){

	}
	function endDrag(){
		$('#map-container').css('cursor', 'default');
	}
	$('#map-container').on('mousewheel', scrollZoom);
	$('#map-container').on('mousemove', trackMouse);
	$('#map-container').on('dblclick', clickZoom);
	$('#reset').on('click', resetMap);
	function resetMap(){
		map.reset();
	}

	function trackMouse(event){
		mouseX = event.offsetX;
		mouseY = event.offsetY;
	}

	function scrollZoom(event){
		console.log(event);
		if(event.deltaY <1 && map.scaleFactor*9/10>=1) map.scale(9/10, map.lastMouseX, map.lastMouseY);
		else if(event.deltaY <1 && map.scaleFactor*9/10<1) map.scale(1/map.scaleFactor,mouseX, mouseY);
		else if (event.deltaY>=1 && map.scaleFactor*10/9<6) map.scale(10/9, mouseX*1.5, mouseY*1.5);
	}
	function clickZoom(){
		if(map.scaleFactor*10/9<6) map.scale(2, mouseX*1.5, mouseY*1.5);
	}
}