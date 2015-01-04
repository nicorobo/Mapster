  
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
		this.gridSet = this.g.group();
		this.$gridSquares = $('.grid-square');
		this.bounding = this.g.getBBox();
		this.width = this.bounding.width;
		this.height = this.bounding.height;
		this.markCenter()
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
			var x=0;
			var y=0;
			for(var i=0; i<this.mapArray.length; i++){
				x=0;
				for(var j=0; j<this.mapArray[i].length; j++){
					this.gridSet.rect(x, y, squareWidth, squareWidth).attr({class:"grid-square type"+this.mapArray[j][i], id:"square"+j+'-'+i})
					x+=squareWidth;
				}
				y+=squareWidth;
			}
			this.$gridSquares = $('.grid-square');
		},
		removeGrid: function(){
			this.gridSet.clear();
			$('#squareX').text('');
			$('#squareY').text('');
		}
	}

	  //////////////////////////////////////
	 ////// Initialize Mapster Object /////
	//////////////////////////////////////

	var map = new Mapster(mapImage);

	  //////////////////////////////////////
	 ////////// jQuery Variables //////////
	//////////////////////////////////////

	var $mapContainer = $('#map-container');
	var $themap = $mapContainer.find('svg');
	var $controlHandle = $('#control-handle');
	var $controlPanel = $('#control-panel');

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

	$mapContainer.on('mouseover', '.grid-square', readCoords);

	function readCoords(){
		var coords =  $(this).attr('id').slice(6).split('-');
		$('#squareX').text(parseInt(coords[0])+1);
		$('#squareY').text(parseInt(coords[1])+1);
	}



}