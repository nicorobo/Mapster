var Mapster = function(target){
	this.target = target;
	this.matrix = [1, 0, 0, 1, 0, 0];
	this.width = $('#map-container').width();
	this.height = $('#map-container').height();
	console.log(this.width);
}

Mapster.prototype = {
	pan: function(dx, dy){
		this.matrix[4]+= dx;
		this.matrix[5]+= dy;
		this.apply();
	},
	zoom: function(factor, posX, posY){
		for(var i=0; i<this.matrix.length; i++){
			this.matrix[i]*=factor;
		}
		posX = posX || this.width/2;
		posY = posY || this.height/2;
		console.log('posX '+posX);
		console.log('posY '+posY);
		this.matrix[4]+= (1-factor)*posX*3;
		this.matrix[5]+= (1-factor)*posY*3;
		this.apply();
	},
	reset: function(){
		this.matrix = [1, 0, 0, 1, 0, 0];
		this.apply();
	},
	apply: function(){
		var newTransformation = 'matrix('+this.matrix.join(' ')+')';
		$(this.target).attr('transform', newTransformation);
	}
}

var map = new Mapster('#map-matrix');

$('#controls').on('click', '.control', changeMap);

function changeMap(){
	var id = $(this).attr('id');
	if(id == 'reset') map.reset();
	if(id == 'zoomIn') map.zoom(3/2);
	if(id == 'zoomOut') map.zoom(2/3);
	if(id == 'up') map.pan(0, 30);
	if(id == 'down') map.pan(0, -30);
	if(id == 'left') map.pan(30, 0);
	if(id == 'right') map.pan(-30, 0);
}
var mouseMapX = '';
var mouseMapY = '';
var pastMouseMapX = '';
var pastMouseMapY = '';
var dragging = false;

$('#map-container').on('mousemove', function(event){
	mouseMapX = event.offsetX;
	mouseMapY = event.offsetY;
	if(dragging){
		var changeX = (mouseMapX-pastMouseMapX)*2;
		var changeY = (mouseMapY-pastMouseMapY)*2;
		map.pan(changeX, changeY);
	}
	pastMouseMapX = mouseMapX;
	pastMouseMapY = mouseMapY;
});

$('#map-container').on('mousedown', function(event){
	$(this).css('cursor', 'move');
	dragging=true;
});

$('#map-container').on('mouseup mouseleave', function(){
	$(this).css('cursor', '');
	dragging=false;
});

$('#map-container').on('mousewheel', function(event){
	if(event.deltaY == 1) map.zoom(10/9, mouseMapX, mouseMapY); //Zoom in
	else map.zoom(9/10, mouseMapX, mouseMapY); //Zoom out
});
