var s = Snap('#map-container');
var load = Snap.load('neighborhood.svg', createMap);
function createMap(mapdata){
	g = mapdata.select('g');
	s.add(mapdata);

	var Mapster = function(map, snap){
		this.g = map;
		this.s = snap;
		this.mapArray = [];
		this.gridSet = this.g.group();
		this.$gridSquares = $('.grid-square');
		this.bounding = this.g.getBBox();
		this.width = this.bounding.width;
		this.height = this.bounding.height;
		this.center = this.markCenter();
	}
	Mapster.prototype = {
		markCenter: function(){
			var bounding = this.g.getBBox();
			var center = this.g.circle(bounding.cx, bounding.cy, 5).attr({fill:'salmon'});
			// var line1 = this.g.line(bounding.x, bounding.y, bounding.x, bounding.y2);
			// var line2 = this.g.line(bounding.x2, bounding.y, bounding.x, bounding.y);
			// var line3 = this.g.line(bounding.x, bounding.y2, bounding.x2, bounding.y2);
			// var line4 = this.g.line(bounding.x2, bounding.y2, bounding.x2, bounding.y);
			// var square = this.g.group(line1, line2, line3, line4).attr({stroke:'salmon'});
			return center;
		},
		loadArray: function(array){
			this.mapArray = array;
		},
		createArray: function(size){
			var yArray = [];
			var squareWidth = this.width/size;
			var numOfSquaresX = size;
			var numOfSquaresY = Math.ceil(this.height/squareWidth);
			for(var i=0; i<numOfSquaresY; i++){
				var xArray = [];
				for(var j=0; j<numOfSquaresX; j++){
					xArray.push(1);
				}
				yArray.push(xArray);
			}
			this.mapArray = yArray;
		},
		drawGrid: function(){
			var squareWidth = this.width/this.mapArray[0].length;
			this.removeGrid();
			var x=0;
			var y=0;
			for(var i=0; i<this.mapArray.length; i++){
				x=0;
				for(var j=0; j<this.mapArray[i].length; j++){
					this.gridSet.rect(x, y, squareWidth, squareWidth).attr({class:"grid-square type"+this.mapArray[i][j], id:"square"+j+'-'+i})
					x+=squareWidth;
				}
				y+=squareWidth;
			}
			this.$gridSquares = $('.grid-square');
			this.$gridSquares.on('mouseover', readSquare);
			function readSquare(){
				var coords =  $(this).attr('id').slice(6).split('-');
				$('#squareX').text(parseInt(coords[0])+1);
				$('#squareY').text(parseInt(coords[1])+1);
			}
		},
		colorSquare: function(squares){
			console.log(arguments);
			for(var i=0; i<arguments.length; i++){
				var theSquare = $(arguments[i]);
				snapSquare = this.g.select('#'+theSquare.attr('id'))
				snapSquare.addClass('type0');
				var coords =  theSquare.attr('id').slice(6).split('-');
				this.mapArray[coords[1]][coords[0]] = 0;
			}
			console.log(this.mapArray);
		},
		removeGrid: function(){
			this.gridSet.clear();
			$('#squareX').text('');
			$('#squareY').text('');
		}
	}

	var map = new Mapster(g, s);

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
		$(this).css('background-color', 'lightgreen');
	}).on('panzoomend', function(){
		$(this).css('background-color', '');
	})
	//Only show move cursor when dragging.
	$themap.on('panzoomstart', function(e){
		console.log(e);
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
		map.createArray(gridDimension);
		map.drawGrid();
	}
	function removeGrid(){
		map.removeGrid();
	}
	function hideGrid(){
		map.$gridSquares.hide();
	}
	function showGrid(){
		map.$gridSquares.show();
	}

	$('#map-container').on('click', '.grid-square', colorSquare)

	function colorSquare(){
		map.colorSquare(this);
	}
	


}