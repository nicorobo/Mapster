  
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
		this.width = this.bounding.width;
		this.height = this.bounding.height;
		this.markCenter();
		this.brush = 'type1';
		this.cursorSquareCoord = [0, 0];
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
			var squareWidth = this.width/sizeX;
			var dimX = sizeX;
			var dimY = sizeY || Math.ceil(this.height/squareWidth) || sizeX;
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
			var squareWidth = this.width/this.mapArray[0].length;
			var height = this.height;
			var width = this.width;
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
		drawCursorBlock: function(coordinates){
			this.cursorSquareCoord = coordinates;
			var squareWidth = this.width/this.mapArray[0].length;
			var pixelX = coordinates[0]*squareWidth;
			var pixelY = coordinates[1]*squareWidth;
			this.tempSquares.rect(pixelX, pixelY, squareWidth, squareWidth).attr({class: "cursorBlock"})
		},
		eraseCursorBlock:function(){
			this.tempSquares.clear();
		}
	}

	  //////////////////////////////////////
	 ////// Initialize Mapster Object /////
	//////////////////////////////////////

	var map = new Mapster(mapImage);
	chooseBrush('type1');

	  //////////////////////////////////////
	 ////////// jQuery Variables //////////
	//////////////////////////////////////

	var $mapContainer = $('#map-container');
	var $themap = $mapContainer.find('svg');
	var $controlHandle = $('#control-handle');
	var $controlPanel = $('#control-panel');
	var $coordX = $('#square-coordX')
	var $coordY = $('#square-coordY')
	var mapWidth = $themap.width();
	var mapHeight = $themap.height();

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
	 	mapWidth = $themap.width();
		mapHeight = $themap.height();
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

	// Buttons

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
			map.$gridSquares.hide();
		}

		function showGrid(){
			map.$gridSquares.show();
		}

	// Coordinates

		$themap.on('mouseover', '.grid-square', readCoords);
		$themap.on('mouseout', '.grid-square', emptyCoords);

		function emptyCoords(){
			$coordX.text(' ');
			$coordY.text(' ');
		}

		function readCoords(){
			var coords =  $(this).attr('id').slice(6).split('-');
			$coordX.text(parseInt(coords[0])+1);
			$coordY.text(parseInt(coords[1])+1);
		}

	// Grid Coloring

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
	$themap.on('mousemove', findCoordinates)

	function findCoordinates(event){
		if(map.mapArray.length>0){
			var gridWidth = map.mapArray[0].length;
			var gridHeight = map.mapArray.length;
			var x = Math.floor(event.offsetX/(mapWidth/gridWidth));
			var y = Math.floor(event.offsetY/(mapHeight/gridHeight));
			if(map.cursorSquareCoord[0]!=x || map.cursorSquareCoord[1]!= y){
				map.eraseCursorBlock();
				map.drawCursorBlock([x, y]);
				$coordX.text(x);
				$coordY.text(y);
			}
		}
	}
		console.log(map.width);


	  //////////////////////////////////////
	 /////////// Grid Coloring ////////////
	//////////////////////////////////////

	var multiDrag = false;
	var brushDrag = false;
	var didPan = false;
	var startingCoord;
	var squaresList = [];

	$themap.on('mousedown','.grid-square', chooseSquareDown);
	$themap.on('mouseup','.grid-square', chooseSquareUp);

	function chooseSquareDown(event){
		startingCoord =  $(this).attr('id').slice(6).split('-');
		squaresList.push(startingCoord);
			// console.log(squaresList);
		if(event.shiftKey || event.ctrlKey){
			$themap.panzoom("disable");
			$themap.on('mouseover','.grid-square', trackSquares);
			if(event.shiftKey){
				multiDrag = true;
			}else if(event.ctrlKey){
				brushDrag = true;
			}
		}
	}

	function trackSquares(event){
		// console.log(squaresList);
		var currentCoord = $(this).attr('id').slice(6).split('-');
		if(multiDrag){
			squaresList = [];
			// console.log('startX: '+startingCoord[0]+'  startY: '+startingCoord[1]+'  currentX: '+currentCoord[0]+'  currentY: '+currentCoord[1]);
			var offsetX = 0-(startingCoord[0]-currentCoord[0]);
			var offsetY = startingCoord[1]-currentCoord[1];
			// console.log('offsetX: '+offsetX+' offsetY: '+offsetY);
			if(offsetX>=0 && offsetY>=0){
				// console.log('quadI');
				for(var i=0;i<=offsetX; i++){
					for(var j=0;j>=offsetY*-1; j--){
						squaresList.push([parseInt(startingCoord[0])+i,parseInt(startingCoord[1])+j]);
					}
				}
			} else if(offsetX<=0 && offsetY>=0){
				// console.log('quadII');
				for(var i=0;i>=offsetX; i--){
					for(var j=0;j>=offsetY*-1; j--){
						squaresList.push([parseInt(startingCoord[0])+i,parseInt(startingCoord[1])+j]);
					}
				}
			}  else if(offsetX<=0 && offsetY<=0){
				// console.log('quadIII');
				for(var i=0;i>=offsetX; i--){
					for(var j=0;j<=offsetY*-1; j++){
						squaresList.push([parseInt(startingCoord[0])+i,parseInt(startingCoord[1])+j]);
					}
				}
			} else if(offsetX>=0 && offsetY<=0){
				// console.log('quadIV');
				for(var i=0;i<=offsetX; i++){
					for(var j=0;j<=offsetY*-1; j++){
						squaresList.push([parseInt(startingCoord[0])+i,parseInt(startingCoord[1])+j]);
					}
				}
			} else{
				console.log('uh oh');
			}
			map.colorSquares(squaresList);
			// console.log(squaresList);
		} else if(brushDrag){
			squaresList.push(currentCoord);
			map.colorSquares(squaresList);
		}
	}

	function chooseSquareUp(event){
		if(multiDrag || brushDrag){
			$themap.panzoom("enable");
			$themap.unbind('mouseover', trackSquares);
			if(multiDrag){
				multiDrag = false;
				console.log('You just multiDragged');
				map.colorArray(squaresList);
			} else if(brushDrag){
				brushDrag = false;
				console.log('You just brushDragged');
				map.colorSquares(squaresList);
				map.colorArray(squaresList);
			}
		}  else if(!didPan){
			map.colorSquares(squaresList);
			map.colorArray(squaresList);
		}
		squaresList = [];
	}

}