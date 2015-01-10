
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
		this.squares = this.g.group();
		this.tempSquares = this.g.group();
		this.gridSet = this.g.group();
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
			var pixelX = coordinates[0]*squareWidth;
			var pixelY = coordinates[1]*squareWidth;
			this.tempSquares.rect(pixelX, pixelY, squareWidth, squareWidth).attr({class: "cursorBlock"})
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
			console.log(startingCoord);

			console.log(endingCoord);
			canvas.rect(80, 80, 200, 150).attr({class: this.brush});
			canvas.rect(20, 20, 200, 150).attr({class: this.brush});
			if(permanent){

			}
		}
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
			possibleBlocks = [];
			possibleBlocks.push(map.currentCoord);
			if(event.shiftKey){
				multiDrag = true;
				$themap.on('mousemove', multiDragging);
			}
			else if(event.ctrlKey){
				brushDrag = true;
				$
			}
		}
	}

	function mapMouseup(event){
		if(actOnGrid() && !didPan){
			if(multiDrag){
				$themap.unbind('mousemove', multiDragging);
				multiDrag = false;
			}
			else if(brushDrag){
				brushDrag = false;
			}
			else{

			}
		}
	}

	function multiDragging(){
		map.multiDragDisplay(possibleBlocks[0]);
	}




}

