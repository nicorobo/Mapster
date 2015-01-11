
  //////////////////////////////////////
 ///// Initialize Snap.svg Object /////
//////////////////////////////////////

var s = Snap('#map-container');
var load = Snap.load('neighborhood.svg', createMap);



  //////////////////////////////////////
 //////////// Program Body ////////////
//////////////////////////////////////

function createMap(mapdata){
	mapImage = mapdata.select('g');
	s.add(mapdata);

	  //////////////////////////////////////
	 ///// Mapster Object Constructor /////
	//////////////////////////////////////

	var Mapster = function(map) {
		this.g = map;
		this.mapArray = [];
		this.squares = this.g.group().attr({opacity: 0.5});
		this.permaSquares = this.squares.group();
		this.tempSquares = this.squares.group();
		this.path = this.g.group();
		this.points = this.g.group();
		this.gridSet = this.g.group().attr({opacity: 0.5});
		this.bounding = this.g.getBBox();
		this.markCenter();
		this.brush = 'type1';
		this.currentCoord = [0, 0];
		this.hidden = false;
	}

	  //////////////////////////////////////
	 ////// Mapster Object Prototype //////
	//////////////////////////////////////

	Mapster.prototype = {
		markCenter: function(){
			var center = this.g.circle(this.bounding.cx, this.bounding.cy, 5).attr({fill:'salmon'});
		},
		reset: function(){
			this.permaSquares.clear();
			this.tempSquares.clear();
			this.path.clear();
			this.points.clear();
			this.gridSet.clear();
			this.mapArray = [];
			this.show();
		},
		hide: function(){
			this.squares.addClass('hidden');
			this.gridSet.addClass('hidden');
			this.hidden = true;
		},
		show: function(){
			this.squares.removeClass('hidden');
			this.gridSet.removeClass('hidden');
			this.hidden = false;
		},
		loadArray: function(array){
			this.mapArray = array;
		},
		createArray: function(sizeX, sizeY){
			var arr = [];
			var squareWidth = this.bounding.width/sizeX;
			var dimX = sizeX;
			var dimY = sizeY || Math.ceil(this.bounding.height/squareWidth) || sizeX;
			for(var i=0; i<dimY; i++){
				var xArr = [];
				for(var j=0; j<dimX; j++){
					xArr.push(1);
				}
				arr.push(xArr);
			}
			this.mapArray = arr;
		},
		findPath: function(startingCoord, endingCoord){
			var graph = new Graph(this.mapArray);
			console.log(graph);
			var start = graph.grid[startingCoord[0]][startingCoord[1]];
			var end = graph.grid[endingCoord[0]][endingCoord[1]];
    		var result = astar.search(graph, start, end);
    		var path = [startingCoord];
    		for(node in result){
    			path.push([result[node].x, result[node].y]);
    		}
    		this.drawPath(path);
		},
		drawGrid: function(){
			var squareWidth = this.squareWidthSVG();
			var height = this.bounding.height;
			var width = this.bounding.width;
			var x=0;
			var y=0;
			//vertical lines
			for(var i=0; i<=this.mapArray[0].length; i++){
				x = squareWidth*i;
				this.gridSet.line(x, 0, x, height ).attr({class: 'grid-line'});
			}
			//horizontal lines
			for(var i=0; i<=this.mapArray.length; i++){
				y = squareWidth*i;
				this.gridSet.line(0, y, width, y).attr({class: 'grid-line'});
			}
		},
		changeBrush: function(newBrush){
			var oldBrush = this.brush;
			this.brush = newBrush;
			return oldBrush;
		},
		squareWidth: function(){
			return window.innerWidth/this.mapArray[0].length;
		},
		squareWidthSVG: function(){
			return this.bounding.width/this.mapArray[0].length;
		},
		drawCursorBlock: function(coordinates){
			this.currentCoord = coordinates;
			var squareWidth = this.squareWidthSVG();
			var pixels = this.getTopLeftPixels(coordinates);
			this.tempSquares.rect(pixels[0], pixels[1], squareWidth, squareWidth).attr({class: "cursor-block"});
		},
		eraseCursorBlock:function(){
			this.tempSquares.clear();
		},
		colorArray: function(coordinates){
			var type = parseInt(this.brush.slice(4));
			for(var i=0; i<=coordinates.length-1; i++){
				var current = coordinates[i];
				this.mapArray[current[1]][current[0]] = type;
			}
		},
		colorSquares: function(coordinates){
			this.tempSquares.clear();
			var pixels = this.getTopLeftPixels(coordinates);
			var squareWidth = this.squareWidthSVG();
			this.permaSquares.rect(pixels[0], pixels[1], squareWidth, squareWidth).attr({class: this.brush});
		},
		multiDragDisplay: function(startingCoord){
			this.tempSquares.clear();
			this.drawRect(startingCoord, this.currentCoord, this.tempSquares, false);
		},
		multiDrag: function(startingCoord, endingCoord){
			this.drawRect(startingCoord, endingCoord, this.permaSquares, true)
		},
		drawRect: function(startingCoord, endingCoord, canvas, permanent){
			var offsetX = startingCoord[0]-endingCoord[0]
			var offsetY = startingCoord[1]-endingCoord[1]
			var toRight = 0>=offsetX;
			var toBelow = 0>=offsetY;
			var squareWidth = this.squareWidthSVG();
			// rectangles root at top left
			if(toRight && toBelow){
				var pixels = this.getTopLeftPixels(startingCoord);
				canvas.rect(pixels[0], pixels[1], ((-1)*offsetX+1)*squareWidth, ((-1)*offsetY+1)*squareWidth).attr({class:this.brush});
			}
			// rectangles root at top right
			if(toRight && !toBelow){
				var pixelX = this.getTopLeftPixels(startingCoord)[0];
				var pixelY = this.getTopRightPixels(endingCoord)[1];
				canvas.rect(pixelX, pixelY, ((-1)*offsetX+1)*squareWidth, (offsetY+1)*squareWidth).attr({class:this.brush});
			}
			// rectangles root at top left
			if(!toRight && toBelow){
				var pixelX = this.getBottomLeftPixels(endingCoord)[0];
				var pixelY = this.getTopLeftPixels(startingCoord)[1];
				canvas.rect(pixelX, pixelY, (offsetX+1)*squareWidth, ((-1)*offsetY+1)*squareWidth).attr({class:this.brush});
			}
			// rectangles root at top right
			if(!toRight && !toBelow){
				var pixels = this.getTopLeftPixels(endingCoord);
				canvas.rect(pixels[0], pixels[1], (offsetX+1)*squareWidth, (offsetY+1)*squareWidth).attr({class:this.brush});
			}
			if(permanent){
				var type = parseInt(this.brush.slice(4));
				var startingX = Math.min(startingCoord[0],endingCoord[0]);
				var startingY = Math.min(startingCoord[1],endingCoord[1]);
				for(var i=0; i<=Math.abs(offsetY); i++){
					for(var j=0; j<=Math.abs(offsetX); j++){
						this.mapArray[startingY+i][startingX+j] = type;
					}
				}
			}
		},
		drawPath: function(path){
			var polylineArray = [];
			var halfSquareWidth = this.squareWidthSVG()/2;
			for(var i=0; i<path.length; i++){
				var pixels = this.getTopLeftPixels(path[i]);
				console.log(halfSquareWidth);
				polylineArray.push(parseInt(pixels[0]+halfSquareWidth));
				polylineArray.push(parseInt(pixels[1]+halfSquareWidth));
			}
			console.log(polylineArray);
			this.path.polyline(polylineArray).attr({class: 'path'});
		},
		erasePath: function(){
			this.path.clear();
			this.points.clear();
		},
		drawMarker: function(coordinates, selector){
			var pixels = this.getTopLeftPixels(coordinates);
			var halfSquareWidth = this.squareWidthSVG()/2;
			this.points.circle(pixels[0]+halfSquareWidth, pixels[1]+halfSquareWidth, 3).attr({class: selector});
		},
		getTopLeftPixels: function(coordinates){
			var x = coordinates[0]*this.squareWidthSVG();
			var y = coordinates[1]*this.squareWidthSVG();
			return [x, y];
		},
		getTopRightPixels: function(coordinates){
			var x = (coordinates[0]+1)*this.squareWidthSVG();
			var y = coordinates[1]*this.squareWidthSVG();
			return [x, y];
		},
		getBottomLeftPixels: function(coordinates){
			var x = coordinates[0]*this.squareWidthSVG();
			var y = (coordinates[1]+1)*this.squareWidthSVG();
			return [x, y];
		},
		getBottomRightPixels: function(coordinates){
			var x = (coordinates[0]+1)*this.squareWidthSVG();
			var y = (coordinates[1]+1)*this.squareWidthSVG();
			return [x, y];
		},
		setSquareOpacity: function(newOpacity){
			this.squares.attr({opacity: newOpacity});
		}
	}

	  //////////////////////////////////////
	 ////// Initialize Mapster Object /////
	//////////////////////////////////////

	var map = new Mapster(mapImage);
	chooseBrush('type1');

	function actOnGrid(){
		if(!map.mapArray.length>0) return false;
		if(map.hidden) return false;
		else return true;
	}

	  //////////////////////////////////////
	 ////////// jQuery Variables //////////
	//////////////////////////////////////

	var $mapContainer = $('#map-container');
	var $themap = $mapContainer.find('svg');
	var $controlHandle = $('#control-handle');
	var $controlPanel = $('#control-panel');
	var $coordX = $('#square-coordX');
	var $coordY = $('#square-coordY');
	var $pathText = $('#path-text');

	  //////////////////////////////////////
	 //////////// Panzoom.js //////////////
	//////////////////////////////////////

	$themap.panzoom({
		minScale:1, 
		contain: 'invert',
		cursor: '' 
	});

	$controlHandle.panzoom({
		disableZoom:'true', 
		$set: $('#control-panel'), 
		cursor:''
	});

	//Fixes the offset issue in Firefox.
	var instance = $themap.panzoom('instance');
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
	});


	  //////////////////////////////////////
	 /////////// Control Panel ////////////
	//////////////////////////////////////

	// Grid Creation

		$controlPanel.on('click', '#create-grid-button', createGrid)
					 .on('click', '#remove-grid-button', removeGrid)
					 .on('click', '#hide-grid-button', hideGrid)
					 .on('click', '#show-grid-button', showGrid);


		function createGrid(){
			var gridDimension = $('#grid-dimension-picker').val();
			map.reset();
			map.createArray(gridDimension);
			map.drawGrid();
		}

		function removeGrid(){
			map.reset();
		}

		function hideGrid(){
			map.hide();
		}

		function showGrid(){
			map.show();
		}

	// Brush Selection

		$controlPanel.on('click', '#type0-brush', chooseBrush)
					 .on('click', '#type1-brush', chooseBrush)
					 .on('click', '#type2-brush', chooseBrush)
					 .on('click', '#type3-brush', chooseBrush);

		function chooseBrush(newBrush){
			var brushButton,brush;
			if(typeof newBrush != 'object'){
				brush = newBrush;
			}
			else{
				brushButton = $(this);
				brush = brushButton.attr('id').split('-')[0];
			}
			var oldBrush = map.changeBrush(brush);
			$('#'+oldBrush+'-brush').css('border', '');
			$('#'+brush+'-brush').css('border', '2px solid white');
		}
	// Opacity

		$controlPanel.on('input', '#opacity-slider', changeOpacity);
		function changeOpacity(){
			var opacity = $(this).val();
			map.setSquareOpacity(opacity);
		}


	  //////////////////////////////////////
	 ////////// Grid Navigation ///////////
	//////////////////////////////////////

	$themap.on('mousemove', findCoordinates);

	function findCoordinates(event){
		if(actOnGrid()){
			var squareSize = map.squareWidth();
			var x = Math.floor(event.offsetX/squareSize);
			var y = Math.floor(event.offsetY/squareSize);			

			if(map.currentCoord[0]!=x || map.currentCoord[1]!= y){
				map.eraseCursorBlock();
				map.drawCursorBlock([x, y]);
				$coordX.text(x);
				$coordY.text(y);
			}
		}
	}

	  //////////////////////////////////////
	 /////////// Grid Coloring ////////////
	//////////////////////////////////////

	var didPan = false;
	var multiDrag = false;
	var brushDrag = false;
	var blocksInProgress = [];

	$themap.on('mousedown', mapMousedown);
	$themap.on('mouseup', mapMouseup);

	function mapMousedown(event){
		if(!actOnGrid() || isPathfinding) return false;
		didPan = false;
		event.preventDefault();
		blocksInProgress = [];
		blocksInProgress.push(map.currentCoord);
		if(event.shiftKey || event.ctrlKey){
			$themap.panzoom('option', 'disablePan', true);
			$themap.panzoom('option', 'disableZoom', true);
			if(event.shiftKey){
				multiDrag = true;
				$themap.on('mousemove', multiDragging);
			}
			else if(event.ctrlKey){
				brushDrag = true;
				map.colorSquares(blocksInProgress[0]);
				$themap.on('mousemove', brushDragging);
			}
		}
		else{
			$themap.on('mousemove', isPanning);
		}
	}

	function mapMouseup(event){
		if(actOnGrid() && !isPathfinding){
			if(multiDrag||brushDrag){
				$themap.panzoom('option', 'disablePan', false);
				$themap.panzoom('option', 'disableZoom', false);
				if(multiDrag){
					$themap.unbind('mousemove', multiDragging);
					map.multiDrag(blocksInProgress[0], map.currentCoord);
					multiDrag = false;
				}
				else if(brushDrag){
					$themap.unbind('mousemove', brushDragging);
					map.colorArray(blocksInProgress);
					brushDrag = false;
				}
			}
			else if(!didPan){
				$themap.unbind('mousemove', isPanning);
				map.colorSquares(blocksInProgress[0]);
				map.colorArray(blocksInProgress);
			}
		}
	}
	function isPanning(){
		didPan = true;
	}
	function brushDragging(){
		if(arraysMatch(map.currentCoord, blocksInProgress[blocksInProgress.length-1]) || arrayContains(blocksInProgress, map.currentCoord)) return true;

		blocksInProgress.push(map.currentCoord);
		map.colorSquares(blocksInProgress[blocksInProgress.length-1]);
	}
	function multiDragging(){
		map.multiDragDisplay(blocksInProgress[0]);
	}


	  //////////////////////////////////////
	 /////////// Path Finding /////////////
	//////////////////////////////////////

	var isPathfinding = false;
	var startingPoint, endingPoint;

	$controlPanel.on('click', '#path-start', beginPathfinding);

	function beginPathfinding(){	
		if(!actOnGrid()){
			$pathText.text("Sorry, there must be a grid present.");
			setTimeout(function(){
				$pathText.text("Lets find some paths!");
			}, 2000);
			return true;
		}
		map.erasePath();
		isPathfinding = true;
		$pathText.text("Click on your starting point.");
		$themap.on('click', getStartingPoint);
	}
	function getStartingPoint(){
		startingPoint = map.currentCoord;
		haveStartingPoint();
	}
	function haveStartingPoint(){
		map.drawMarker(startingPoint, 'starting-point');
		$themap.unbind('click', getStartingPoint);
		$pathText.text("Now click on your ending point.");
		$themap.on('click', getEndingPoint);
	}
	function getEndingPoint(){
		endingPoint = map.currentCoord;
		finishPathfinding();
	}
	function finishPathfinding(){
		map.drawMarker(endingPoint, 'ending-point');
		$themap.unbind('click', getEndingPoint);
		$pathText.text("Awesome! Heres your path.");
		setTimeout(function(){
				$pathText.text("Lets find some paths!");
			}, 2000);
		map.findPath(startingPoint, endingPoint);
		isPathfinding = false;
	}


	  //////////////////////////////////////
	 /////////// Array Printing ///////////
	//////////////////////////////////////

	$controlPanel.on('click', '#get-array', getArray);

	function getArray(){
		console.log(map.mapArray);
	}




	  //////////////////////////////////////
	 ///////// Utility Functions //////////
	//////////////////////////////////////

	function arraysMatch(a, b){
		if(a === b) return true;
		if(a== null || b == null) return false;
		if(a.length != b.length) return false;
		for(var i=0; i<a.length; i++){
			if(a[i] != b[i]) return false;
		}
		return true;
	}

	function arrayContains(a, b){
		for(var i=0; i<a.length; i++){
			if(arraysMatch(a[i], b)) return true;
		}
		return false;
	}




}

