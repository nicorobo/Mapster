
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
		this.tempSquares = this.g.group().attr({opacity: 0.5});
		this.gridSet = this.g.group().attr({opacity: 0.8});
		this.$gridSquares = $('.grid-square');
		this.$gridLines = $('.grid-line');
		this.bounding = this.g.getBBox();
		this.markCenter();
		this.brush = 'type1';
		this.currentCoord = [0, 0];
		this.type0coords=[];
		this.type1coords=[];
		this.type2coords=[];
		this.type3coords=[];

	}

	  //////////////////////////////////////
	 ////// Mapster Object Prototype //////
	//////////////////////////////////////

	Mapster.prototype = {
		markCenter: function(){
			var center = this.g.circle(this.bounding.cx, this.bounding.cy, 5).attr({fill:'salmon'});
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
		drawGrid: function(){
			this.removeGrid();
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
			this.$gridLines = $('.grid-line');
		},
		removeGrid: function(){
			this.gridSet.clear();
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
			this.tempSquares.rect(pixels[0], pixels[1], squareWidth, squareWidth).attr({class: "cursorBlock"})
		},
		eraseCursorBlock:function(){
			this.tempSquares.clear();
		},
		colorSquares: function(squares){

		},
		colorArray: function(coordinates){

		},
		multiDragDisplay: function(startingCoord){
			this.tempSquares.clear();
			this.drawRect(startingCoord, this.currentCoord, this.tempSquares, false);
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
				console.log("offsetX: "+offsetX+" offsetY: "+ offsetY);
				canvas.rect(pixels[0], pixels[1], ((-1)*offsetX+1)*squareWidth, ((-1)*offsetY+1)*squareWidth).attr({class:this.brush});
			}
			// rectangles root at top right
			if(toRight && !toBelow){
				var pixelX = this.getTopLeftPixels(startingCoord)[0];
				var pixelY = this.getTopRightPixels(endingCoord)[1];
				console.log("offsetX: "+offsetX+" offsetY: "+ offsetY);
				canvas.rect(pixelX, pixelY, ((-1)*offsetX+1)*squareWidth, (offsetY+1)*squareWidth).attr({class:this.brush});
			}
			// rectangles root at top left
			if(!toRight && toBelow){
				var pixelX = this.getBottomLeftPixels(endingCoord)[0];
				var pixelY = this.getTopLeftPixels(startingCoord)[1];
				console.log("offsetX: "+offsetX+" offsetY: "+ offsetY);
				canvas.rect(pixelX, pixelY, (offsetX+1)*squareWidth, ((-1)*offsetY+1)*squareWidth).attr({class:this.brush});
			}
			// rectangles root at top right
			if(!toRight && !toBelow){
				var pixels = this.getTopLeftPixels(endingCoord);
				console.log("offsetX: "+offsetX+" offsetY: "+ offsetY);
				canvas.rect(pixels[0], pixels[1], (offsetX+1)*squareWidth, (offsetY+1)*squareWidth).attr({class:this.brush});
			}
			if(permanent){
				
			}
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
	}

	  //////////////////////////////////////
	 ////// Initialize Mapster Object /////
	//////////////////////////////////////

	var map = new Mapster(mapImage);
	chooseBrush('type1');

	function actOnGrid(){
		if(map.mapArray.length>0) return true;
		else return false;
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
			map.createArray(gridDimension);
			map.drawGrid();
		}

		function removeGrid(){
			map.removeGrid();
		}

		function hideGrid(){
			map.$gridLines.hide();
		}

		function showGrid(){
			map.$gridLines.show();
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
	var possibleBlocks = [];

	$themap.on('mousedown', mapMousedown);
	$themap.on('mouseup', mapMouseup);

	function mapMousedown(event){
		if(actOnGrid()){
			event.preventDefault();
			possibleBlocks = [];
			possibleBlocks.push(map.currentCoord);
			if(event.shiftKey || event.ctrlKey){
				$themap.panzoom('option', 'disablePan', true);
				$themap.panzoom('option', 'disableZoom', true);
				if(event.shiftKey){
					multiDrag = true;
					$themap.on('mousemove', multiDragging);
				}
				else if(event.ctrlKey){
					brushDrag = true;
				}
			}
		}
	}

	function mapMouseup(event){
		if(actOnGrid() && !didPan){
			$themap.panzoom('option', 'disablePan', false);
			$themap.panzoom('option', 'disableZoom', false);
			if(multiDrag){
				$themap.unbind('mousemove', multiDragging);
				multiDrag = false;
			}
			else if(brushDrag){
				brushDrag = false;
			}
			else{

			}
			map.tempSquares.clear();
		}
	}

	function multiDragging(){
		map.multiDragDisplay(possibleBlocks[0]);
	}




}

