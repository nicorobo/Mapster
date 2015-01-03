var s = Snap('#map-container');
var load = Snap.load('neighborhood.svg', createMap);
function createMap(mapdata){
	g = mapdata.select('g');
	s.add(mapdata);

	var Mapster = function(map, snap){
		this.g = map;
		this.s = snap;
		this.gridSet = this.g.group();
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
			this.removeGrid();
			// this.g.selectAll('.grid-square').remove();
			// var p = new Snap();
			// var squares = p.group()
			var x=0;
			var y=0;
			for(var i=0; i<numOfSquaresX; i++){
				y=0;
				for(var j=0; j<numOfSquaresY; j++){
					this.gridSet.rect(x, y, squareWidth, squareWidth).attr({class:"grid-square", id:"square"+j+'-'+i})
					y+=squareWidth;
				}
				x+=squareWidth;
			}
			// this.g.append(squares);
		}, 
		removeGrid: function(){
			this.gridSet.clear();
		}
	}

	var map = new Mapster(g, s);
	// map.drawGrid(75);

  //////////////////////////////////////
 ///////// Panzoom.js Handlers ////////
//////////////////////////////////////

	var $mapContainer = $('#map-container');
	var $themap = $mapContainer.find('svg').panzoom(
		{
			minScale:1, 
			contain: 'invert',
			cursor: ''
		});
	var $controlHandle = $('#control-handle').panzoom(
		{
			disableZoom:'true', 
			$set: $('#controls'), 
			cursor:''
		});
	var instance = $themap.panzoom('instance');
	//Fixes the offset issue in Firefox.
	instance.parentOffset = { top: $mapContainer[0].offsetTop, left: $mapContainer[0].offsetLeft };
	//Handles mousewheel zooming on map.
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
	//Reset dimensions on resize for panzoom.
	$(window).on('resize', function() {
	  $themap.panzoom('resetDimensions');
	});
	//Ensures the control handle remains green on drag.
	$controlHandle.on('panzoomstart', function(){
		console.log('yup');
		$(this).css('background-color', 'lightgreen');
	}).on('panzoomend', function(){
		$(this).css('background-color', '');
	})
	//Only show move cursor when dragging.
	$themap.on('panzoomstart', function(){
		console.log('yuppers');
		$(this).css('cursor', 'move');
	}).on('panzoomend', function(){
		$(this).css('cursor', '');
	})

//Event Handlers
	$('#create-grid-button').on('click', createGrid);
	$('#remove-grid-button').on('click', removeGrid);
	$('#hide-grid-button').on('click', hideGrid);
	$('#show-grid-button').on('click', showGrid);
	function createGrid(){
		var gridDimension = $('#grid-dimension-picker').val();
		map.drawGrid(gridDimension);
	}
	function removeGrid(){
		map.removeGrid();
	}
	function hideGrid(){
		$('.grid-square').hide();
	}
	function showGrid(){
		$('.grid-square').show();
	}

}