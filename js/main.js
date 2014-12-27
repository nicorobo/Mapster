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
		this.matrix[4]+= (1-factor)*posX;
		this.matrix[5]+= (1-factor)*posY;
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

$('#map-container').on('mousemove', function(event){
	mouseMapX = event.offsetX;
	mouseMapY = event.offsetY;
});

$('#map-container').on('mousedown', function(event){
	$(this).css('cursor', 'move');
	var mouseX = event.offsetX;
	var mouseY = event.offsetY;
	$(this).on('mousemove', function(event){
		var currentX = event.offsetX;
		var currentY = event.offsetY;
		var changeX = currentX-mouseX;
		var changeY = currentY-mouseY;
		map.pan(changeX, changeY);
		mouseX = currentX;
		mouseY = currentY;
	});
})

$('#map-container').on('mouseup mouseleave', function(){
	$(this).css('cursor', '');
	$(this).unbind('mousemove');
});

$('#map-container').on('mousewheel', function(event){
	var zoomIn = event.deltaY == 1;
	if(zoomIn) map.zoom(10/9, mouseMapX, mouseMapY);
	else map.zoom(9/10, mouseMapX, mouseMapY);
});
