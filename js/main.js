var s = Snap('#map-container');
var load = Snap.load('neighborhood.svg', createMap);
function createMap(mapdata){
	g = mapdata.select('g');
	s.add(mapdata);

	var Mapster = function(map, snap){
		this.g = map;
		this.s = snap;
		this.bounding = this.g.getBBox();
		this.width = this.bounding.width;
		this.height = this.bounding.height;
		this.center = this.markCenter();
	}
	Mapster.prototype = {
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
		}
	}

	var map = new Mapster(g, s);
	map.drawGrid(100);
	var $mapContainer = $('#map-container');
	var $themap = $mapContainer.find('svg').panzoom({minScale:1, contain: 'invert'});
	var instance = $themap.panzoom('instance');
	instance.parentOffset = { top: $mapContainer[0].offsetTop, left: $mapContainer[0].offsetLeft };
	$mapContainer.on('mousewheel.focal', function( e ) {
		e.preventDefault();
		console.log(e);
		var delta = e.delta || e.originalEvent.wheelDelta;
		var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
		$themap.panzoom('zoom', zoomOut, {
			increment: 0.2,
			animate: false,
			focal: e
		});
	});
	$(window).on('resize', function() {
	  $themap.panzoom('resetDimensions');
	});
}